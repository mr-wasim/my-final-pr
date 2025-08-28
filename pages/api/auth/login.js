import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { setAuthCookie, ensureAdminSeed, findUserByCredentials } from "../../../lib/auth"; 

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { username, password, role } = req.body || {};
  try {
    await ensureAdminSeed();

    const user = await findUserByCredentials(username, password, role);
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    // 🟢 Generate token
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    setAuthCookie(res, user);
    return res.json({ user, token }); // send both
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
}
