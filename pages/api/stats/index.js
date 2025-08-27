
import { getUserFromReq } from "../../../lib/auth";
import { Collections } from "../../../models";

export default async function handler(req,res){
  const user = getUserFromReq(req);
  if(!user || user.role !== "admin") return res.status(401).json({ error: "Unauthorized" });
  const { serviceForms, calls, payments, users } = await Collections();
  const [formsCount, callsPending, techCount, paymentsToday] = await Promise.all([
    serviceForms.countDocuments({}),
    calls.countDocuments({ status: { $in: ["Pending", "In Process"] } }),
    users.countDocuments({ role: "technician" }),
    payments.countDocuments((() => {
      const s = new Date(); s.setHours(0,0,0,0);
      const e = new Date(); e.setHours(23,59,59,999);
      return { createdAt: { $gte: s, $lte: e } };
    })())
  ]);
  res.json({ formsCount, callsPending, techCount, paymentsToday });
}
