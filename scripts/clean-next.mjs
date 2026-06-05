import { existsSync, renameSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const nextDir = path.join(root, ".next");

function clean() {
  if (!existsSync(nextDir)) {
    console.log("No .next folder to remove.");
    return;
  }
  try {
    rmSync(nextDir, { recursive: true, force: true, maxRetries: 3, retryDelay: 200 });
    console.log("Removed", nextDir);
  } catch {
    renameSync(nextDir, `${nextDir}.old-${Date.now()}`);
    console.log("Renamed locked .next folder.");
  }
}

clean();
