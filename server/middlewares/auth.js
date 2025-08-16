// server/middlewares/auth.js

import { requireAuth } from "@clerk/express";

// This exports the Clerk middleware that we'll use to protect routes.
export const clerkProtect = requireAuth();