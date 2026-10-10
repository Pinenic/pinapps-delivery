import { createRoleStore } from "./createRoleStore";

export const useAdminStore = createRoleStore({
  role: "admin",
  table: "admins",
  fields: "id, name",
});
