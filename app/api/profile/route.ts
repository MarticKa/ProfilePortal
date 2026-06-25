import { errorResponse, jsonBody } from "@/lib/http";
import { authenticatedUser, isAuthenticated, publicUser, withUsers } from "@/lib/store";
import type { Address } from "@/lib/types";
import { validateProfile } from "@/lib/validation";

export async function GET(request: Request) {
  return withUsers((users) => {
    const user = authenticatedUser(request, users);
    return user ? Response.json(publicUser(user)) : errorResponse("Unauthorized", 401);
  }, false);
}

export async function PATCH(request: Request) {
  if (!(await isAuthenticated(request))) return errorResponse("Unauthorized", 401);
  const body = await jsonBody(request);
  if (!body) return errorResponse("Invalid JSON body", 400);
  return withUsers((users) => {
    const user = authenticatedUser(request, users);
    if (!user) return errorResponse("Unauthorized", 401);
    const error = validateProfile(body);
    if (error) return errorResponse(error, 400);
    user.firstName = (body.firstName as string).trim();
    user.lastName = (body.lastName as string).trim();
    user.address = body.address as Address;
    return Response.json(publicUser(user));
  });
}
