const http = require("http");

function req(method, path, body = null, token = null) {
  const data = body ? JSON.stringify(body) : null;
  const options = {
    hostname: "localhost",
    port: 5000,
    path,
    method,
    headers: { "Content-Type": "application/json" }
  };
  if (token) options.headers.Authorization = `Bearer ${token}`;
  if (data) options.headers["Content-Length"] = Buffer.byteLength(data);
  return new Promise((resolve, reject) => {
    const r = http.request(options, (res) => {
      let raw = "";
      res.on("data", (c) => (raw += c));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, json: raw ? JSON.parse(raw) : {} });
        } catch (e) {
          reject(new Error(`Non-JSON response: ${raw}`));
        }
      });
    });
    r.on("error", reject);
    if (data) r.write(data);
    r.end();
  });
}

async function main() {
  const login = await req("POST", "/api/auth/login", { email: "manager@fleetops.com", password: "Password@123" });
  if (!login.json.token) throw new Error("Login failed");
  const token = login.json.token;
  console.log("✅ Logged in");

  const vehicles = await req("GET", "/api/vehicles?status=AVAILABLE", null, token);
  const vehicle = vehicles.json.vehicles && vehicles.json.vehicles[0];
  if (!vehicle) throw new Error("No AVAILABLE vehicles");
  const drivers = await req("GET", "/api/drivers?status=ON_DUTY", null, token);
  const driver = (drivers.json.drivers || []).find((d) => d.licenseCategory === vehicle.type) || drivers.json.drivers[0];
  if (!driver) throw new Error("No ON_DUTY drivers");

  const lat = 23.0225 + Math.random() * 0.001;
  const lng = 72.5714 + Math.random() * 0.001;
  const ping = await req("POST", "/api/locations/ping", { vehicleId: vehicle.id, driverId: driver.id, lat, lng, speed: 30, heading: 180 }, token);
  if (ping.status !== 201) throw new Error("Ping failed");
  console.log("✅ Ping recorded");

  const live = await req("GET", `/api/locations/live?type=${vehicle.type}`, null, token);
  const found = (live.json.locations || []).find((l) => l.vehicleId === vehicle.id);
  if (!found) throw new Error("Live location not found for vehicle");
  console.log("✅ Live location found for", vehicle.vehicleCode);
  console.log("Sample:", { lat: found.lat, lng: found.lng, ts: found.timestamp });
}

main().catch((e) => {
  console.error("Test failed:", e.message);
  process.exit(1);
});
