import { COUNTRIES } from "./types";

export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/;

export function requiredString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function validateRegistration(body: Record<string, unknown>): string | null {
  if (![body.email, body.firstName, body.lastName, body.password].every(requiredString))
    return "All fields are required";
  if (!emailPattern.test(body.email as string)) return "Invalid email address";
  if (!passwordPattern.test(body.password as string))
    return "Password must be at least 6 characters and include lowercase, uppercase, number and special character";
  return null;
}

export function validateProfile(body: Record<string, unknown>): string | null {
  if (!requiredString(body.firstName)) return "First name is required";
  if (!requiredString(body.lastName)) return "Last name is required";
  if (!body.address || typeof body.address !== "object") return "Address is required";
  const address = body.address as Record<string, unknown>;
  if (!requiredString(address.postalCode)) return "Postal code is required";
  if (!COUNTRIES.includes(address.country as never)) return "Invalid country";
  for (const field of ["street", "houseNumber", "city"])
    if (typeof address[field] !== "string") return `Invalid address field: ${field}`;
  return null;
}
