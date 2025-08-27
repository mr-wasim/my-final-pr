
import AdminLayout from "./_layout";
import { useEffect, useState } from "react";
import { useToast } from "../_app";

export default function CallForwarding(){
  const [techs, setTechs] = useState([]);
  const [form, setForm] = useState({ clientName:"", phone:"", address:"", technicianId:"" });
  const { push } = useToast();

  useEffect(()=>{ (async()=>{
    const r = await fetch("/api/technicians"); if(r.ok){ const d=await r.json(); setTechs(d.list); }
  })(); },[]);

  async function submit(e){
    e.preventDefault();
    const r = await fetch("/api/calls", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(form) });
    if(r.ok){ push("Call forwarded"); setForm({ clientName:"", phone:"", address:"", technicianId:"" }); }
    else { const d = await r.json(); push(d.error || "Error"); }
  }

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">Call Forwarding</h1>
      <form onSubmit={submit} className="grid gap-3 bg-white rounded-2xl p-4 border shadow max-w-2xl">
        <Input label="Client Name" value={form.clientName} onChange={v=>setForm({...form, clientName:v})} />
        <Input label="Client Phone Number" value={form.phone} onChange={v=>setForm({...form, phone:v})} />
        <Input label="Address" value={form.address} onChange={v=>setForm({...form, address:v})} />
        <div>
          <label className="block text-sm font-medium">Select Technician</label>
          <select className="w-full border rounded-xl px-3 py-2" value={form.technicianId} onChange={e=>setForm({...form, technicianId:e.target.value})}>
            <option value="">-- Select --</option>
            {techs.map(t => <option key={t._id} value={t._id}>{t.name || t.username}</option>)}
          </select>
        </div>
        <button className="px-4 py-2 rounded-xl bg-slate-900 text-white">Forward</button>
      </form>
    </AdminLayout>
  );
}
function Input({ label, value, onChange }){
  return <div><label className="block text-sm font-medium">{label}</label>
    <input className="w-full border rounded-xl px-3 py-2" value={value} onChange={e=>onChange(e.target.value)} /></div>
}
