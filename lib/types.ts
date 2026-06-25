export const COUNTRIES = ["CZ", "SK", "PL", "DE", "AT", "HU", "SI"] as const;
export type Country = (typeof COUNTRIES)[number];

export type StoredFile = { fileName: string; url: string };
export type Address = {
  street: string;
  houseNumber: string;
  city: string;
  postalCode: string;
  country: Country;
};
export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  passwordHash: string;
  address: Address;
  avatar: StoredFile | null;
  gdprDocument: StoredFile | null;
  token: string | null;
};
export type PublicUser = Omit<User, "passwordHash" | "token">;
