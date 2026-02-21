const http = require("http");

function req(method, path, body = null, token = null) {
  const data = body ? JSON.stringify(body) : null;
  const options = {
    hostname: "localhost",
    port: 5000,
    path,
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };
  if (token) options.headers.Authorization = `Bearer ${token}`;
  if (data) options.headers["Content-Length"] = Buffer.byteLength(data);

  return new Promise((resolve, reject) => {
    const r = http.request(options, (res) => {
      let raw = "";
      res.on("data", (ch) => (raw += ch));
      res.on("end", () => {
        const text = raw || "";
        let json;
        try {
          json = text ? JSON.parse(text) : {};
        } catch (e) {
          return reject(new Error(`Non-JSON response (${res.statusCode}): ${text}`));
        }
        resolve({ status: res.statusCode, json });
      });
    });
    r.on("error", reject);
    if (data) r.write(data);
    r.end();
  });
}

async function main() {
  // Login as dispatcher for trip operations
  const loginDisp = await req("POST", "/api/auth/login", {
    email: "dispatcher@fleetops.com",
    password: "Password@123",
  });
  if (loginDisp.status !== 200 || !loginDisp.json.token) {
    throw new Error("Dispatcher login failed: " + JSON.stringify(loginDisp.json));
  }
  const dispToken = loginDisp.json.token;
  console.log("✅ Dispatcher login OK");

  // KPIs
  const kpis = await req("GET", "/api/dashboard/kpis", null, dispToken);
  console.log("KPIs:", kpis.json.kpis);

  // Vehicles AVAILABLE
  const vehiclesAvail = await req("GET", "/api/vehicles?status=AVAILABLE", null, dispToken);
  if (!vehiclesAvail.json.vehicles || vehiclesAvail.json.vehicles.length === 0) {
    throw new Error("No AVAILABLE vehicles found");
  }
  const vehicle = vehiclesAvail.json.vehicles[0];
  console.log("Using vehicle:", vehicle.vehicleCode, vehicle.type);

  // Drivers ON_DUTY, matching licenseCategory
  const driversDuty = await req("GET", "/api/drivers?status=ON_DUTY", null, dispToken);
  const driver = (driversDuty.json.drivers || []).find(d => d.licenseCategory === vehicle.type);
  if (!driver) throw new Error("No ON_DUTY driver matching vehicle type");
  console.log("Using driver:", driver.fullName, driver.licenseCategory);

  // Create DRAFT trip
  const cargo = Math.min(100, vehicle.maxCapacityKg || 100);
  const createTrip = await req("POST", "/api/trips", {
    vehicleId: vehicle.id,
    driverId: driver.id,
    origin: "Warehouse",
    destination: "Customer",
    cargoWeightKg: cargo,
    revenue: 1000,
  }, dispToken);
  if (createTrip.status !== 201) throw new Error("Create trip failed: " + JSON.stringify(createTrip.json));
  const trip = createTrip.json.trip;
  console.log("✅ Trip created:", trip.tripCode, trip.id);

  // Dispatch trip
  const dispatch = await req("POST", `/api/trips/${trip.id}/dispatch`, null, dispToken);
  if (dispatch.status !== 200) throw new Error("Dispatch failed: " + JSON.stringify(dispatch.json));
  console.log("✅ Trip dispatched");
  const { updatedTrip, updatedVehicle, updatedDriver } = dispatch.json;
  if (!(updatedVehicle && updatedVehicle.status === "ON_TRIP" && updatedDriver && updatedDriver.status === "ON_TRIP")) {
    throw new Error("Vehicle/Driver not ON_TRIP after dispatch");
  }

  // Complete trip
  const endKm = (updatedTrip.startOdometerKm || 0) + 10;
  const complete = await req("POST", `/api/trips/${trip.id}/complete`, { endOdometerKm: endKm }, dispToken);
  if (complete.status !== 200) throw new Error("Complete failed: " + JSON.stringify(complete.json));
  console.log("✅ Trip completed");
  const { updatedVehicle: v2, updatedDriver: d2 } = complete.json;
  if (!(v2 && v2.status === "AVAILABLE" && d2 && d2.status === "ON_DUTY")) {
    throw new Error("Vehicle/Driver not reset after completion");
  }

  // Login as manager for maintenance
  const loginMgr = await req("POST", "/api/auth/login", {
    email: "manager@fleetops.com",
    password: "Password@123",
  });
  if (loginMgr.status !== 200 || !loginMgr.json.token) throw new Error("Manager login failed");
  const mgrToken = loginMgr.json.token;
  console.log("✅ Manager login OK");

  // Create maintenance for same vehicle
  const maint = await req("POST", "/api/maintenance", {
    vehicleId: vehicle.id,
    serviceType: "OIL_CHANGE",
    cost: 250,
  }, mgrToken);
  if (maint.status !== 201) throw new Error("Maintenance failed: " + JSON.stringify(maint.json));
  console.log("✅ Maintenance logged; vehicle should be IN_SHOP");

  // Verify it's not in AVAILABLE list
  const vehiclesAvail2 = await req("GET", "/api/vehicles?status=AVAILABLE", null, dispToken);
  const stillAvail = (vehiclesAvail2.json.vehicles || []).some(v => v.id === vehicle.id);
  if (stillAvail) throw new Error("Vehicle still appears AVAILABLE after maintenance");
  console.log("✅ Vehicle removed from AVAILABLE after maintenance");

  console.log("🎉 Backend workflow checks passed");
}

main().catch((e) => {
  console.error("Test failed:", e.message);
  process.exit(1);
});
