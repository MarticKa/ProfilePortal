import { errorResponse, jsonBody } from "@/lib/http";
import { authUser, newUser, withUsers } from "@/lib/store";
import { validateRegistration } from "@/lib/validation";

export async function POST(request: Request) {
  const body = await jsonBody(request);
  if (!body) return errorResponse("Invalid JSON body", 400);
  const error = validateRegistration(body);
  if (error) return errorResponse(error, 400);
  return withUsers((users) => {
    const email = (body.email as string).trim().toLowerCase();
    if (users.some((user) => user.email === email)) return errorResponse("Email is already registered", 409);
    const user = newUser(body as { email: string; firstName: string; lastName: string; password: string });
    users.push(user);
    return Response.json(authUser(user), { status: 201 });
  });
}
