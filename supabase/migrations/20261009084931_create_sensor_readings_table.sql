/*
# Create sensor readings and alerts tables (single-tenant, no auth)

1. New Tables
- `sensor_readings`
  - `id` (uuid, primary key)
  - `soil_moisture_pct` (numeric, 0-100, soil moisture percentage)
  - `water_level_pct` (numeric, 0-100, water tank level percentage from ultrasonic)
  - `rain_detected` (boolean, true if rain/water detected by rain sensor)
  - `tilt_detected` (boolean, true if tilt sensor is tilted)
  - `temperature` (numeric, nullable, optional environmental reading in °C)
  - `humidity` (numeric, nullable, optional environmental reading in %)
  - `system_status` (text, overall system status: normal or warning)
  - `recorded_at` (timestamptz, when the reading was taken)
  - `created_at` (timestamptz, when the row was inserted)
- `alerts`
  - `id` (uuid, primary key)
  - `type` (text, alert type: low_soil_moisture, low_water_level, rain_detected, tilt_abnormal)
  - `message` (text, human-readable alert message)
  - `severity` (text, warning or critical)
  - `value` (text, optional value that triggered the alert)
  - `acknowledged` (boolean, default false)
  - `created_at` (timestamptz, when the alert was generated)

2. Indexes
- `idx_sensor_readings_recorded_at` on `sensor_readings(recorded_at DESC)` for history queries
- `idx_alerts_created_at` on `alerts(created_at DESC)` for recent alerts
- `idx_alerts_acknowledged` on `alerts(acknowledged)` for filtering unacknowledged

3. Security
- Enable RLS on both tables.
- Allow anon + authenticated CRUD because the app has no sign-in (single-tenant, intentionally public).
*/

CREATE TABLE IF NOT EXISTS sensor_readings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  soil_moisture_pct numeric(5,2) NOT NULL,
  water_level_pct numeric(5,2) NOT NULL,
  rain_detected boolean NOT NULL DEFAULT false,
  tilt_detected boolean NOT NULL DEFAULT false,
  temperature numeric(5,2),
  humidity numeric(5,2),
  system_status text NOT NULL DEFAULT 'normal',
  recorded_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  message text NOT NULL,
  severity text NOT NULL DEFAULT 'warning',
  value text,
  acknowledged boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sensor_readings_recorded_at ON sensor_readings (recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_acknowledged ON alerts (acknowledged);

ALTER TABLE sensor_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- sensor_readings policies (single-tenant, no auth, intentionally public)
DROP POLICY IF EXISTS "anon_select_sensor_readings" ON sensor_readings;
CREATE POLICY "anon_select_sensor_readings" ON sensor_readings FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_sensor_readings" ON sensor_readings;
CREATE POLICY "anon_insert_sensor_readings" ON sensor_readings FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_sensor_readings" ON sensor_readings;
CREATE POLICY "anon_delete_sensor_readings" ON sensor_readings FOR DELETE
TO anon, authenticated USING (true);

-- alerts policies (single-tenant, no auth, intentionally public)
DROP POLICY IF EXISTS "anon_select_alerts" ON alerts;
CREATE POLICY "anon_select_alerts" ON alerts FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_alerts" ON alerts;
CREATE POLICY "anon_insert_alerts" ON alerts FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_alerts" ON alerts;
CREATE POLICY "anon_update_alerts" ON alerts FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_alerts" ON alerts;
CREATE POLICY "anon_delete_alerts" ON alerts FOR DELETE
TO anon, authenticated USING (true);
