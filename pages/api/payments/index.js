
import { getUserFromReq } from "../../../lib/auth";
import { Collections } from "../../../models";

export default async function handler(req,res){
  const user = getUserFromReq(req);
  if(!user) return res.status(401).json({ error: "Unauthorized" });
  const { payments } = await Collections();

  if(req.method === "GET"){
    // admin reports with filters
    if(user.role !== "admin") return res.status(403).json({ error: "Only admin" });
    const { technicianId, start, end, today, q } = req.query;
    const query = {};
    if(technicianId) query.technicianId = technicianId;
    if(today === "true"){
      const s = new Date(); s.setHours(0,0,0,0);
      const e = new Date(); e.setHours(23,59,59,999);
      query.createdAt = { $gte: s, $lte: e };
    } else if(start && end){
      query.createdAt = { $gte: new Date(start), $lte: new Date(end) };
    }
    if(q){
      query.$or = [
        { clientName: { $regex: q, $options: "i" } },
        { phone: { $regex: q, $options: "i" } }
      ];
    }
    const items = await payments.find(query).sort({ createdAt:-1 }).toArray();
    const totals = items.reduce((acc, x) => {
      acc.online += Number(x.online||0);
      acc.cash += Number(x.cash||0);
      return acc;
    }, { online:0, cash:0 });
    totals.total = totals.online + totals.cash;
    return res.json({ items, totals });
  }

  if(req.method === "POST"){
    // technician submits payment mode
    if(user.role !== "technician") return res.status(403).json({ error: "Only technician" });
    const { payToName, mode, online, cash, clientName, phone, signature } = req.body || {};
    if(!payToName || !mode || !signature) return res.status(400).json({ error: "Missing fields" });
    const doc = {
      technicianId: user._id, payToName, mode, online: Number(online||0), cash: Number(cash||0),
      signature, clientName: clientName||"", phone: phone||"", createdAt: new Date()
    };
    await payments.insertOne(doc);
    return res.json({ ok: true });
  }

  res.status(405).end();
}
