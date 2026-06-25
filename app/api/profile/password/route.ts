import { errorResponse, jsonBody } from "@/lib/http";
import { authenticatedUser, hashPassword, isAuthenticated, withUsers } from "@/lib/store";
import { passwordPattern, requiredString } from "@/lib/validation";

export async function PATCH(request: Request) {
  if (!(await isAuthenticated(request))) return errorResponse("Unauthorized", 401);
  const body = await jsonBody(request);
  if (!body || !requiredString(body.currentPassword) || !requiredString(body.newPassword))
    return errorResponse("Current password and new password are required", 400);
  if (!passwordPattern.test(body.newPassword))
    return errorResponse("New password must be at least 6 characters and include lowercase, uppercase, number and special character", 400);
  return withUsers((users) => {
    const user = authenticatedUser(request, users);
    if (!user) return errorResponse("Unauthorized", 401);
    if (user.passwordHash !== hashPassword(body.currentPassword as string))
      return errorResponse("Current password is incorrect", 403);
    user.passwordHash = hashPassword(body.newPassword as string);
    return new Response(null, { status: 204 });
  });
}
