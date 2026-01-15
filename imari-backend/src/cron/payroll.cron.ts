import cron from "node-cron";
import { resetMonthlyPayrolls, ensureMonthlyPayrolls } from "../utils/payroll.reset";

/**
 * Runs on the 1st of every month at 00:01
 * Resets payrolls for the new month
 */
cron.schedule("1 0 1 * *", async () => {
  console.log("🧾 Running monthly payroll reset...");
  try {
    await resetMonthlyPayrolls();
  } catch (err) {
    console.error("❌ Payroll reset failed:", err);
  }
});

/**
 * Runs every day at 01:00
 * Ensures payroll exists for all staff
 */
cron.schedule("0 1 * * *", async () => {
  console.log("🧾 Ensuring monthly payrolls...");
  try {
    await ensureMonthlyPayrolls();
  } catch (err) {
    console.error("❌ Payroll ensure failed:", err);
  }
});