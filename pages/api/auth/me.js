
import { getUserFromReq } from "../../../lib/auth";

export default async function handler(req, res){
  const user = getUserFromReq(req);
  if(!user) return res.status(401).json({ error: "Unauthorized" });
  res.json({ user });
}
