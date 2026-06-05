import { apiFetch, clearAdminSession, setToken, type AdminUser } from "./api";

export async function adminLogin(number: string, password: string) {
  const data = await apiFetch<{ token: string; user: AdminUser }>("/auth/login", {
    method: "POST",
    body: { number, password },
  });
  if (data.user.role !== "admin") throw new Error("This account is not an admin");
  setToken(data.token);
  localStorage.setItem("onex_admin_user", JSON.stringify(data.user));
  return data.user;
}

export async function adminRegister(name: string, number: string, password: string, adminSecret: string) {
  const data = await apiFetch<{ token: string; user: AdminUser }>("/auth/register", {
    method: "POST",
    body: { name, number, password, role: "admin", adminSecret },
  });
  setToken(data.token);
  localStorage.setItem("onex_admin_user", JSON.stringify(data.user));
  return data.user;
}

export function adminLogout() {
  clearAdminSession();
}

export function getStoredAdmin(): AdminUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("onex_admin_user");
  return raw ? (JSON.parse(raw) as AdminUser) : null;
}
