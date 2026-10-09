import { useCallback, useRef, useState } from "react";
import type { ConnectionStatus, LiveSensorData } from "@/types";
import { EMPTY_SENSOR_DATA } from "@/types";
import { isWebSerialSupported, type SerialPortLike, type NavigatorWithSerial } from "@/lib/serial";
import { supabase } from "@/lib/supabase";

const BAUD_RATE = 9600;
const THRESHOLDS = {
  lowSoilMoisture: 30,
  lowWaterLevel: 20,
};

type ReadCallback = (data: LiveSensorData) => void;

function computeStatus(data: Omit<LiveSensorData, "system_status">): string {
  const issues: string[] = [];
  if (data.soil_moisture_pct < THRESHOLDS.lowSoilMoisture) issues.push("low soil moisture");
  if (data.water_level_pct < THRESHOLDS.lowWaterLevel) issues.push("low water level");
  if (data.rain_detected) issues.push("rain detected");
  if (data.tilt_detected) issues.push("tilt abnormal");
  return issues.length === 0 ? "normal" : "warning";
}

function parseLine(line: string): LiveSensorData | null {
  try {
    const obj = JSON.parse(line);
    if (typeof obj.soil_moisture_pct !== "number" && typeof obj.soilMoisture !== "number") return null;
    const soil = typeof obj.soil_moisture_pct === "number" ? obj.soil_moisture_pct : obj.soilMoisture;
    const water = typeof obj.water_level_pct === "number" ? obj.water_level_pct : (obj.waterLevel ?? 0);
    const rain = typeof obj.rain_detected === "boolean" ? obj.rain_detected : (obj.rainDetected ?? false);
    const tilt = typeof obj.tilt_detected === "boolean" ? obj.tilt_detected : (obj.tiltDetected ?? false);
    const temperature = typeof obj.temperature === "number" ? obj.temperature : (obj.temp ?? null);
    const humidity = typeof obj.humidity === "number" ? obj.humidity : null;

    const raw = { soil_moisture_pct: soil, water_level_pct: water, rain_detected: rain, tilt_detected: tilt, temperature, humidity };
    return { ...raw, system_status: computeStatus(raw) };
  } catch {
    return null;
  }
}

async function persistReading(data: LiveSensorData) {
  try {
    await supabase.from("sensor_readings").insert({
      soil_moisture_pct: data.soil_moisture_pct,
      water_level_pct: data.water_level_pct,
      rain_detected: data.rain_detected,
      tilt_detected: data.tilt_detected,
      temperature: data.temperature,
      humidity: data.humidity,
      system_status: data.system_status,
      recorded_at: new Date().toISOString(),
    });
  } catch {
    // Supabase persistence is best-effort; live reading display continues
  }
}

async function persistAlerts(data: LiveSensorData) {
  const alerts: { type: string; message: string; severity: string; value: string }[] = [];
  if (data.soil_moisture_pct < THRESHOLDS.lowSoilMoisture) {
    alerts.push({ type: "low_soil_moisture", message: `Soil moisture is low at ${data.soil_moisture_pct.toFixed(1)}%`, severity: "warning", value: `${data.soil_moisture_pct.toFixed(1)}%` });
  }
  if (data.water_level_pct < THRESHOLDS.lowWaterLevel) {
    alerts.push({ type: "low_water_level", message: `Water tank level is low at ${data.water_level_pct.toFixed(1)}%`, severity: "warning", value: `${data.water_level_pct.toFixed(1)}%` });
  }
  if (data.rain_detected) {
    alerts.push({ type: "rain_detected", message: "Rain or water detected by rain sensor", severity: "warning", value: "detected" });
  }
  if (data.tilt_detected) {
    alerts.push({ type: "tilt_abnormal", message: "Abnormal tilt detected by tilt sensor", severity: "critical", value: "tilted" });
  }
  if (alerts.length === 0) return;
  try {
    await supabase.from("alerts").insert(alerts);
  } catch {
    // best-effort
  }
}

export function useSerialConnection(onReading: ReadCallback, onAlerts: (data: LiveSensorData) => void) {
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const portRef = useRef<SerialPortLike | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);
  const keepReadingRef = useRef(false);

  const connect = useCallback(async () => {
    if (!isWebSerialSupported()) {
      setStatus("error");
      setErrorMsg("Web Serial API is not supported in this browser. Use Chrome or Edge on desktop.");
      return;
    }
    setStatus("connecting");
    setErrorMsg("");
    try {
      const nav = navigator as NavigatorWithSerial;
      const port = await nav.serial!.requestPort();
      await port.open({ baudRate: BAUD_RATE });
      portRef.current = port;
      keepReadingRef.current = true;
      setStatus("connected");

      const decoder = new TextDecoder();
      let buffer = "";
      const reader = port.readable!.getReader();
      readerRef.current = reader;

      (async () => {
        while (keepReadingRef.current) {
          try {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            let idx: number;
            while ((idx = buffer.indexOf("\n")) >= 0) {
              const line = buffer.slice(0, idx).trim();
              buffer = buffer.slice(idx + 1);
              if (!line) continue;
              const parsed = parseLine(line);
              if (parsed) {
                onReading(parsed);
                onAlerts(parsed);
                void persistReading(parsed);
                void persistAlerts(parsed);
              }
            }
          } catch {
            break;
          }
        }
      })();
    } catch (err) {
      setStatus("error");
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg.includes("cancel") || msg.includes("No port selected") ? "Connection cancelled" : msg);
    }
  }, [onReading, onAlerts]);

  const disconnect = useCallback(async () => {
    keepReadingRef.current = false;
    try {
      if (readerRef.current) {
        await readerRef.current.cancel().catch(() => {});
        readerRef.current.releaseLock();
        readerRef.current = null;
      }
      if (portRef.current) {
        await portRef.current.close();
        portRef.current = null;
      }
    } catch {
      // ignore
    }
    setStatus("disconnected");
    onReading(EMPTY_SENSOR_DATA);
  }, [onReading]);

  return { status, errorMsg, connect, disconnect, supported: isWebSerialSupported() };
}
