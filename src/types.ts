export interface SensorReading {
  id: string;
  soil_moisture_pct: number;
  water_level_pct: number;
  rain_detected: boolean;
  tilt_detected: boolean;
  temperature: number | null;
  humidity: number | null;
  system_status: string;
  recorded_at: string;
  created_at: string;
}

export interface Alert {
  id: string;
  type: string;
  message: string;
  severity: string;
  value: string | null;
  acknowledged: boolean;
  created_at: string;
}

export type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error";

export interface LiveSensorData {
  soil_moisture_pct: number;
  water_level_pct: number;
  rain_detected: boolean;
  tilt_detected: boolean;
  temperature: number | null;
  humidity: number | null;
  system_status: string;
}

export const EMPTY_SENSOR_DATA: LiveSensorData = {
  soil_moisture_pct: 0,
  water_level_pct: 0,
  rain_detected: false,
  tilt_detected: false,
  temperature: null,
  humidity: null,
  system_status: "disconnected",
};

export type View = "dashboard" | "sensors" | "history" | "alerts";
