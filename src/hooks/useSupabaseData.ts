import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { SensorReading, Alert } from "@/types";

export function useHistory(limit = 50) {
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("sensor_readings")
      .select("*")
      .order("recorded_at", { ascending: false })
      .limit(limit);
    if (!error && data) {
      setReadings(data as SensorReading[]);
    }
    setLoading(false);
  }, [limit]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { readings, loading, refresh };
}

export function useAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("alerts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (!error && data) {
      setAlerts(data as Alert[]);
    }
    setLoading(false);
  }, []);

  const acknowledge = useCallback(async (id: string) => {
    await supabase.from("alerts").update({ acknowledged: true }).eq("id", id);
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a)));
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { alerts, loading, refresh, acknowledge };
}
