import { resetStore } from "@/lib/store";
export async function POST() { await resetStore(); return new Response(null, { status: 204 }); }
