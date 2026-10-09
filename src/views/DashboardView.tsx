import { Droplets, Waves, CloudRain, Rotate3d, Thermometer, Wind, Activity } from "lucide-react";
import type { LiveSensorData, ConnectionStatus } from "@/types";
import { StatusCard } from "@/components/StatusCard";

interface DashboardProps {
  data: LiveSensorData;
  connected: boolean;
  status: ConnectionStatus;
}

function ProgressBar({ value, isWarning }: { value: number; isWarning: boolean }) {
  return (
    <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
      <div
        className={`h-full rounded-full transition-all duration-500 ${
          isWarning ? "bg-red-500" : "bg-emerald-500"
        }`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

export function DashboardView({ data, connected, status }: DashboardProps) {
  const soilWarning = data.soil_moisture_pct < 30;
  const waterWarning = data.water_level_pct < 20;

  return (
    <div className="space-y-5">
      {/* System status banner */}
      <div
        className={`flex items-center gap-3 rounded-2xl p-4 ${
          connected
            ? data.system_status === "normal"
              ? "bg-emerald-50 border border-emerald-200"
              : "bg-red-50 border border-red-200"
            : "bg-gray-50 border border-gray-200"
        }`}
      >
        <Activity
          className={`h-5 w-5 ${
            connected
              ? data.system_status === "normal"
                ? "text-emerald-600"
                : "text-red-500"
              : "text-gray-400"
          }`}
        />
        <div>
          <p className="text-sm font-semibold text-gray-700">
            System Status: {connected ? (data.system_status === "normal" ? "Normal" : "Warning") : "Awaiting Connection"}
          </p>
          <p className="text-xs text-gray-500">
            {connected
              ? data.system_status === "normal"
                ? "All sensors are reading within normal range."
                : "One or more sensors are reporting abnormal readings."
              : status === "error"
                ? "Connection error. Check your Arduino and try again."
                : "Connect your Arduino via USB to see live sensor readings."}
          </p>
        </div>
      </div>

      {/* Sensor cards */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <StatusCard title="Soil Moisture" icon={<Droplets className="h-5 w-5" />} isWarning={connected && soilWarning}>
          <div className="flex items-end justify-between">
            <span className={`text-3xl font-bold ${connected && soilWarning ? "text-red-500" : "text-gray-800"}`}>
              {connected ? `${data.soil_moisture_pct.toFixed(1)}%` : "—"}
            </span>
            <span className={`text-xs font-medium ${connected && soilWarning ? "text-red-500" : "text-emerald-600"}`}>
              {connected ? (soilWarning ? "Low" : "Normal") : ""}
            </span>
          </div>
          {connected && <div className="mt-3"><ProgressBar value={data.soil_moisture_pct} isWarning={soilWarning} /></div>}
        </StatusCard>

        <StatusCard title="Water Level" icon={<Waves className="h-5 w-5" />} isWarning={connected && waterWarning}>
          <div className="flex items-end justify-between">
            <span className={`text-3xl font-bold ${connected && waterWarning ? "text-red-500" : "text-gray-800"}`}>
              {connected ? `${data.water_level_pct.toFixed(1)}%` : "—"}
            </span>
            <span className={`text-xs font-medium ${connected && waterWarning ? "text-red-500" : "text-emerald-600"}`}>
              {connected ? (waterWarning ? "Low" : "Normal") : ""}
            </span>
          </div>
          {connected && <div className="mt-3"><ProgressBar value={data.water_level_pct} isWarning={waterWarning} /></div>}
        </StatusCard>

        <StatusCard title="Rain Sensor" icon={<CloudRain className="h-5 w-5" />} isWarning={connected && data.rain_detected}>
          <div className="flex items-end justify-between">
            <span className={`text-3xl font-bold ${connected && data.rain_detected ? "text-red-500" : "text-gray-800"}`}>
              {connected ? (data.rain_detected ? "Detected" : "Clear") : "—"}
            </span>
            <span className={`text-xs font-medium ${connected && data.rain_detected ? "text-red-500" : "text-emerald-600"}`}>
              {connected ? (data.rain_detected ? "Water Detected" : "No Water") : ""}
            </span>
          </div>
          {connected && (
            <div className="mt-3 flex items-center gap-2">
              <span className={`inline-block h-2.5 w-2.5 rounded-full ${data.rain_detected ? "bg-red-500" : "bg-emerald-500"}`} />
              <span className="text-xs text-gray-500">{data.rain_detected ? "Water on sensor surface" : "Surface is dry"}</span>
            </div>
          )}
        </StatusCard>

        <StatusCard title="Tilt Sensor" icon={<Rotate3d className="h-5 w-5" />} isWarning={connected && data.tilt_detected}>
          <div className="flex items-end justify-between">
            <span className={`text-3xl font-bold ${connected && data.tilt_detected ? "text-red-500" : "text-gray-800"}`}>
              {connected ? (data.tilt_detected ? "Tilted" : "Normal") : "—"}
            </span>
            <span className={`text-xs font-medium ${connected && data.tilt_detected ? "text-red-500" : "text-emerald-600"}`}>
              {connected ? (data.tilt_detected ? "Abnormal" : "Level") : ""}
            </span>
          </div>
          {connected && (
            <div className="mt-3 flex items-center gap-2">
              <span className={`inline-block h-2.5 w-2.5 rounded-full ${data.tilt_detected ? "bg-red-500" : "bg-emerald-500"}`} />
              <span className="text-xs text-gray-500">{data.tilt_detected ? "Unit is tilted" : "Unit is level"}</span>
            </div>
          )}
        </StatusCard>

        <StatusCard title="Temperature" icon={<Thermometer className="h-5 w-5" />} isWarning={false}>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-bold text-gray-800">
              {connected && data.temperature !== null ? `${data.temperature.toFixed(1)}°C` : "—"}
            </span>
            <span className="text-xs font-medium text-emerald-600">
              {connected && data.temperature !== null ? "Environmental" : ""}
            </span>
          </div>
          {connected && (
            <p className="mt-3 text-xs text-gray-500">
              {data.temperature !== null ? "Reading available" : "No temperature sensor connected"}
            </p>
          )}
        </StatusCard>

        <StatusCard title="Humidity" icon={<Wind className="h-5 w-5" />} isWarning={false}>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-bold text-gray-800">
              {connected && data.humidity !== null ? `${data.humidity.toFixed(1)}%` : "—"}
            </span>
            <span className="text-xs font-medium text-emerald-600">
              {connected && data.humidity !== null ? "Environmental" : ""}
            </span>
          </div>
          {connected && (
            <p className="mt-3 text-xs text-gray-500">
              {data.humidity !== null ? "Reading available" : "No humidity sensor connected"}
            </p>
          )}
        </StatusCard>
      </div>

      {/* Environmental monitoring summary */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-gray-700">Environmental Monitoring Summary</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Soil Moisture", value: connected ? `${data.soil_moisture_pct.toFixed(1)}%` : "N/A", ok: !soilWarning },
            { label: "Water Level", value: connected ? `${data.water_level_pct.toFixed(1)}%` : "N/A", ok: !waterWarning },
            { label: "Rain", value: connected ? (data.rain_detected ? "Detected" : "Clear") : "N/A", ok: !data.rain_detected },
            { label: "Tilt", value: connected ? (data.tilt_detected ? "Tilted" : "Normal") : "N/A", ok: !data.tilt_detected },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
              <span className="text-xs text-gray-500">{item.label}</span>
              <span
                className={`text-sm font-semibold ${
                  connected ? (item.ok ? "text-emerald-600" : "text-red-500") : "text-gray-400"
                }`}
              >
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
