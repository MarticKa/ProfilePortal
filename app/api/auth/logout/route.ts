import { authenticatedUser, withUsers } from "@/lib/store";

export async function POST(request: Request) {
  await withUsers((users) => {
    const user = authenticatedUser(request, users);
    if (user) user.token = null;
  });
  return new Response(null, { status: 204 });
}
