
import { getUserFromReq } from "../../../lib/auth";
import { Collections } from "../../../models";

export default async function handler(req,res){
  const user = getUserFromReq(req);
  if(!user) return res.status(401).json({ error: "Unauthorized" });
  const { serviceForms } = await Collections();

  if(req.method === "GET"){
    if(user.role !== "admin") return res.status(403).json({ error: "Only admin" });
    const { page=1, limit=10, status, technicianId, start, end, q } = req.query;
    const query = {};
    if(status) query.status = status;
    if(technicianId) query.technicianId = technicianId;
    if(start && end){
      query.createdAt = { $gte: new Date(start), $lte: new Date(end) };
    }
    if(q){
      query.$or = [
        { clientName: { $regex: q, $options: "i" } },
        { phone: { $regex: q, $options: "i" } }
      ];
    }
    const skip = (parseInt(page)-1)*parseInt(limit);
    const [items, total] = await Promise.all([
      serviceForms.find(query).sort({ createdAt:-1 }).skip(skip).limit(parseInt(limit)).toArray(),
      serviceForms.countDocuments(query)
    ]);
    return res.json({ items, total });
  }

  if(req.method === "POST"){
    // technician submits
    if(user.role !== "technician") return res.status(403).json({ error: "Only technician" });
    const { clientName, address, payment, phone, status, signature } = req.body || {};
    if(!clientName || !address || !phone || !status) return res.status(400).json({ error: "Missing fields" });
    const doc = { technicianId: user._id, clientName, address, payment: Number(payment||0), phone, status, signature, createdAt: new Date() };
    await serviceForms.insertOne(doc);
    return res.json({ ok:true });
  }

  if(req.method === "DELETE"){
    if(user.role !== "admin") return res.status(403).json({ error: "Only admin" });
    const { id } = req.query;
    const { ObjectId } = await import("mongodb");
    await serviceForms.deleteOne({ _id: new ObjectId(id) });
    return res.json({ ok:true });
  }

  res.status(405).end();
}
