import { clerkClient, getAuth } from "@clerk/express";

export const getAuthUserId = (req) => {
  const { userId } = getAuth(req);
  return userId;
};

export const protectUser = async (req, res, next) => {
  try {
    const userId = getAuthUserId(req);

    if (!userId) {
      return res.status(401).json({ success: false, message: "unauthenticated" });
    }

    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ success: false, message: "unauthenticated" });
  }
};

export const protectAdmin = async (req, res, next) => {
  try {
    const userId = getAuthUserId(req);

    if (!userId) {
      return res.status(401).json({ success: false, message: "unauthenticated" });
    }

    const user = await clerkClient.users.getUser(userId);

    if (user.privateMetadata.role?.toLowerCase() !== "admin") {
      return res.status(403).json({ success: false, message: "not authorized" });
    }

    next();

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "server error" });
  }
};
