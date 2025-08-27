
import { getUserFromReq } from "../../../lib/auth";
import { Collections } from "../../../models";

export default async function handler(req,res){
  const user = getUserFromReq(req);
  if(!user) return res.status(401).json({ error: "Unauthorized" });
  const { calls } = await Collections();

  if(req.method === "GET"){
    const { page=1, limit=10, status, technicianId, today } = req.query;
    const q = {};
    if(user.role === "technician"){
      q.technicianId = user._id;
    } else if(technicianId){
      q.technicianId = technicianId;
    }
    if(status) q.status = status;
    if(today === "true"){
      const start = new Date(); start.setHours(0,0,0,0);
      const end = new Date(); end.setHours(23,59,59,999);
      q.createdAt = { $gte: start, $lte: end };
    }
    const skip = (parseInt(page)-1)*parseInt(limit);
    const [items, total] = await Promise.all([
      calls.find(q).sort({ createdAt:-1 }).skip(skip).limit(parseInt(limit)).toArray(),
      calls.countDocuments(q)
    ]);
    return res.json({ items, total });
  }

  if(req.method === "POST"){
    // admin assigns a call
    if(user.role !== "admin") return res.status(403).json({ error: "Only admin" });
    const { clientName, phone, address, technicianId } = req.body || {};
    if(!clientName || !phone || !address || !technicianId) return res.status(400).json({ error: "Missing fields" });
    const doc = { clientName, phone, address, technicianId, status: "Pending", createdAt: new Date() };
    const { insertedId } = await calls.insertOne(doc);
    return res.json({ ok:true, id: insertedId.toString() });
  }

  if(req.method === "PATCH"){
    // technician updates status
    const { id, status } = req.body || {};
    if(!id || !status) return res.status(400).json({ error: "Missing fields" });
    const { ObjectId } = await import("mongodb");
    const q = { _id: new ObjectId(id) };
    const upd = { $set: { status } };
    if(user.role === "technician"){
      upd.$set.technicianId = user._id; // ensure ownership
    }
    await calls.updateOne(q, upd);
    return res.json({ ok:true });
  }

  res.status(405).end();
}
