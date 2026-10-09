# InHouse Farming System

A web-based dashboard for monitoring indoor farming conditions using an Arduino connected via USB. The dashboard reads live sensor data through the Web Serial API and displays it in real-time.

## Features

- **Live Dashboard** — Real-time sensor cards for soil moisture, water level, rain detection, and tilt status
- **Sensors View** — Detailed sensor information with pin mappings and descriptions
- **History** — Line charts for soil moisture and water level trends, stored in Supabase cloud database
- **Alerts** — Automatic alerts for low soil moisture, low water level, rain detection, and abnormal tilt
- **Web Serial API** — Direct USB serial connection to Arduino, no backend server required

## Sensors Supported

| Sensor | Type | Arduino Pin |
|---|---|---|
| Soil Moisture Sensor | Analog | A0 |
| Rain/Water Detection Sensor | Digital | D2 |
| Tilt Sensor | Digital (pull-up) | D4 |
| Ultrasonic HC-SR04 (water tank level) | Digital | Trig: D7, Echo: D8 |
| DHT11/DHT22 Temperature & Humidity (optional) | Digital | D5 |

> No ESP32 or Wi-Fi module required. The Arduino connects to your computer via standard USB cable.

---

## Setup Instructions

### 1. Arduino Setup

1. Open the `arduino/inhouse_farming.ino` file in the Arduino IDE.
2. Wire your sensors to the Arduino as described in the table above and the comments in the sketch.
3. Adjust the calibration values at the top of the sketch:
   - `TANK_FULL_DISTANCE_CM` and `TANK_EMPTY_DISTANCE_CM` — Measure the distance from your ultrasonic sensor to the water surface when the tank is full and empty.
   - `SOIL_DRY_VALUE` and `SOIL_WET_VALUE` — Check the serial monitor for raw analog readings in dry air vs. submerged in water, and update these values.
4. If using a DHT temperature/humidity sensor, install the **DHT sensor library by Adafruit** via Library Manager, and uncomment the DHT-related code sections in the sketch.
5. Upload the sketch to your Arduino.
6. Open the Serial Monitor in the Arduino IDE (Tools > Serial Monitor) to verify you see JSON output like:
   ```json
   {"soil_moisture_pct":45.2,"water_level_pct":78.5,"rain_detected":false,"tilt_detected":false}
   ```
7. **Close the Serial Monitor** before connecting from the website — the Web Serial API needs exclusive access to the serial port.

### 2. Website Setup

1. Install dependencies: `npm install`
2. Start the dev server: `npm run dev`
3. Open the website in **Google Chrome** or **Microsoft Edge** (Web Serial API is not supported in Firefox or Safari).
4. Click **"Connect Arduino"** in the top bar.
5. Select your Arduino's serial port from the browser prompt.
6. The dashboard will display live sensor readings as they arrive.

### 3. Browser Requirements

- **Chrome** version 78+ or **Edge** version 79+ on desktop (Windows, macOS, Linux, or ChromeOS)
- Web Serial API is not available on mobile browsers
- The Arduino must be connected via USB (not a USB hub with other devices using the same port)
- No other program (Arduino IDE Serial Monitor, etc.) should be using the serial port when connecting from the website

---

## Arduino JSON Format

The Arduino sends one JSON object per line over serial at 9600 baud. Each line is a complete JSON object terminated by a newline character (`\n`):

```json
{"soil_moisture_pct":45.2,"water_level_pct":78.5,"rain_detected":false,"tilt_detected":false}
```

### Fields

| Field | Type | Description |
|---|---|---|
| `soil_moisture_pct` | number (0-100) | Soil moisture percentage |
| `water_level_pct` | number (0-100) | Water tank level percentage from ultrasonic sensor |
| `rain_detected` | boolean | `true` if water/rain detected, `false` if clear |
| `tilt_detected` | boolean | `true` if system is tilted, `false` if level |
| `temperature` | number (optional) | Temperature in °C (if DHT sensor connected) |
| `humidity` | number (optional) | Humidity percentage (if DHT sensor connected) |

The website also accepts alternative field names: `soilMoisture`, `waterLevel`, `rainDetected`, `tiltDetected`, and `temp`.

---

## Database Schema (Supabase)

Sensor readings and alerts are stored in Supabase PostgreSQL for history and persistence. The database is configured automatically — no manual setup needed.

### Tables

**`sensor_readings`** — Stores every sensor reading received from the Arduino:

| Column | Type | Description |
|---|---|---|
| `id` | uuid | Primary key |
| `soil_moisture_pct` | numeric(5,2) | Soil moisture percentage |
| `water_level_pct` | numeric(5,2) | Water tank level percentage |
| `rain_detected` | boolean | Rain/water detection state |
| `tilt_detected` | boolean | Tilt detection state |
| `temperature` | numeric(5,2) | Temperature reading (nullable) |
| `humidity` | numeric(5,2) | Humidity reading (nullable) |
| `system_status` | text | Overall status: "normal" or "warning" |
| `recorded_at` | timestamptz | When the reading was taken |
| `created_at` | timestamptz | When the row was inserted |

**`alerts`** — Stores alerts generated when sensor thresholds are crossed:

| Column | Type | Description |
|---|---|---|
| `id` | uuid | Primary key |
| `type` | text | Alert type (low_soil_moisture, low_water_level, rain_detected, tilt_abnormal) |
| `message` | text | Human-readable alert message |
| `severity` | text | "warning" or "critical" |
| `value` | text | Value that triggered the alert |
| `acknowledged` | boolean | Whether the user has acknowledged the alert |
| `created_at` | timestamptz | When the alert was generated |

### Alert Thresholds

- **Low Soil Moisture**: below 30%
- **Low Water Level**: below 20%
- **Rain Detected**: any water on the rain sensor
- **Abnormal Tilt**: tilt sensor reports tilted position (severity: critical)

---

## Project Structure

```
src/
  components/        # Reusable UI components (Sidebar, ConnectionBar, cards, charts)
  hooks/             # Custom hooks (serial connection, Supabase data fetching)
  lib/               # Supabase client and Web Serial API helpers
  types/             # TypeScript type definitions
  views/             # Page-level views (Dashboard, Sensors, History, Alerts)
arduino/
  inhouse_farming.ino  # Arduino sketch for sensor reading and JSON serial output
```

## Important Notes

- **No demo data is shown as real readings.** The dashboard only shows actual sensor values received from the Arduino over the USB serial connection.
- **No login, payments, or AI features** — the app is intentionally simple and beginner-friendly.
- **Live readings work locally** through USB serial even without Supabase. Supabase is used for cloud storage of history and alerts.
- **No Node.js/Express backend** — the frontend communicates directly with the Arduino via Web Serial API and with Supabase via the JavaScript client.
