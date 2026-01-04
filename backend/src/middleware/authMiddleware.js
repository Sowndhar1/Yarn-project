import jwt from "jsonwebtoken";
import User from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev-yarn-secret";

export const signToken = (user) =>
  jwt.sign(
    {
      id: user.id || user._id,
      name: user.name,
      role: user.role,
      email: user.email,
    },
    JWT_SECRET,
    { expiresIn: "24h" }
  );

export const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    if (!header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const token = header.replace("Bearer ", "").trim();
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findOne({
      _id: decoded.id,
      isActive: true
    });

    if (!user) {
      return res.status(401).json({ message: "User no longer active" });
    }

    req.user = {
      id: user._id.toString(),
      name: user.name,
      role: user.role,
      email: user.email
    };
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const allowRoles =
  (...roles) =>
    (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: "You are not allowed to perform this action" });
      }

      next();
    };
