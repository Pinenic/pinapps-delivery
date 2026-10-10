// One place that calls Postgres functions (supabase/migrations/…_delivery_rpcs.sql)
// with the service-role client and turns their errors into ApiError.
//
// The functions raise business-rule failures with SQLSTATE 'PDxxx', where
// xxx is the HTTP status to return (PD404, PD409, PD429, …) and the message
// is safe to show. Any other database error is logged here and returned to
// the caller as a generic 500, so table and column names never leak.
import { ApiError } from "../api/ApiError";
import { createServiceClient } from "../supabase/serviceClient";

let client;
export const serviceDb = () => (client ??= createServiceClient());

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (v) => typeof v === "string" && UUID_RE.test(v);

// A positive integer from an env var, or null when unset/invalid.
// null means "no limit" in the SQL functions.
export function envInt(name) {
  const n = Number.parseInt(process.env[name] ?? "", 10);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export function toApiError(fn, error) {
  const match = /^PD(\d{3})$/.exec(error?.code ?? "");
  if (match) return new ApiError(error.message, Number(match[1]));
  console.error(`rpc ${fn} failed`, error);
  return new ApiError("Something went wrong. Please try again.", 500);
}

export async function callRpc(fn, args) {
  const { data, error } = await serviceDb().rpc(fn, args);
  if (error) throw toApiError(fn, error);
  return data;
}
