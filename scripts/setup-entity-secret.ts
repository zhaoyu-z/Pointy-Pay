import { registerEntitySecretCiphertext } from "@circle-fin/developer-controlled-wallets";
import { randomBytes } from "crypto";
import { writeFileSync, readFileSync, existsSync } from "fs";
import { resolve } from "path";

// Load .env.local manually (tsx doesn't auto-load Next.js env files)
const envPath = resolve(process.cwd(), ".env.local");
if (existsSync(envPath)) {
  const lines = readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (key && !(key in process.env)) process.env[key] = value;
  }
}

async function main() {
  const apiKey = process.env.CIRCLE_API_KEY;
  if (!apiKey) {
    console.error("Error: CIRCLE_API_KEY is not set in .env.local");
    process.exit(1);
  }

  const entitySecret = randomBytes(32).toString("hex");
  console.log("Entity secret generated.");

  console.log("Registering with Circle API...");
  const response = await registerEntitySecretCiphertext({ apiKey, entitySecret });

  const recoveryFilePath = resolve(process.cwd(), "entity-secret-recovery.dat");
  writeFileSync(recoveryFilePath, response.data?.recoveryFile ?? "");
  console.log(`Recovery file saved: ${recoveryFilePath}`);
  console.log("IMPORTANT: Store this recovery file securely.\n");

  console.log("========================================");
  console.log("Add the following to your .env.local:");
  console.log("========================================");
  console.log(`CIRCLE_ENTITY_SECRET=${entitySecret}`);
  console.log("========================================\n");
}

main().catch((err) => {
  console.error("Setup failed:", err.message ?? err);
  process.exit(1);
});
