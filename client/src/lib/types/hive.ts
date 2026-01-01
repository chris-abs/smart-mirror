export type HiveDevice = {
  id: string;
  name: string;
  type: string;
};

export type HiveHeatingStatus = {
  deviceId: string;
  name: string;
  temperature: number | null;
  targetTemperature: number | null;
  mode: string | null;
  isHeating: boolean | null;
  isOnline: boolean | null;
};

