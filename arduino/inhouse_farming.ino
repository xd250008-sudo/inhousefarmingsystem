/*
  InHouse Farming System - Arduino Sensor Reader
  ================================================

  Reads from 4 sensors and sends JSON data over USB serial at 9600 baud.
  Compatible with the Web Serial API connection in the web dashboard.

  Sensors and Pin Connections:
  ----------------------------
  1. Soil Moisture Sensor  -> Analog pin A0
  2. Rain Sensor (Digital)  -> Digital pin D2
  3. Tilt Sensor            -> Digital pin D4
  4. Ultrasonic HC-SR04     -> Trig: D7, Echo: D8

  Optional: DHT11/DHT22 Temperature & Humidity Sensor -> Digital pin D5
  (Uncomment the DHT code sections if you have this sensor)

  Required Libraries:
  - None for basic 4 sensors
  - DHT sensor library (by Adafruit) if using optional DHT sensor

  Wiring:
  - Soil moisture: VCC -> 5V, GND -> GND, A0 -> A0
  - Rain sensor:   VCC -> 5V, GND -> GND, D0 -> D2 (digital output)
  - Tilt sensor:   One pin -> D4, other -> GND (use internal pull-up)
  - Ultrasonic:    VCC -> 5V, GND -> GND, Trig -> D7, Echo -> D8
  - DHT (optional): VCC -> 5V, GND -> GND, DATA -> D5

  Upload this sketch to your Arduino, then connect via the website
  using Chrome or Edge with Web Serial API support.
*/

// ---- Pin Definitions ----
const int SOIL_MOISTURE_PIN = A0;
const int RAIN_SENSOR_PIN = 2;
const int TILT_SENSOR_PIN = 4;
const int ULTRASONIC_TRIG_PIN = 7;
const int ULTRASONIC_ECHO_PIN = 8;

// Optional DHT sensor
// #define DHT_TYPE DHT11
// const int DHT_PIN = 5;

// ---- Ultrasonic calibration (adjust for your tank) ----
// Measure the distance (in cm) from the sensor to the maximum water level
const float TANK_FULL_DISTANCE_CM = 5.0;   // distance when tank is full
const float TANK_EMPTY_DISTANCE_CM = 30.0; // distance when tank is empty

// ---- Soil moisture calibration (adjust for your sensor) ----
const int SOIL_DRY_VALUE = 1023;   // analog reading when sensor is in dry air
const int SOIL_WET_VALUE = 400;    // analog reading when sensor is submerged in water

// ---- Timing ----
const unsigned long READ_INTERVAL_MS = 2000; // send readings every 2 seconds
unsigned long lastReadTime = 0;

void setup() {
  Serial.begin(9600);
  while (!Serial) {
    ; // wait for serial port to connect (needed for native USB boards)
  }

  pinMode(RAIN_SENSOR_PIN, INPUT);
  pinMode(TILT_SENSOR_PIN, INPUT_PULLUP);
  pinMode(ULTRASONIC_TRIG_PIN, OUTPUT);
  pinMode(ULTRASONIC_ECHO_PIN, INPUT);

  // Uncomment if using DHT sensor
  // dht.begin();
}

void loop() {
  unsigned long now = millis();
  if (now - lastReadTime >= READ_INTERVAL_MS) {
    lastReadTime = now;
    sendSensorData();
  }
}

void sendSensorData() {
  // Read soil moisture as percentage
  int soilRaw = analogRead(SOIL_MOISTURE_PIN);
  float soilPct = mapToPercentage(soilRaw, SOIL_DRY_VALUE, SOIL_WET_VALUE);

  // Read rain sensor (digital: LOW = water detected, HIGH = dry on most modules)
  bool rainDetected = (digitalRead(RAIN_SENSOR_PIN) == LOW);

  // Read tilt sensor (LOW = tilted when using pull-up)
  bool tiltDetected = (digitalRead(TILT_SENSOR_PIN) == LOW);

  // Read water level from ultrasonic
  float waterPct = readWaterLevel();

  // Build JSON string
  // The website parses this JSON format from each line of serial output
  Serial.print("{\"soil_moisture_pct\":");
  Serial.print(soilPct, 1);
  Serial.print(",\"water_level_pct\":");
  Serial.print(waterPct, 1);
  Serial.print(",\"rain_detected\":");
  Serial.print(rainDetected ? "true" : "false");
  Serial.print(",\"tilt_detected\":");
  Serial.print(tiltDetected ? "true" : "false");

  // Optional: Uncomment if using a DHT sensor
  // float temp = dht.readTemperature();
  // float hum = dht.readHumidity();
  // if (!isnan(temp)) {
  //   Serial.print(",\"temperature\":");
  //   Serial.print(temp, 1);
  // }
  // if (!isnan(hum)) {
  //   Serial.print(",\"humidity\":");
  //   Serial.print(hum, 1);
  // }

  Serial.println("}");
}

float readWaterLevel() {
  // Trigger ultrasonic pulse
  digitalWrite(ULTRASONIC_TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(ULTRASONIC_TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(ULTRASONIC_TRIG_PIN, LOW);

  // Read echo duration (timeout after 30ms = ~5m max range)
  long duration = pulseIn(ULTRASONIC_ECHO_PIN, HIGH, 30000);
  if (duration == 0) return 0.0; // no echo received

  // Convert duration to distance in cm
  float distance = (duration * 0.0343) / 2.0;

  // Map distance to percentage (closer = more water)
  float pct = ((TANK_EMPTY_DISTANCE_CM - distance) / (TANK_EMPTY_DISTANCE_CM - TANK_FULL_DISTANCE_CM)) * 100.0;
  if (pct < 0) pct = 0;
  if (pct > 100) pct = 100;
  return pct;
}

float mapToPercentage(int raw, int dryValue, int wetValue) {
  // Invert: higher analog reading = drier soil
  float pct = (float)(dryValue - raw) / (float)(dryValue - wetValue) * 100.0;
  if (pct < 0) pct = 0;
  if (pct > 100) pct = 100;
  return pct;
}
