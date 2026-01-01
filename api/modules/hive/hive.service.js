import dotenv from "dotenv";

dotenv.config();

const USERNAME = process.env.HIVE_USERNAME;
const PASSWORD = process.env.HIVE_PASSWORD;

if (!USERNAME || !PASSWORD) {
  console.warn("[Hive] Missing HIVE_USERNAME or HIVE_PASSWORD in .env");
}

const BASE_URL = "https://api.prod.bgch.com";

let sessionId = null;
let sessionExpiresAt = 0;

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
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(`Network error connecting to Hive API: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Make an authenticated request to Hive API
 */
async function hiveFetch(endpoint, options = {}) {
  try {
    await authenticate();
  } catch (error) {
    throw new Error(`Authentication failed: ${error.message}`);
  }

  const url = `${BASE_URL}${endpoint}`;
  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "X-Omnia-Access-Token": sessionId,
        ...(options.headers || {}),
      },
    });
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(`Network error: ${error.message}`);
    }
    throw error;
  }

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[Hive] API error ${response.status}:`, errorText);
    throw new Error(`Hive API error ${response.status}: ${errorText}`);
  }

  return response.json();
}

export async function getDevices() {
  try {
    const data = await hiveFetch("/omnia/nodes");
    return data.nodes || [];
  } catch (error) {
    console.error("[Hive] getDevices error:", error);
    throw error;
  }
}

export async function getHeatingStatus(deviceId) {
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

  try {
    await hiveFetch(`/omnia/nodes/${deviceId}`, {
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

  try {
    await hiveFetch(`/omnia/nodes/${deviceId}`, {
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
