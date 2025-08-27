
import bcrypt from "bcryptjs";
import { getUserFromReq } from "../../../lib/auth";
import { Collections } from "../../../models";

export default async function handler(req, res){
  const user = getUserFromReq(req);
  if(!user || user.role !== "admin") return res.status(401).json({ error: "Unauthorized" });
  const { users } = await Collections();

  if(req.method === "GET"){
    const list = await users.find({ role: "technician" }).project({ password:0 }).toArray();
    return res.json({ list });
  }
  if(req.method === "POST"){
    const { username, name, password } = req.body || {};
    if(!username || !password) return res.status(400).json({ error: "Missing fields" });
    const exist = await users.findOne({ username, role:"technician" });
    if(exist) return res.status(400).json({ error: "Username exists" });
    const hash = await bcrypt.hash(password, 10);
    const doc = { role:"technician", username, name, password: hash, createdAt: new Date() };
    await users.insertOne(doc);
    return res.json({ ok:true });
  }
  if(req.method === "DELETE"){
    const { id } = req.query;
    await users.deleteOne({ _id: new (await import("mongodb")).ObjectId(id) });
    return res.json({ ok:true });
  }
  res.status(405).end();
}
