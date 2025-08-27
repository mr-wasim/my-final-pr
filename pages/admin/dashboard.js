
import AdminLayout from "./_layout";
import { useEffect, useState } from "react";

export default function Dashboard(){
  const [stats, setStats] = useState(null);
  useEffect(() => { (async()=>{
    const r = await fetch("/api/stats"); if(r.ok) setStats(await r.json());
  })(); }, []);

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      {!stats ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_,i)=><div key={i} className="h-28 skeleton rounded-2xl"/>)}
      </div> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card title="Total Service Forms" value={stats.formsCount} />
          <Card title="Active Calls" value={stats.callsPending} />
          <Card title="Technicians" value={stats.techCount} />
          <Card title="Payments Today" value={stats.paymentsToday} />
        </div>
      )}
    </AdminLayout>
  );
}

function Card({ title, value }){
  return (
    <div className="p-6 bg-white rounded-2xl shadow border">
      <div className="text-sm text-slate-500">{title}</div>
      <div className="text-3xl font-extrabold">{value}</div>
    </div>
  );
}
