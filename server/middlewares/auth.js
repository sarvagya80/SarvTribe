// server/middlewares/auth.js
import { requireAuth } from "@clerk/express";
import { clerkClient } from "@clerk/clerk-sdk-node"; // <-- Add this import

// This is your existing middleware, it's still needed for regular routes
export const clerkProtect = requireAuth();

// ✅ ADD THIS NEW MIDDLEWARE
// This middleware is specifically for API routes like SSE that shouldn't redirect.
export const verifyToken = async (req, res, next) => {
    try {
        // We use the same sseAuthMiddleware to get the token into the header first
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        // Verify the token using the Clerk SDK
        const payload = await clerkClient.verifyToken(token);
        // Manually attach the auth object for the next function to use
        req.auth = () => ({ userId: payload.sub });
        next();
    } catch (error) {
        return res.status(401).json({ error: "Unauthorized" });
    }
};