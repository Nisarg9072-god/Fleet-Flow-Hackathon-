const http = require("http");

function postLogin(email, password) {
  const data = JSON.stringify({ email, password });
  const options = {
    hostname: "localhost",
    port: 5000,
    path: "/api/auth/login",
    method: "POST",
    headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(data) }
  };
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let raw = "";
      res.on("data", (c) => (raw += c));
      res.on("end", () => resolve({ status: res.statusCode, body: raw }));
    });
    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

postLogin("manager@fleetops.com", "Password@123")
  .then((r) => {
    console.log("status", r.status);
    console.log("body", r.body);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
