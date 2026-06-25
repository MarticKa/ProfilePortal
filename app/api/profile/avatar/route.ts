import { removeUpload, upload } from "@/lib/upload";
export const runtime = "nodejs";
export const POST = (request: Request) => upload(request, { key: "avatar", allowed: ["jpg", "jpeg", "png"], maxBytes: 2 * 1024 * 1024, prefix: "avatar" });
export const DELETE = (request: Request) => removeUpload(request, "avatar");
