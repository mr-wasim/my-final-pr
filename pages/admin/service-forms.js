import AdminLayout from "./_layout";
import { useEffect, useState } from "react";
import Filters from "../../components/Filters";
import { downloadCSV } from "../../components/csv";
import { useToast } from "../_app";

export default function ServiceForms(){
  const [items, setItems] = useState([]);
  const [list, setList] = useState([]); // technicians
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const { push } = useToast();

  // load service forms
  async function loadForms(params={}) {
    const r = await fetch(`/api/service-forms?` + new URLSearchParams({ page, limit: 10, ...params }));
    if(r.ok){
      const d = await r.json();
      setItems(d.items); 
      setTotal(d.total);
    }
  }
  useEffect(()=>{ loadForms(); },[page]);

  // load technicians
  async function loadTechnicians(){
    const r = await fetch("/api/technicians");
    if(r.ok){ 
      const d = await r.json(); 
      setList(d.list); 
    }
  }
  useEffect(()=>{ loadTechnicians(); },[]);

  function applyFilters({ q, mode, start, end }){
    const p = {};
    if(q) p.q = q;
    if(mode === "today") p.start = p.end = new Date().toISOString().slice(0,10);
    else if(mode === "7"){
      const s = new Date(); s.setDate(s.getDate()-6);
      p.start = s.toISOString().slice(0,10);
      p.end = new Date().toISOString().slice(0,10);
    } else if(mode === "30"){
      const s = new Date(); s.setDate(s.getDate()-29);
      p.start = s.toISOString().slice(0,10);
      p.end = new Date().toISOString().slice(0,10);
    } else if(mode === "custom"){ p.start = start; p.end = end; }
    loadForms(p);
  }

  function exportCSV(){
    const rows = [["Technician","Client","Phone","Address","Payment","Status","Date"]]
      .concat(items.map(x => {
        const tech = list.find(t => t._id === x.technicianId);
        return [
          tech ? tech.username : x.technicianId, 
          x.clientName, 
          x.phone, 
          x.address, 
          x.payment, 
          x.status, 
          new Date(x.createdAt).toLocaleString()
        ];
      }));
    downloadCSV("service-forms.csv", rows);
  }

  async function del(id){
    if(!confirm("Delete this record?")) return;
    const r = await fetch(`/api/service-forms?id=${id}`, { method:"DELETE" });
    if(r.ok){ push("Deleted"); loadForms(); }
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Service Forms</h1>
        <button onClick={exportCSV} className="px-3 py-2 rounded-xl bg-slate-900 text-white">Export CSV</button>
      </div>
      <Filters onApply={applyFilters} />
      <div className="overflow-auto mt-4 bg-white rounded-2xl border shadow">
        <table className="min-w-full">
          <thead className="bg-slate-50">
            <tr className="text-left">
              <Th>Technician</Th><Th>Client</Th><Th>Phone</Th><Th>Address</Th><Th>Payment</Th><Th>Status</Th><Th>Signature</Th><Th>Date</Th><Th>Action</Th>
            </tr>
          </thead>
          <tbody>
            {items.map(x => {
              const tech = list.find(t => t._id === x.technicianId);
              return (
                <tr key={x._id} className="border-t">
                  <Td>{tech ? tech.username : x.technicianId}</Td>
                  <Td>{x.clientName}</Td>
                  <Td>{x.phone}</Td>
                  <Td>{x.address}</Td>
                  <Td>₹{x.payment||0}</Td>
                  <Td>{x.status}</Td>
                  <Td>{x.signature ? <img src={x.signature} className="h-10"/> : "-"}</Td>
                  <Td>{new Date(x.createdAt).toLocaleString()}</Td>
                  <Td><button onClick={()=>del(x._id)} className="text-red-600">Delete</button></Td>
                </tr>
              );
            })}
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
