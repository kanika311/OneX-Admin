export function formatCustomerPhone(value?: string) {
  const raw = String(value ?? "").trim();
  if (!raw) return "—";
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 10) return raw;
  const local = digits.length >= 10 ? digits.slice(-10) : digits;
  if (digits.length === 12 && digits.startsWith("91")) {
    return `+91 ${digits.slice(2)}`;
  }
  if (digits.length === 11 && digits.startsWith("0")) {
    return digits.slice(1);
  }
  if (local.length === 10) return local;
  return raw;
}
