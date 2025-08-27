
import AdminLayout from "./_layout";
import { useEffect, useState } from "react";
import { downloadCSV } from "../../components/csv";

export default function ForwardedCalls(){
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  async function load(){
    const r = await fetch(`/api/calls?page=${page}&limit=10`);
    if(r.ok){ const d=await r.json(); setItems(d.items); setTotal(d.total); }
  }
  useEffect(()=>{ load(); },[page]);

  function exportCSV(){
    const rows = [["Client","Phone","Address","TechnicianId","Status","Date"]]
      .concat(items.map(x=>[x.clientName,x.phone,x.address,x.technicianId,x.status,new Date(x.createdAt).toLocaleString()]));
    downloadCSV("forwarded-calls.csv", rows);
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Forwarded Calls</h1>
        <button onClick={exportCSV} className="px-3 py-2 rounded-xl bg-slate-900 text-white">Export CSV</button>
      </div>
      <div className="bg-white rounded-2xl border shadow overflow-auto">
        <table className="min-w-full">
          <thead className="bg-slate-50">
            <tr className="text-left"><Th>Client</Th><Th>Phone</Th><Th>Address</Th><Th>Technician</Th><Th>Status</Th><Th>Date</Th></tr>
          </thead>
          <tbody>
            {items.map(x => (
              <tr key={x._id} className="border-t">
                <Td>{x.clientName}</Td><Td>{x.phone}</Td><Td>{x.address}</Td><Td>{x.technicianId}</Td><Td>{x.status}</Td><Td>{new Date(x.createdAt).toLocaleString()}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={page} total={total} onChange={setPage} />
    </AdminLayout>
  );
}
function Th({children}){ return <th className="px-3 py-2 text-sm font-semibold">{children}</th> }
function Td({children}){ return <td className="px-3 py-2">{children}</td> }
function Pagination({ page, total, onChange }){
  const pages = Math.max(1, Math.ceil(total/10));
  return (
    <div className="flex justify-end gap-2 mt-4">
      <button disabled={page<=1} onClick={()=>onChange(page-1)} className="px-3 py-1 rounded-lg border disabled:opacity-50">Prev</button>
      <div className="px-3 py-1">Page {page} / {pages}</div>
      <button disabled={page>=pages} onClick={()=>onChange(page+1)} className="px-3 py-1 rounded-lg border disabled:opacity-50">Next</button>
    </div>
  );
}
