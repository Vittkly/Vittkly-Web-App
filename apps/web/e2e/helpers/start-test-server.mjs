import { spawn } from "node:child_process";
import fs from "node:fs";
import net from "node:net";
import path from "node:path";
import { createMockSupabaseServer } from "./mock-supabase-server.mjs";

const webPort = process.env.PLAYWRIGHT_PORT || "3100";
const mockPort = Number(process.env.MOCK_SUPABASE_PORT || "54329");
const useRealSupabase = process.env.PLAYWRIGHT_USE_REAL_SUPABASE === "1";

function isPidAlive(pid) {
  if (!pid || typeof pid !== "number") return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function isPortListening(port, host = "127.0.0.1") {
  return new Promise((resolve) => {
    const socket = net.createConnection({ port, host });
    socket.once("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.once("error", () => {
      resolve(false);
    });
  });
}

async function clearStaleNextDevLock() {
  const lockPath = path.join(process.cwd(), ".next/dev/lock");
  if (!fs.existsSync(lockPath)) return;
  try {
    const raw = fs.readFileSync(lockPath, "utf8");
    const parsed = JSON.parse(raw);
    const pidAlive = isPidAlive(parsed?.pid);
    const portOpen =
      typeof parsed?.port === "number"
        ? await isPortListening(parsed.port)
        : false;
    if (!pidAlive && !portOpen) {
      fs.unlinkSync(lockPath);
      console.log("[e2e-server] Removed stale .next/dev/lock");
    }
  } catch {
    // Ignore malformed or concurrent lock cleanup
  }
}

let mockServer = null;
let nextChild = null;
let shuttingDown = false;

function shutdown(exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;

  if (nextChild && !nextChild.killed) {
    nextChild.kill("SIGTERM");
  }
  if (mockServer) {
    mockServer.close(() => {
      process.exit(exitCode);
    });
    setTimeout(() => process.exit(exitCode), 1500).unref();
  } else {
    process.exit(exitCode);
  }
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

async function main() {
  const childEnv = {
    ...process.env,
    NO_PROXY: process.env.NO_PROXY
      ? `${process.env.NO_PROXY},localhost,127.0.0.1,::1`
      : "localhost,127.0.0.1,::1",
  };
  childEnv.no_proxy = childEnv.NO_PROXY;

  if (!useRealSupabase) {
    delete childEnv.HTTP_PROXY;
    delete childEnv.http_proxy;
    delete childEnv.HTTPS_PROXY;
    delete childEnv.https_proxy;

    mockServer = createMockSupabaseServer();
    await new Promise((resolve, reject) => {
      mockServer.once("error", reject);
      mockServer.listen(mockPort, "127.0.0.1", resolve);
    });

    const mockUrl = `http://127.0.0.1:${mockPort}`;
    childEnv.NEXT_PUBLIC_SUPABASE_URL = mockUrl;
    childEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY = "mock-anon-key-vittkly-e2e";
    childEnv.SUPABASE_SERVICE_ROLE_KEY = "mock-service-role-key-vittkly-e2e";
    childEnv.NEXT_PUBLIC_SITE_URL = `http://localhost:${webPort}`;
    childEnv.MOCK_SUPABASE_URL = mockUrl;
    console.log(`[e2e-server] Mock Supabase listening on ${mockUrl}`);
  }

  await clearStaleNextDevLock();

  nextChild = spawn("pnpm", ["exec", "next", "dev", "-p", webPort], {
    env: childEnv,
    stdio: "inherit",
  });

  nextChild.on("exit", (code) => {
    shutdown(code ?? 0);
  });

  nextChild.on("error", (err) => {
    console.error("[e2e-server] Failed to spawn next dev:", err);
    shutdown(1);
  });
}

main().catch((err) => {
  console.error("[e2e-server] Startup error:", err);
  shutdown(1);
});
