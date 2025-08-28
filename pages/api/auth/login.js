// pages/api/auth/login.js
import jwt from "jsonwebtoken";
import { ensureAdminSeed, findUserByCredentials } from "../../../lib/auth";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { username, password, role } = req.body || {};

  try {
    await ensureAdminSeed();

    const user = await findUserByCredentials(username, password, role);
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id?.toString ? user._id.toString() : user._id, role: user.role, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "30d" } // change as needed
    );

    // Do NOT set cookies here for webview reliability — return token
    return res.status(200).json({
      user: {
        _id: user._id,
        username: user.username,
        role: user.role,
        name: user.name || null,
        // any other safe fields
      },
      token,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
}
