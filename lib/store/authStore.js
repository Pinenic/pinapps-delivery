// Deprecated path, kept only so existing rider imports
// (`@/lib/store/authStore`) keep working. It now points at the
// isolated rider store (lib/store/riderStore.js) — NOT a shared
// admin/rider store. Admin code must import useAdminStore from
// "@/lib/store/adminStore" instead; nothing here is shared with it.
// New rider code should import useRiderStore directly.
export { useRiderStore as useAuthStore } from "./riderStore";