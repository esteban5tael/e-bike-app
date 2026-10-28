import { createAuthClient } from "better-auth/react";
export const authClient = createAuthClient({
    baseURL: process.env.PUBLIC_APP_URL,
});
