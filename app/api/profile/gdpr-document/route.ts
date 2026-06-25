import { removeUpload, upload } from "@/lib/upload";
export const runtime = "nodejs";
export const POST = (request: Request) => upload(request, { key: "gdprDocument", allowed: ["pdf", "doc", "docx"], maxBytes: 5 * 1024 * 1024, prefix: "gdpr" });
export const DELETE = (request: Request) => removeUpload(request, "gdprDocument");
