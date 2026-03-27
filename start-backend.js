const { spawn } = require("child_process");
const path = require("path");

const backendDir = path.join(__dirname, "backend");
const userSite = "C:\\Users\\Temp\\AppData\\Roaming\\Python\\Python314\\site-packages";

const child = spawn(
  "C:\\Python314\\python.exe",
  [
    "-c",
    `import sys; sys.path.insert(0, r'${userSite}'); from uvicorn.main import main; main()`,
    "app.main:app",
    "--reload",
    "--port",
    "8000",
  ],
  {
    cwd: backendDir,
    stdio: "inherit",
    shell: true,
  }
);

child.on("error", (err) => {
  console.error("Failed to start backend:", err.message);
  process.exit(1);
});

child.on("exit", (code) => process.exit(code || 0));
