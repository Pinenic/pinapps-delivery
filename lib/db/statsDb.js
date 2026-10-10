// Dashboard / analytics numbers from one database call (app_admin_stats)
// instead of downloading every order row and counting in JavaScript.
// Service-role: callers must have verified the visitor is an admin first
// (see lib/auth/requireAdminPage.js).
import { callRpc } from "./rpc";

// Daily buckets are cut at midnight in this timezone, not the server's.
const STATS_TZ = "Africa/Lusaka";

// -> { total, active, delivered, avg_fee, rider_count,
//      by_status: { <status>: n }, daily: [{ day: 'YYYY-MM-DD', count }] }
export async function getAdminStats(days) {
  return callRpc("app_admin_stats", { p_days: days, p_tz: STATS_TZ });
}

// 'YYYY-MM-DD' -> a Date that formats as that calendar day in any timezone.
export function statsDayToDate(day) {
  return new Date(`${day}T12:00:00Z`);
}
