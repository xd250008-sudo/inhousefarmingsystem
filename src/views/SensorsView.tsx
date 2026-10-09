import { Droplets, Waves, CloudRain, Rotate3d, Thermometer, Wind, Cpu, Info } from "lucide-react";
import type { LiveSensorData, ConnectionStatus } from "@/types";
import { StatusCard } from "@/components/StatusCard";

interface SensorsViewProps {
  data: LiveSensorData;
  connected: boolean;
  status: ConnectionStatus;
}

function SensorDetail({
  icon,
  name,
  pin,
  value,
  status,
  isWarning,
  description,
}: {
  icon: React.ReactNode;
  name: string;
  pin: string;
  value: string;
  status: string;
  isWarning: boolean;
  description: string;
}) {
  return (
    <StatusCard title={name} icon={icon} isWarning={isWarning}>
      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-bold text-gray-800">{value}</span>
          <span className={`text-xs font-medium ${isWarning ? "text-red-500" : "text-emerald-600"}`}>{status}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Cpu className="h-3.5 w-3.5" />
          <span>{pin}</span>
        </div>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </StatusCard>
  );
}

export function SensorsView({ data, connected, status }: SensorsViewProps) {
  const soilWarning = connected && data.soil_moisture_pct < 30;
  const waterWarning = connected && data.water_level_pct < 20;

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 shrink-0 text-emerald-600" />
          <p className="text-sm text-emerald-800">
            These sensors are connected directly to an Arduino board. The Arduino reads sensor values and sends them
            as JSON over the USB serial connection at 9600 baud. No ESP32 or Wi-Fi module is required.
          </p>
        </div>
      </div>

      {!connected && (
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-8 text-center">
          <p className="text-sm text-gray-500">
            {status === "error"
              ? "Connection error. Check your Arduino USB connection and try again."
              : "No Arduino connected. Click \"Connect Arduino\" in the top bar to start receiving live sensor data."}
          </p>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <SensorDetail
          icon={<Droplets className="h-5 w-5" />}
          name="Soil Moisture Sensor"
          pin="Analog Pin A0"
          value={connected ? `${data.soil_moisture_pct.toFixed(1)}%` : "—"}
          status={connected ? (soilWarning ? "Low" : "Normal") : "Offline"}
          isWarning={soilWarning}
          description="Measures the moisture level in the soil. Values below 30% trigger a low moisture alert."
        />
        <SensorDetail
          icon={<Waves className="h-5 w-5" />}
          name="Ultrasonic Water Level"
          pin="Trig: D7, Echo: D8"
          value={connected ? `${data.water_level_pct.toFixed(1)}%` : "—"}
          status={connected ? (waterWarning ? "Low" : "Normal") : "Offline"}
          isWarning={waterWarning}
          description="HC-SR04 ultrasonic sensor measures water tank level. Below 20% triggers a low water alert."
        />
        <SensorDetail
          icon={<CloudRain className="h-5 w-5" />}
          name="Rain Sensor"
          pin="Digital Pin D2"
          value={connected ? (data.rain_detected ? "Water Detected" : "Clear") : "—"}
          status={connected ? (data.rain_detected ? "Warning" : "Normal") : "Offline"}
          isWarning={connected && data.rain_detected}
          description="Water detection sensor. Triggers an alert when water or rain is detected on the sensor surface."
        />
        <SensorDetail
          icon={<Rotate3d className="h-5 w-5" />}
          name="Tilt Sensor"
          pin="Digital Pin D4"
          value={connected ? (data.tilt_detected ? "Tilted" : "Normal") : "—"}
          status={connected ? (data.tilt_detected ? "Abnormal" : "Level") : "Offline"}
          isWarning={connected && data.tilt_detected}
          description="Detects if the system is tilted from its normal position. A tilt triggers a critical alert."
        />
        <SensorDetail
          icon={<Thermometer className="h-5 w-5" />}
          name="Temperature (Optional)"
          pin="Analog Pin A1"
          value={connected && data.temperature !== null ? `${data.temperature.toFixed(1)}°C` : "—"}
          status={connected ? (data.temperature !== null ? "Reading" : "Not Connected") : "Offline"}
          isWarning={false}
          description="Optional DHT11/DHT22 temperature sensor for environmental monitoring."
        />
        <SensorDetail
          icon={<Wind className="h-5 w-5" />}
          name="Humidity (Optional)"
          pin="Analog Pin A1"
          value={connected && data.humidity !== null ? `${data.humidity.toFixed(1)}%` : "—"}
          status={connected ? (data.humidity !== null ? "Reading" : "Not Connected") : "Offline"}
          isWarning={false}
          description="Optional DHT11/DHT22 humidity sensor for environmental monitoring."
        />
      </div>
    </div>
  );
}
