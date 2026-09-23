import { createAuthClient } from "better-auth/react";
import { customSessionClient, emailOTPClient } from "better-auth/client/plugins";
import type { auth } from "@/lib/auth";

export const authClient = createAuthClient({
  plugins: [emailOTPClient(), customSessionClient<typeof auth>()],
});
