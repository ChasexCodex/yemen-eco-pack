export const DEFAULT_ADMIN_EMAIL = "elaf.a.amri@gmail.com";

export function resolveAdminEmail() {
  return (process.env.ADMIN_EMAIL ?? DEFAULT_ADMIN_EMAIL).trim().toLowerCase();
}
