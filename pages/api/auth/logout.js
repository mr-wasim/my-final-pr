
import { clearAuthCookie } from "../../../lib/auth";

export default async function handler(req, res){
  clearAuthCookie(res);
  res.json({ ok: true });
}
