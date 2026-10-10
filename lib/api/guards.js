// Role-aware versions of withAuth. Adding a new role = one line here.
import { withAuth } from "./withAuth";
import { getConsumerProfile } from "@/lib/db/bookingDb";
import { requireRider } from "@/lib/db/riderDb";
import { requireAdmin } from "@/lib/db/adminDb";

export const withConsumer = (handler) =>
  withAuth(handler, { guard: (user) => getConsumerProfile(user.id) });

export const withRider = (handler) =>
  withAuth(handler, { guard: (user) => requireRider(user.id) });

export const withAdmin = (handler) =>
  withAuth(handler, { guard: (user) => requireAdmin(user.id) });