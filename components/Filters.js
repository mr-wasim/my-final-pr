
import { useState } from "react";

export default function Filters({ onApply }){
  const [q, setQ] = useState("");
  const [mode, setMode] = useState("all");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  function apply(){
    onApply && onApply({ q, mode, start, end });
  }
  return (
    <div className="flex flex-wrap items-end gap-2">
      <div className="flex-1 min-w-[200px]">
        <label className="block text-xs font-medium">Search (name/phone)</label>
        <input className="w-full border rounded-xl px-3 py-2" value={q} onChange={e=>setQ(e.target.value)} placeholder="Search..." />
      </div>
      <div>
        <label className="block text-xs font-medium">Quick Range</label>
        <select className="border rounded-xl px-3 py-2" value={mode} onChange={e=>setMode(e.target.value)}>
          <option value="all">All</option>
          <option value="today">Today</option>
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="custom">Custom</option>
        </select>
      </div>
      {mode === "custom" && (
        <>
          <div>
            <label className="block text-xs font-medium">Start</label>
            <input type="date" className="border rounded-xl px-3 py-2" value={start} onChange={e=>setStart(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium">End</label>
            <input type="date" className="border rounded-xl px-3 py-2" value={end} onChange={e=>setEnd(e.target.value)} />
          </div>
        </>
      )}
      <button onClick={apply} className="px-4 py-2 rounded-xl bg-slate-900 text-white">Apply</button>
    </div>
  );
}
