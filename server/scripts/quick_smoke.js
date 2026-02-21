const http = require("http");

function req(method, path, body = null, token = null) {
  const data = body ? JSON.stringify(body) : null;
  const options = { hostname: "localhost", port: 5000, path, method, headers: { "Content-Type": "application/json" } };
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
  console.log("login ok");

  const kpis = await req("GET", "/api/dashboard/kpis", null, token);
  if (!kpis.json.success) throw new Error("kpis failed");
  console.log("kpis ok", kpis.json.kpis);

  const vehicles = await req("GET", "/api/vehicles?status=AVAILABLE", null, token);
  console.log("vehicles ok", (vehicles.json.vehicles || []).length);

  const drivers = await req("GET", "/api/drivers?status=ON_DUTY", null, token);
  console.log("drivers ok", (drivers.json.drivers || []).length);

  const vehicle = vehicles.json.vehicles && vehicles.json.vehicles[0];
  const driver = drivers.json.drivers && drivers.json.drivers[0];
  if (vehicle && driver) {
    const lat = 23.0225 + Math.random() * 0.001;
    const lng = 72.5714 + Math.random() * 0.001;
    const ping = await req("POST", "/api/locations/ping", { vehicleId: vehicle.id, driverId: driver.id, lat, lng }, token);
    if (ping.status === 201) console.log("ping ok");
    const live = await req("GET", `/api/locations/live?type=${vehicle.type}`, null, token);
    console.log("live ok", (live.json.locations || []).length);
  } else {
    console.log("skipped ping/live; not enough data");
  }
  console.log("smoke ok");
}

main().catch((e) => {
  console.error("smoke failed:", e.message);
  process.exit(1);
});
