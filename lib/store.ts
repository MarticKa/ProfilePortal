import { createHash, randomBytes, randomUUID } from "crypto";
import { mkdir, readFile, rename, writeFile } from "fs/promises";
import path from "path";
import type { PublicUser, User } from "./types";

const dataDir = path.join(process.cwd(), "data");
const dataFile = path.join(dataDir, "users.json");
const uploadsDir = path.join(process.cwd(), "public", "uploads");
let operation = Promise.resolve<unknown>(undefined);

export const hashPassword = (password: string) =>
  createHash("sha256").update(`profile-portal:${password}`).digest("hex");

export const publicUser = ({ passwordHash: _passwordHash, token: _token, ...user }: User): PublicUser => user;
export const authUser = (user: User) => ({ id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName });

export function newUser(input: { email: string; firstName: string; lastName: string; password: string }): User {
  return {
    id: `user_${randomUUID()}`,
    email: input.email.trim().toLowerCase(),
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    passwordHash: hashPassword(input.password),
    address: { street: "", houseNumber: "", city: "", postalCode: "", country: "CZ" },
    avatar: null,
    gdprDocument: null,
    token: null,
  };
}

function demoUser(): User {
  return newUser({ email: "demo@example.com", firstName: "Demo", lastName: "User", password: "Password1!" });
}

async function readUsers(): Promise<User[]> {
  await mkdir(dataDir, { recursive: true });
  try {
    return JSON.parse(await readFile(dataFile, "utf8")) as User[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    const users = [demoUser()];
    await saveUsers(users);
    return users;
  }
}

async function saveUsers(users: User[]) {
  await mkdir(dataDir, { recursive: true });
  const temporary = `${dataFile}.${process.pid}.tmp`;
  await writeFile(temporary, JSON.stringify(users, null, 2));
  await rename(temporary, dataFile);
}

export function withUsers<T>(action: (users: User[]) => Promise<T> | T, persist = true): Promise<T> {
  const next = operation.then(async () => {
    const users = await readUsers();
    const result = await action(users);
    if (persist) await saveUsers(users);
    return result;
  });
  operation = next.catch(() => undefined);
  return next;
}

export async function resetStore() {
  await withUsers(async (users) => {
    users.splice(0, users.length, demoUser());
    await mkdir(uploadsDir, { recursive: true });
    const { readdir, unlink } = await import("fs/promises");
    for (const file of await readdir(uploadsDir)) if (file !== ".gitkeep") await unlink(path.join(uploadsDir, file));
  });
}

export const issueToken = () => randomBytes(32).toString("hex");
export const getBearerToken = (request: Request) => {
  const match = request.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? null;
};

export function authenticatedUser(request: Request, users: User[]) {
  const token = getBearerToken(request);
  return token ? users.find((user) => user.token === token) : undefined;
}

export const isAuthenticated = (request: Request) =>
  withUsers((users) => Boolean(authenticatedUser(request, users)), false);

export const uploadsPath = uploadsDir;
