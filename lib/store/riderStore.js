import { createRoleStore } from "./createRoleStore";

export const useRiderStore = createRoleStore({
  role: "rider",
  table: "riders",
  fields: "id, name, phone, vehicle_type, avatar_url, rating, status",
});
