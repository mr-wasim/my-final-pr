import bcrypt from "bcryptjs";
import { setAuthCookie, ensureAdminSeed, findUserByCredentials } from "../../../lib/auth";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { username, password, role } = req.body || {};

  try {
    // Ensure admin exists (seed)
    await ensureAdminSeed();

    // Admin login
    if (role === "admin") {
      const user = await findUserByCredentials(username, password, "admin");
      if (!user) return res.status(401).json({ error: "Invalid credentials" });

      // Set JWT cookie with long expiry (7 days for example)
      setAuthCookie(res, user, { maxAge: 60 * 60 * 24 * 7 }); // 7 days
      return res.json({ user });
    }

    // Technician login
    if (role === "technician") {
      const user = await findUserByCredentials(username, password, "technician");
      if (!user) return res.status(401).json({ error: "Invalid credentials" });

      setAuthCookie(res, user, { maxAge: 60 * 60 * 24 * 7 }); // 7 days
      return res.json({ user });
    }

    return res.status(400).json({ error: "Invalid role" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
}
