import { config } from "dotenv";
config({ path: "../../.env" });
import { sql } from "drizzle-orm";
import { db } from "./client";

// Order doesn't matter with CASCADE, but we TRUNCATE every table the seed touches.
// RESTART IDENTITY resets any serial sequences (none in this schema, but cheap).
const TABLES = [
  // Core / leaf tables first (purely defensive — CASCADE handles it)
  "audit_log",
  "rate_limit_buckets",
  "stripe_events",
  "usage_records",
  "controlled_substance_log",
  "payments",
  "communications",
  "webhooks",
  "api_keys",
  "wellness_enrollments",
  "wellness_plans",
  "consent_requests",
  "consent_forms",
  "files",
  "treatment_plan_items",
  "treatment_plans",
  "vital_signs",
  "problem_list",
  "treatment_template_items",
  "treatment_templates",
  "invoice_items",
  "invoices",
  "lab_results",
  "procedures",
  "prescriptions",
  "vaccination_records",
  "soap_notes",
  "appointments",
  "rooms",
  "appointment_types",
  "patient_weights",
  "patient_allergies",
  "patients",
  "clients",
  "products",
  "services",
  "users",
  "locations",
  "practices",
];

export async function reset() {
  console.log("Truncating all tables...");
  // Single statement — TRUNCATE ... CASCADE handles FK dependencies.
  const tableList = TABLES.join(", ");
  await db.execute(sql.raw(`TRUNCATE TABLE ${tableList} RESTART IDENTITY CASCADE`));
  console.log(`Truncated ${TABLES.length} tables`);
}

const isDirectRun = process.argv[1]?.replace(/\\/g, "/").endsWith("reset.ts") || process.argv[1]?.replace(/\\/g, "/").endsWith("reset.js");
if (isDirectRun) {
  reset()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Reset failed:", err);
      process.exit(1);
    });
}

