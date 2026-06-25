import { errorResponse, jsonBody } from "@/lib/http";
import { authUser, hashPassword, issueToken, withUsers } from "@/lib/store";

export async function POST(request: Request) {
  const body = await jsonBody(request);
  if (!body || typeof body.email !== "string" || typeof body.password !== "string")
    return errorResponse("Invalid email or password", 401);
  const email = body.email.trim().toLowerCase();
  const password = body.password;
  return withUsers((users) => {
    const user = users.find((item) => item.email === email);
    if (!user || user.passwordHash !== hashPassword(password))
      return errorResponse("Invalid email or password", 401);
    user.token = issueToken();
    return Response.json({ token: user.token, user: authUser(user) });
  });
}
