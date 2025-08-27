
import bcrypt from "bcryptjs";
import { setAuthCookie, ensureAdminSeed, findUserByCredentials } from "../../../lib/auth";

export default async function handler(req, res){
  if(req.method !== "POST") return res.status(405).end();
  const { username, password, role } = req.body || {};
  try{
    await ensureAdminSeed();

    if(role === "admin"){
      const user = await findUserByCredentials(username, password, "admin");
      if(!user) return res.status(401).json({ error: "Invalid credentials" });
      setAuthCookie(res, user);
      return res.json({ user });
    } else {
      const user = await findUserByCredentials(username, password, "technician");
      if(!user) return res.status(401).json({ error: "Invalid credentials" });
      setAuthCookie(res, user);
      return res.json({ user });
    }
  }catch(e){
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
}
