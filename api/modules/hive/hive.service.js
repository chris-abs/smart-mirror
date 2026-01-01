import dotenv from "dotenv";

dotenv.config();

const USERNAME = process.env.HIVE_USERNAME;
const PASSWORD = process.env.HIVE_PASSWORD;

const USE_DUMMY_DATA = !process.env.HIVE_USERNAME || !process.env.HIVE_PASSWORD;

if (USE_DUMMY_DATA) {
  console.warn(
    "[Hive] Using dummy data - HIVE_USERNAME or HIVE_PASSWORD not configured"
  );
}

const BASE_URL = "https://api.prod.bgch.com";

let sessionId = null;
let sessionExpiresAt = 0;

// Dummy data state for testing
let dummyTargetTemperature = 21.0;
const DUMMY_DEVICE_ID = "dummy-device-001";

async function authenticate() {
  if (!USERNAME || !PASSWORD) {
    throw new Error("Hive credentials are not configured");
  }

  const now = Date.now();
  if (sessionId && now < sessionExpiresAt - 60000) {
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/omniauth/sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session: {
          username: USERNAME,
          password: PASSWORD,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Hive authentication failed: ${response.status} - ${errorText}`
      );
    }

    const data = await response.json();
    sessionId = data.sessionId;
    sessionExpiresAt = Date.now() + 12 * 60 * 60 * 1000;

    console.log("[Hive] Successfully authenticated");
  } catch (error) {
    console.error("[Hive] Authentication error:", error);
    throw error;
  }
}

/**
 * Make an authenticated request to Hive API
 */
async function hiveFetch(endpoint, options = {}) {
  await authenticate();

  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-Omnia-Access-Token": sessionId,
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[Hive] API error ${response.status}:`, errorText);
    throw new Error(`Hive API error: ${response.status}`);
  }

  return response.json();
}

export async function getDevices() {
  if (USE_DUMMY_DATA) {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));
    return [
      {
        id: DUMMY_DEVICE_ID,
        name: "Living Room Thermostat",
        type: "heating",
      },
    ];
  }

  try {
    const data = await hiveFetch("/omnia/nodes");
    return data.nodes || [];
  } catch (error) {
    console.error("[Hive] getDevices error:", error);
    throw error;
  }
}

export async function getHeatingStatus(deviceId) {
  if (USE_DUMMY_DATA) {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Simulate slight temperature variation
    const baseTemp = 20.5;
    const variation = Math.sin(Date.now() / 10000) * 0.5;
    const currentTemp = Math.round((baseTemp + variation) * 10) / 10;

    return {
      deviceId: DUMMY_DEVICE_ID,
      name: "Living Room Thermostat",
      temperature: currentTemp,
      targetTemperature: dummyTargetTemperature,
      mode: "MANUAL",
      isHeating: currentTemp < dummyTargetTemperature,
      isOnline: true,
    };
  }

  try {
    const data = await hiveFetch(`/omnia/nodes/${deviceId}`);
    return {
      deviceId: data.id,
      name: data.name,
      temperature: data.state?.temperature,
      targetTemperature: data.state?.target,
      mode: data.state?.mode,
      isHeating: data.state?.heating,
      isOnline: data.state?.online,
    };
  } catch (error) {
    console.error("[Hive] getHeatingStatus error:", error);
    throw error;
  }
}

export async function setTemperature(deviceId, temperature) {
  if (typeof temperature !== "number" || temperature < 5 || temperature > 30) {
    throw new Error("Temperature must be a number between 5 and 30");
  }

  if (USE_DUMMY_DATA) {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));
    dummyTargetTemperature = temperature;
    console.log(`[Hive] Dummy data: Set target temperature to ${temperature}°`);
    return { ok: true, temperature };
  }

  try {
    const data = await hiveFetch(`/omnia/nodes/${deviceId}`, {
      method: "PUT",
      body: JSON.stringify({
        nodes: [
          {
            id: deviceId,
            target: temperature,
          },
        ],
      }),
    });
    return { ok: true, temperature };
  } catch (error) {
    console.error("[Hive] setTemperature error:", error);
    throw error;
  }
}

export async function setMode(deviceId, mode) {
  const validModes = ["MANUAL", "SCHEDULE", "BOOST", "OFF"];
  if (!validModes.includes(mode.toUpperCase())) {
    throw new Error(`Mode must be one of: ${validModes.join(", ")}`);
  }

  if (USE_DUMMY_DATA) {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));
    console.log(`[Hive] Dummy data: Set mode to ${mode.toUpperCase()}`);
    return { ok: true, mode: mode.toUpperCase() };
  }

  try {
    const data = await hiveFetch(`/omnia/nodes/${deviceId}`, {
      method: "PUT",
      body: JSON.stringify({
        nodes: [
          {
            id: deviceId,
            mode: mode.toUpperCase(),
          },
        ],
      }),
    });
    return { ok: true, mode: mode.toUpperCase() };
  } catch (error) {
    console.error("[Hive] setMode error:", error);
    throw error;
  }
}
