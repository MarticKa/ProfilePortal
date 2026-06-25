import { unlink } from "fs/promises";
import path from "path";
import { withUsers } from "@/lib/store";

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  await withUsers(async (users) => {
    const index = users.findIndex((user) => user.id === id);
    if (index >= 0) {
      const [user] = users.splice(index, 1);
      for (const item of [user.avatar, user.gdprDocument])
        if (item) await unlink(path.join(process.cwd(), "public", item.url)).catch(() => undefined);
    }
  });
  return new Response(null, { status: 204 });
}
