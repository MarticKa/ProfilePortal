import { spawn } from "node:child_process";
import { once } from "node:events";
import { setTimeout as delay } from "node:timers/promises";

const port = 3101;
const base = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "dev", "-p", String(port)], { stdio: ["ignore", "pipe", "inherit"] });

async function request(path, options = {}, expected) {
  const response = await fetch(base + path, { ...options, signal: AbortSignal.timeout(5_000) });
  if (response.status !== expected) throw new Error(`${options.method ?? "GET"} ${path}: expected ${expected}, got ${response.status}: ${await response.text()}`);
  return response.status === 204 ? null : response.json();
}

try {
  await Promise.race([
    new Promise((resolve, reject) => server.stdout.on("data", chunk => chunk.toString().includes("Ready") && resolve())),
    delay(15_000).then(() => { throw new Error("Server start timed out"); }),
  ]);
  await request("/api/test/reset", { method: "POST" }, 204);
  const created = await request("/api/test/users", { method:"POST", headers:{"content-type":"application/json"}, body:JSON.stringify({email:"smoke@example.com",firstName:"Smoke",lastName:"Tester",password:"Password1!"}) }, 201);
  await request("/api/test/users", { method:"POST", headers:{"content-type":"application/json"}, body:JSON.stringify({email:"smoke@example.com",firstName:"Smoke",lastName:"Tester",password:"Password1!"}) }, 409);
  const login = await request("/api/auth/login", { method:"POST", headers:{"content-type":"application/json"}, body:JSON.stringify({email:"smoke@example.com",password:"Password1!"}) }, 200);
  const auth = { authorization:`Bearer ${login.token}` };
  await request("/api/profile", { headers:auth }, 200);
  await request("/api/profile", { method:"PATCH", headers:{...auth,"content-type":"application/json"}, body:JSON.stringify({firstName:"Updated",lastName:"Tester",address:{street:"Nová",houseNumber:"45",city:"Brno",postalCode:"60200",country:"CZ"}}) }, 200);
  await request("/api/profile/password", { method:"PATCH", headers:{...auth,"content-type":"application/json"}, body:JSON.stringify({currentPassword:"Password1!",newPassword:"NewPassword2!"}) }, 204);
  const avatar = new FormData(); avatar.append("file", new File(["image"], "avatar.png", {type:"image/png"}));
  await request("/api/profile/avatar", { method:"POST", headers:auth, body:avatar }, 201);
  await request("/api/profile/avatar", { method:"DELETE", headers:auth }, 204);
  await request(`/api/test/users/${created.id}`, { method:"DELETE" }, 204);
  console.log("Smoke test passed: auth, profile, password, avatar and cleanup endpoints.");
} finally {
  if (server.exitCode === null) {
    server.kill("SIGKILL");
    await once(server, "exit");
  }
}
