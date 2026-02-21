require("dotenv").config();
const http = require("http");
const app = require("./app");
const { initSockets } = require("./sockets");

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
initSockets(server);
server.listen(PORT, () => {
  console.log(`✅ FleetOps server running on http://localhost:${PORT}`);
});
