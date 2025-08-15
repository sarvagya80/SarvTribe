import { requireAuth } from '@clerk/express';

// This is the only line you need.
export const protect = requireAuth;