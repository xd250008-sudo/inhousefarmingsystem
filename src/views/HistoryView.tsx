import { RefreshCw } from "lucide-react";
import type { SensorReading } from "@/types";
import { LineChart } from "@/components/LineChart";
import { useHistory } from "@/hooks/useSupabaseData";

export function HistoryView() {
  const { readings, loading, refresh } = useHistory(50);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Sensor History</h2>
          <p className="text-sm text-gray-500">Soil moisture and water level readings from cloud storage</p>
        </div>
        <button
          onClick={() => void refresh()}
          className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <LineChart readings={readings} dataKey="soil_moisture_pct" label="Soil Moisture" unit="%" color="#10b981" />
        <LineChart readings={readings} dataKey="water_level_pct" label="Water Level" unit="%" color="#0ea5e9" />
      </div>

      {/* Recent readings table */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-3">
          <h3 className="text-sm font-semibold text-gray-700">Recent Readings</h3>
        </div>
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-400">Loading history…</div>
        ) : readings.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-400">
            No readings stored yet. Connect your Arduino and readings will be saved automatically.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs text-gray-400">
                  <th className="px-5 py-2 font-medium">Time</th>
                  <th className="px-5 py-2 font-medium">Soil Moisture</th>
                  <th className="px-5 py-2 font-medium">Water Level</th>
                  <th className="px-5 py-2 font-medium">Rain</th>
                  <th className="px-5 py-2 font-medium">Tilt</th>
                  <th className="px-5 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {readings.slice(0, 20).map((r) => (
                  <tr key={r.id} className="border-b border-gray-50 last:border-0">
                    <td className="px-5 py-2.5 text-gray-600">
                      {new Date(r.recorded_at).toLocaleString()}
                    </td>
                    <td className="px-5 py-2.5">
                      <span className={r.soil_moisture_pct < 30 ? "text-red-500 font-medium" : "text-gray-700"}>
                        {Number(r.soil_moisture_pct).toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-5 py-2.5">
                      <span className={r.water_level_pct < 20 ? "text-red-500 font-medium" : "text-gray-700"}>
                        {Number(r.water_level_pct).toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-5 py-2.5">
                      <span className={r.rain_detected ? "text-red-500 font-medium" : "text-gray-700"}>
                        {r.rain_detected ? "Detected" : "Clear"}
                      </span>
                    </td>
                    <td className="px-5 py-2.5">
                      <span className={r.tilt_detected ? "text-red-500 font-medium" : "text-gray-700"}>
                        {r.tilt_detected ? "Tilted" : "Normal"}
                      </span>
                    </td>
                    <td className="px-5 py-2.5">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                          r.system_status === "normal"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-red-50 text-red-500"
                        }`}
                      >
                        {r.system_status === "normal" ? "Normal" : "Warning"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
