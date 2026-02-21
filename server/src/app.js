const express = require("express");
const cors = require("cors");
const { errorHandler } = require("./middlewares/error");

const authRoutes = require("./routes/auth.routes");
const vehicleRoutes = require("./routes/vehicles.routes");
const driverRoutes = require("./routes/drivers.routes");
const tripRoutes = require("./routes/trips.routes");
const maintenanceRoutes = require("./routes/maintenance.routes");
const fuelRoutes = require("./routes/fuel.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const locationsRoutes = require("./routes/locations.routes");

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN, credentials: true }));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true, name: "Horizon Fleet Server" }));

app.use("/api/auth", authRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/fuel", fuelRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/locations", locationsRoutes);

app.use(errorHandler);

module.exports = app;
