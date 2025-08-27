
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import BottomNav from "../../components/BottomNav";
import SignaturePad from "../../components/SignaturePad";
import { useToast } from "../_app";

export default function TechDashboard(){
  const r = useRouter();
  const { push } = useToast();
  const [user, setUser] = useState(null);
  const [active, setActive] = useState("form");
  const [calls, setCalls] = useState({ items:[], total:0 });
  const [lastCount, setLastCount] = useState(0);
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState("all");

  // guard
  useEffect(()=>{ (async()=>{
    const res = await fetch("/api/auth/me");
    if(!res.ok){ r.replace("/login?role=technician"); return; }
    const { user } = await res.json();
    if(user.role !== "technician"){ r.replace("/login?role=technician"); return; }
    setUser(user);
  })(); },[]);

  useEffect(()=>{
    const t = r.query.tab || "form";
    setActive(t);
  }, [r.query.tab]);

  async function loadCalls(extra={}){
    const params = { page, limit: 4, ...extra };
    const q = new URLSearchParams(params);
    const res = await fetch(`/api/calls?`+q.toString());
    if(res.ok){
      const d = await res.json();
      if(d.total > lastCount && lastCount !== 0) push("🔔 New call received");
      setLastCount(d.total);
      setCalls(d);
    }
  }

  useEffect(()=>{
    // initial + polling
    let running = true;
    (async()=>{
      await loadCalls(tab === "today" ? { today: true } : tab === "pending" ? { status: "Pending" } : tab === "completed" ? { status: "Completed" } : {});
      const interval = setInterval(() => {
        if(running) loadCalls(tab === "today" ? { today: true } : tab === "pending" ? { status: "Pending" } : tab === "completed" ? { status: "Completed" } : {});
      }, 15000);
      return () => clearInterval(interval);
    })();
    return () => { running = false; }
  }, [tab, page]);

  // service form state
  const [sf, setSf] = useState({ clientName:"", address:"", payment:"", phone:"", status:"Services Done", signature:"" });

  async function submitServiceForm(e){
    e.preventDefault();
    const res = await fetch("/api/service-forms", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(sf) });
    if(res.ok){ push("Form submitted"); setSf({ clientName:"", address:"", payment:"", phone:"", status:"Services Done", signature:"" }); }
    else { const d = await res.json(); push(d.error || "Error"); }
  }

  // payment mode
  const [pm, setPm] = useState({ payToName:"", mode:"", online:"", cash:"", clientName:"", phone:"", signature:"" });

  async function submitPayment(e){
    e.preventDefault();
    if(!pm.signature){ push("Signature required"); return; }
    const res = await fetch("/api/payments", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(pm) });
    if(res.ok){ push("Payment submitted"); setPm({ payToName:"", mode:"", online:"", cash:"", clientName:"", phone:"", signature:"" }); }
    else { const d = await res.json(); push(d.error || "Error"); }
  }

  async function updateCall(id, status){
    const r2 = await fetch("/api/calls", { method:"PATCH", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ id, status }) });
    if(r2.ok){ push("Status updated"); loadCalls(); }
  }

  function mapsUrl(addr){ return "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(addr); }

  if(!user) return <div className="min-h-screen grid place-items-center"><div className="w-64 h-32 skeleton rounded-2xl"/></div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <header className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
        <div className="font-bold">Chimney CRM</div>
        <div className="text-sm">Tech: {user.username}</div>
        <button onClick={()=>{ fetch('/api/auth/logout',{method:'POST'}).then(()=>location.href='/'); }} className="px-3 py-1 rounded-lg border">Logout</button>
      </header>

      <main className="p-4 max-w-4xl mx-auto">
        {/* Tabs within Calls section */}
        {active === "calls" && (
          <div className="mb-4">
            <div className="flex gap-2">
              {["all","today","pending","completed"].map(t => (
                <button key={t} onClick={()=>{ setTab(t); setPage(1); }} className={`px-3 py-1 rounded-full border ${tab===t?'bg-slate-900 text-white':''}`}>
                  {t==="all"?"All Calls": t==="today"?"Today Calls": t==="pending"?"Pending": t==="completed"?"Completed":"Closed"}
                </button>
              ))}
            </div>
          </div>
        )}

        {active === "form" && (
          <section className="bg-white rounded-2xl p-4 border shadow">
            <h2 className="text-xl font-bold mb-3">Service Form</h2>
            <form onSubmit={submitServiceForm} className="grid gap-3">
              <Input label="Client Name" value={sf.clientName} onChange={v=>setSf({...sf, clientName:v})} />
              <Input label="Client Address" value={sf.address} onChange={v=>setSf({...sf, address:v})} />
              <Input label="Payment (number)" value={sf.payment} onChange={v=>setSf({...sf, payment:v})} />
              <Input label="Phone Number" value={sf.phone} onChange={v=>setSf({...sf, phone:v})} />
              <div>
                <label className="block text-sm font-medium">Status</label>
                <select className="w-full border rounded-xl px-3 py-2" value={sf.status} onChange={e=>setSf({...sf, status:e.target.value})}>
                  <option>Services Done</option>
                  <option>Installation Done</option>
                  <option>Complaint Done</option>
                  <option>Under Process</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Client Signature</label>
                <SignaturePad value={sf.signature} onChange={v=>setSf({...sf, signature:v})} />
              </div>
              <button className="px-4 py-2 rounded-xl bg-slate-900 text-white">Submit</button>
            </form>
          </section>
        )}

        {active === "calls" && (
          <section className="bg-white rounded-2xl p-4 border shadow">
            <h2 className="text-xl font-bold mb-3">Forwarded Calls</h2>
            <div className="grid gap-3">
              {calls.items.map((x,i)=>(
                <div key={x._id||i} className="rounded-xl border p-3">
                  <div className="flex justify-between">
                    <div>
                      <div className="font-semibold">{x.clientName} {tab==='today' && <span className="ml-2 text-red-600 text-xs">NEW</span>}</div>
                      <div className="text-sm text-slate-600">{x.phone} • {x.address}</div>
                    </div>
                    <a href={`tel:${x.phone}`} className="px-3 py-1 rounded-lg border">Call</a>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs px-2 py-1 rounded-full border">{x.status}</span>
                    <a className="px-3 py-1 rounded-lg border" target="_blank" href={mapsUrl(x.address)}>Go</a>
                    <select className="px-2 py-1 border rounded-lg" value={x.status} onChange={e=>updateCall(x._id, e.target.value)}>
                      <option>Pending</option>
                      <option>In Process</option>
                      <option>Completed</option>
                      <option>Closed</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
            <Pagination page={page} total={calls.total} onChange={setPage} />
          </section>
        )}

        {active === "payments" && (
          <section className="bg-white rounded-2xl p-4 border shadow">
            <h2 className="text-xl font-bold mb-3">Payment Mode</h2>
            <form onSubmit={submitPayment} className="grid gap-3">
              <Input label="Paying To (Name)" value={pm.payToName} onChange={v=>setPm({...pm, payToName:v})} />
              <div>
                <label className="block text-sm font-medium">Payment Mode</label>
                <select className="w-full border rounded-xl px-3 py-2" value={pm.mode} onChange={e=>setPm({...pm, mode:e.target.value})}>
                  <option value="">Select</option>
                  <option>Online</option>
                  <option>Cash</option>
                  <option>Online + Cash</option>
                </select>
              </div>
              <Input label="Online Amount" value={pm.online} onChange={v=>setPm({...pm, online:v})} />
              <Input label="Cash Amount" value={pm.cash} onChange={v=>setPm({...pm, cash:v})} />
              <Input label="Client Name (optional)" value={pm.clientName} onChange={v=>setPm({...pm, clientName:v})} />
              <Input label="Client Phone (optional)" value={pm.phone} onChange={v=>setPm({...pm, phone:v})} />
              <div>
                <label className="block text-sm font-medium mb-1">Receiver Signature (required)</label>
                <SignaturePad value={pm.signature} onChange={v=>setPm({...pm, signature:v})} />
              </div>
              <button className="px-4 py-2 rounded-xl bg-slate-900 text-white">Submit Payment</button>
            </form>
          </section>
        )}

        {active === "user" && (
          <section className="bg-white rounded-2xl p-4 border shadow">
            <h2 className="text-xl font-bold mb-3">User</h2>
            <div>Welcome, {user.username}</div>
            <div className="text-sm text-slate-600">View your forwarded calls, submit forms and payments using the tabs below.</div>
          </section>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

function Input({ label, value, onChange, type="text" }){
  return <div><label className="block text-sm font-medium">{label}</label>
    <input type={type} className="w-full border rounded-xl px-3 py-2" value={value} onChange={e=>onChange(e.target.value)} /></div>
}
function Pagination({ page, total, onChange }){
  const pages = Math.max(1, Math.ceil((total||0)/4));
  return (
    <div className="flex justify-end gap-2 mt-4">
      <button disabled={page<=1} onClick={()=>onChange(page-1)} className="px-3 py-1 rounded-lg border disabled:opacity-50">Prev</button>
      <div className="px-3 py-1">Page {page} / {pages}</div>
      <button disabled={page>=pages} onClick={()=>onChange(page+1)} className="px-3 py-1 rounded-lg border disabled:opacity-50">Next</button>
    </div>
  );
}
