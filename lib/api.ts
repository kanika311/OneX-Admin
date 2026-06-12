const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("onex_admin_token");
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem("onex_admin_token", token);
  else localStorage.removeItem("onex_admin_token");
}

/** Clear stale admin session (invalid or deleted user in JWT) */
export function clearAdminSession() {
  setToken(null);
  if (typeof window !== "undefined") {
    localStorage.removeItem("onex_admin_user");
  }
}

type ApiFetchOptions = Omit<RequestInit, "body"> & { body?: unknown };

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}) {
  const { body, headers, ...rest } = options;
  const h: HeadersInit = { "Content-Type": "application/json", ...(headers || {}) };
  const token = getToken();
  if (token) (h as Record<string, string>).Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API}${path}`, {
      ...rest,
      headers: h,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(
      0,
      "Cannot reach API at " + API + ". Start it: cd onex-api && npm run dev",
    );
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && typeof window !== "undefined") {
      clearAdminSession();
    }
    const msg = data.message || "Request failed";
    if (res.status === 401) {
      throw new ApiError(
        401,
        msg === "User not found"
          ? "Session expired — sign in again (admin account may have been reset)"
          : msg,
      );
    }
    throw new ApiError(res.status, msg);
  }
  return data as T;
}

export type AdminUser = { id: string; name: string; number: string; role: string };

export type Product = {
  _id: string;
  slug: string;
  domain: "cyber" | "physio";
  category: "courses" | "services" | "therapy";
  title: string;
  description: string;
  duration: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  iconKey: string;
  bestseller: boolean;
  benefits: string[];
  faq: { q: string; a: string }[];
  cta: string;
  active: boolean;
  offeringId?: string;
};

export type Customer = {
  id: string | null;
  name: string;
  number: string;
  email?: string;
  phone?: string;
  registeredAt: string | null;
  orderCount: number;
  lastOrderAt: string | null;
  totalSpent: number;
  source: "registered" | "guest";
};

export type OrderItem = {
  cartKey: string;
  offeringId: string;
  type: "course" | "service" | "membership";
  title: string;
  price: number;
  quantity: number;
  image?: string;
  duration?: string;
};

export type Order = {
  _id: string;
  user?: { _id: string; name: string; number?: string; email?: string } | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  subtotal: number;
  status: "pending" | "confirmed" | "cancelled";
  paymentStatus?: "awaiting" | "submitted" | "confirmed";
  paymentSubmittedAt?: string | null;
  paymentReference?: string;
  notes: string;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
};

export type ContactInquiry = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: "new" | "read" | "replied" | "archived";
  createdAt: string;
  updatedAt?: string;
};

export type Testimonial = {
  _id: string;
  fullName: string;
  email: string;
  photo: string;
  serviceUsed: string;
  rating: number;
  message: string;
  serviceDate: string;
  status: "pending" | "approved" | "rejected";
  featured: boolean;
  createdAt: string;
  updatedAt?: string;
};

export type Offer = {
  _id: string;
  slug: string;
  offerType: "membership" | "promo";
  title: string;
  subtitle: string;
  description: string;
  cardTitle: string;
  price: number;
  contactPhone?: string;
  feeLabel: string;
  benefits: string[];
  discountLabel: string;
  discountPercent: number;
  promoCode: string;
  image: string;
  ctaText: string;
  ctaLink: string;
  featured: boolean;
  sortOrder: number;
  active: boolean;
};
