import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { errorResponse } from "./http";
import { authenticatedUser, isAuthenticated, uploadsPath, withUsers } from "./store";

type FileKey = "avatar" | "gdprDocument";
type Config = { key: FileKey; allowed: string[]; maxBytes: number; prefix: string };

const extensionOf = (name: string) => path.extname(name).slice(1).toLowerCase();

export async function upload(request: Request, config: Config) {
  if (!(await isAuthenticated(request))) return errorResponse("Unauthorized", 401);
  let form: FormData;
  try { form = await request.formData(); } catch { return errorResponse("Invalid multipart form data", 400); }
  const file = form.get("file");
  if (!(file instanceof File) || !file.name) return errorResponse("File is required", 400);
  const extension = extensionOf(file.name);
  if (!config.allowed.includes(extension)) return errorResponse("Unsupported file type", 400);
  if (file.size > config.maxBytes) return errorResponse("File is too large", 400);
  return withUsers(async (users) => {
    const user = authenticatedUser(request, users);
    if (!user) return errorResponse("Unauthorized", 401);
    await mkdir(uploadsPath, { recursive: true });
    const storedName = `${config.prefix}-${user.id}.${extension}`;
    const previous = user[config.key];
    if (previous) await unlink(path.join(process.cwd(), "public", previous.url)).catch(() => undefined);
    await writeFile(path.join(uploadsPath, storedName), Buffer.from(await file.arrayBuffer()));
    const stored = { fileName: file.name, url: `/uploads/${storedName}` };
    user[config.key] = stored;
    return Response.json(stored, { status: 201 });
  });
}

export function removeUpload(request: Request, key: FileKey) {
  return withUsers(async (users) => {
    const user = authenticatedUser(request, users);
    if (!user) return errorResponse("Unauthorized", 401);
    const stored = user[key];
    if (!stored) return errorResponse(key === "avatar" ? "Avatar not found" : "GDPR document not found", 404);
    await unlink(path.join(process.cwd(), "public", stored.url)).catch(() => undefined);
    user[key] = null;
    return new Response(null, { status: 204 });
  });
}
