export function getPort() {
  // CI scripts run from npm run build with serve (port 5000)
  // while you (typically) you run from npm start (port 3000)
  return process.env.PORT || (process.env.CI ? "5000" : "3000");
}

export function getSchemeAndHost() {
  return "http://localhost";
}
