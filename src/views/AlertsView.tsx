import { Bell, Check, AlertTriangle, RefreshCw, Droplets, Waves, CloudRain, Rotate3d } from "lucide-react";
import { useAlerts } from "@/hooks/useSupabaseData";

const ALERT_ICONS: Record<string, typeof Droplets> = {
  low_soil_moisture: Droplets,
  low_water_level: Waves,
  rain_detected: CloudRain,
  tilt_abnormal: Rotate3d,
};

export function AlertsView() {
  const { alerts, loading, refresh, acknowledge } = useAlerts();
  const unacknowledged = alerts.filter((a) => !a.acknowledged);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Alerts</h2>
          <p className="text-sm text-gray-500">
            {unacknowledged.length > 0
              ? `${unacknowledged.length} unacknowledged alert${unacknowledged.length > 1 ? "s" : ""}`
              : "All alerts acknowledged"}
          </p>
        </div>
        <button
          onClick={() => void refresh()}
          className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Alert rules info */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          Alert Rules
        </h3>
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Droplets className="h-4 w-4 text-blue-500" />
            Low Soil Moisture: below 30%
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Waves className="h-4 w-4 text-cyan-500" />
            Low Water Level: below 20%
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <CloudRain className="h-4 w-4 text-sky-500" />
            Rain Detected: water on rain sensor
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Rotate3d className="h-4 w-4 text-orange-500" />
            Abnormal Tilt: system is tilted
          </div>
        </div>
      </div>

      {/* Alerts list */}
      {loading ? (
        <div className="p-8 text-center text-sm text-gray-400">Loading alerts…</div>
      ) : alerts.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-8 text-center">
          <Bell className="mx-auto mb-2 h-8 w-8 text-gray-300" />
          <p className="text-sm text-gray-400">No alerts recorded yet. Alerts will appear here when sensor thresholds are crossed.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => {
            const Icon = ALERT_ICONS[alert.type] ?? Bell;
            const isCritical = alert.severity === "critical";
            return (
              <div
                key={alert.id}
                className={`flex items-start gap-4 rounded-xl border p-4 transition-opacity ${
                  alert.acknowledged ? "border-gray-100 bg-gray-50/50 opacity-60" : isCritical ? "border-red-200 bg-red-50" : "border-amber-200 bg-amber-50"
                }`}
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                    isCritical ? "bg-red-100 text-red-500" : "bg-amber-100 text-amber-500"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-700">{alert.message}</p>
                    {isCritical && (
                      <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">CRITICAL</span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-gray-400">
                    <span>{new Date(alert.created_at).toLocaleString()}</span>
                    {alert.value && <span>Value: {alert.value}</span>}
                  </div>
                </div>
                {!alert.acknowledged && (
                  <button
                    onClick={() => void acknowledge(alert.id)}
                    className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Acknowledge
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
