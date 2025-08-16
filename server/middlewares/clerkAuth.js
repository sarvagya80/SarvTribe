import { requireAuth } from "@clerk/express";

export const clerkProtect = requireAuth();
