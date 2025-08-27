
import AdminLayout from "./_layout";
import { useEffect, useState } from "react";
import { useToast } from "../_app";

export default function Technicians(){
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ username:"", name:"", password:"" });
  const { push } = useToast();

  async function load(){
    const r = await fetch("/api/technicians");
    if(r.ok){ const d=await r.json(); setList(d.list); }
  }
  useEffect(()=>{ load(); },[]);

  async function create(e){
    e.preventDefault();
    const r = await fetch("/api/technicians", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(form) });
    const d = await r.json();
    if(r.ok){ push("Technician created"); setForm({ username:"", name:"", password:"" }); load(); }
    else push(d.error || "Error");
  }

  async function del(id){
    if(!confirm("Delete technician?")) return;
    const r = await fetch("/api/technicians?id="+id, { method:"DELETE" });
    if(r.ok){ push("Deleted"); load(); }
  }

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">Technicians</h1>
      <form onSubmit={create} className="grid gap-3 bg-white rounded-2xl p-4 border shadow max-w-xl mb-6">
        <Input label="Username" value={form.username} onChange={v=>setForm({...form, username:v})} />
        <Input label="Name" value={form.name} onChange={v=>setForm({...form, name:v})} />
        <Input label="Password" type="password" value={form.password} onChange={v=>setForm({...form, password:v})} />
        <button className="px-4 py-2 rounded-xl bg-slate-900 text-white">Create Technician</button>
      </form>
      <div className="bg-white rounded-2xl border shadow overflow-auto">
        <table className="min-w-full">
          <thead className="bg-slate-50"><tr className="text-left"><Th>Name</Th><Th>Username</Th><Th>Created</Th><Th>Action</Th></tr></thead>
          <tbody>{list.map(x=>(
            <tr key={x._id} className="border-t">
              <Td>{x.name||"-"}</Td><Td>{x.username}</Td><Td>{new Date(x.createdAt).toLocaleString()}</Td>
              <Td><button onClick={()=>del(x._id)} className="text-red-600">Delete</button></Td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
function Input({ label, value, onChange, type="text" }){
  return <div><label className="block text-sm font-medium">{label}</label>
    <input type={type} className="w-full border rounded-xl px-3 py-2" value={value} onChange={e=>onChange(e.target.value)} /></div>
}
function Th({children}){ return <th className="px-3 py-2 text-sm font-semibold">{children}</th> }
function Td({children}){ return <td className="px-3 py-2">{children}</td> }
