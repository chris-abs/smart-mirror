import dotenv from "dotenv";
import { createRequire } from "module";

dotenv.config();

const require = createRequire(import.meta.url);
const { Hivehome } = require("node-hivehome");

const USERNAME = process.env.HIVE_USERNAME;
const PASSWORD = process.env.HIVE_PASSWORD;

if (!USERNAME || !PASSWORD) {
  console.warn("[Hive] Missing HIVE_USERNAME or HIVE_PASSWORD in .env");
}

let hiveInstance = null;
let isAuthenticated = false;

async function getHiveInstance() {
  if (!USERNAME || !PASSWORD) {
    throw new Error("Hive credentials are not configured");
  }

  if (!hiveInstance) {
    hiveInstance = new Hivehome(USERNAME);
  }

  if (!isAuthenticated) {
    try {
      const result = await hiveInstance.auth.login(PASSWORD);
      console.log("[Hive] Login result:", result);
      isAuthenticated = true;
      console.log("[Hive] Successfully authenticated");
    } catch (error) {
      console.error("[Hive] Authentication error details:", {
        message: error.message,
        stack: error.stack,
        error: error,
      });
      isAuthenticated = false;
      hiveInstance = null;
      throw new Error(`Hive authentication failed: ${error.message}`);
    }
  }

  return hiveInstance;
}

export async function getDevices() {
  try {
    const hive = await getHiveInstance();
    const heatingData = await hive.heating.get();

    if (!heatingData || !Array.isArray(heatingData)) {
      return [];
    }

    return heatingData.map((device) => ({
      id: device.id || device.deviceId,
      name: device.name || "Hive Device",
      type: "heating",
    }));
  } catch (error) {
    console.error("[Hive] getDevices error:", error);
    throw error;
  }
}

export async function getHeatingStatus(deviceId) {
  try {
    const hive = await getHiveInstance();
    const heatingData = await hive.heating.get();

    const device = Array.isArray(heatingData)
      ? heatingData.find((d) => (d.id || d.deviceId) === deviceId)
      : heatingData;

    if (!device) {
      throw new Error(`Device ${deviceId} not found`);
    }

    return {
      deviceId: device.id || device.deviceId,
      name: device.name || "Hive Device",
      temperature: device.temperature,
      targetTemperature: device.target,
      mode: device.mode,
      isHeating: device.heating,
      isOnline: device.online !== false,
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
    const hive = await getHiveInstance();
    await hive.heating.setTargetTemperature(deviceId, temperature);
    return { ok: true, temperature };
  } catch (error) {
    console.error("[Hive] setTemperature error:", error);
    throw error;
  }
}

export async function setMode(deviceId, mode) {
  const validModes = ["MANUAL", "SCHEDULE", "BOOST", "OFF"];
  const upperMode = mode.toUpperCase();
  if (!validModes.includes(upperMode)) {
    throw new Error(`Mode must be one of: ${validModes.join(", ")}`);
  }

  try {
    const hive = await getHiveInstance();

    switch (upperMode) {
      case "MANUAL":
        await hive.heating.setMode(deviceId, "MANUAL");
        break;
      case "SCHEDULE":
        await hive.heating.setMode(deviceId, "SCHEDULE");
        break;
      case "BOOST":
        await hive.heating.boost(deviceId);
        break;
      case "OFF":
        await hive.heating.setMode(deviceId, "OFF");
        break;
    }

    return { ok: true, mode: upperMode };
  } catch (error) {
    console.error("[Hive] setMode error:", error);
    throw error;
  }
}
