import { useCallback, useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { ConnectionBar } from "@/components/ConnectionBar";
import { DashboardView } from "@/views/DashboardView";
import { SensorsView } from "@/views/SensorsView";
import { HistoryView } from "@/views/HistoryView";
import { AlertsView } from "@/views/AlertsView";
import { useSerialConnection } from "@/hooks/useSerialConnection";
import { useAlerts } from "@/hooks/useSupabaseData";
import type { ConnectionStatus, LiveSensorData, View } from "@/types";
import { EMPTY_SENSOR_DATA } from "@/types";

function App() {
  const [view, setView] = useState<View>("dashboard");
  const [sensorData, setSensorData] = useState<LiveSensorData>(EMPTY_SENSOR_DATA);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const { alerts, refresh: refreshAlerts } = useAlerts();
  const unacknowledgedCount = alerts.filter((a) => !a.acknowledged).length;

  const handleReading = useCallback((data: LiveSensorData) => {
    setSensorData(data);
  }, []);

  const handleAlerts = useCallback(() => {
    void refreshAlerts();
  }, [refreshAlerts]);

  const { status, errorMsg, connect, disconnect, supported } = useSerialConnection(handleReading, handleAlerts);

  // Auto-refresh alerts periodically when connected
  useEffect(() => {
    if (status !== "connected") return;
    const interval = setInterval(() => void refreshAlerts(), 15000);
    return () => clearInterval(interval);
  }, [status, refreshAlerts]);

  const connected = status === "connected";

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        current={view}
        onNavigate={setView}
        alertCount={unacknowledgedCount}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <ConnectionBar
          status={status as ConnectionStatus}
          supported={supported}
          errorMsg={errorMsg}
          onConnect={() => void connect()}
          onDisconnect={() => void disconnect()}
          onToggleMobileNav={() => setMobileNavOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-6xl">
            {view === "dashboard" && <DashboardView data={sensorData} connected={connected} status={status} />}
            {view === "sensors" && <SensorsView data={sensorData} connected={connected} status={status} />}
            {view === "history" && <HistoryView />}
            {view === "alerts" && <AlertsView />}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
