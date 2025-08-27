import AdminLayout from "./_layout";
import { useEffect, useState } from "react";
import Filters from "../../components/Filters";
import { downloadCSV } from "../../components/csv";

export default function Payments() {
  const [items, setItems] = useState([]);
  const [totals, setTotals] = useState({ online: 0, cash: 0, total: 0 });
  const [list, setList] = useState([]); // technicians list
  const [selectedTech, setSelectedTech] = useState(""); // current selected technician
  const [page, setPage] = useState(1); // current page
  const [totalPages, setTotalPages] = useState(1); // total pages

  // load payments
  async function load(params = {}) {
    const r = await fetch(`/api/payments?` + new URLSearchParams(params));
    if (r.ok) {
      const d = await r.json();
      setItems(d.items);
      setTotals(d.totals);
      setTotalPages(d.totalPages || 1);
    }
  }

  // load technicians
  async function loadTechnicians() {
    const r = await fetch("/api/technicians");
    if (r.ok) {
      const d = await r.json();
      setList(d.list);
    }
  }

  useEffect(() => {
    loadTechnicians();
  }, []);

  // filters apply
  function applyFilters({ q, mode, start, end }) {
    const p = { limit: 5, page }; // default 5 items per page
    if (q) p.q = q;
    if (mode === "today") p.today = true;
    else if (mode === "7") {
      const s = new Date();
      s.setDate(s.getDate() - 6);
      p.start = s.toISOString().slice(0, 10);
      p.end = new Date().toISOString().slice(0, 10);
    } else if (mode === "30") {
      const s = new Date();
      s.setDate(s.getDate() - 29);
      p.start = s.toISOString().slice(0, 10);
      p.end = new Date().toISOString().slice(0, 10);
    } else if (mode === "custom") {
      p.start = start;
      p.end = end;
    }

    if (selectedTech) p.technicianId = selectedTech; // filter by technician
    load(p);
  }

  // when technician select hota hai
  function handleTechnicianChange(e) {
    const techId = e.target.value;
    setSelectedTech(techId);
    setPage(1); // reset to first page
    if (techId) {
      load({ technicianId: techId, limit: 5, page: 1 });
    } else {
      setItems([]);
      setTotals({ online: 0, cash: 0, total: 0 });
    }
  }

  // pagination
  function changePage(newPage) {
    setPage(newPage);
    load({ technicianId: selectedTech, limit: 5, page: newPage });
  }

  function exportCSV() {
    const rows = [
      ["Technician", "Pay To", "Mode", "Online", "Cash", "Client", "Phone", "Date"],
    ].concat(
      items.map((x) => {
        const tech = list.find((t) => t._id === x.technicianId);
        return [
          tech ? tech.username : x.technicianId,
          x.payToName,
          x.mode,
          x.online,
          x.cash,
          x.clientName,
          x.phone,
          new Date(x.createdAt).toLocaleString(),
        ];
      })
    );
    downloadCSV("payments.csv", rows);
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Reports / Payments</h1>
        <div className="text-right">
          <div className="text-sm">
            Online: ₹{totals.online} | Cash: ₹{totals.cash}
          </div>
          <div className="text-lg font-bold">Total: ₹{totals.total}</div>
        </div>
      </div>

      {/* Technician Selector */}
      <div className="mb-4">
        <label className="mr-2 font-medium">Select Technician:</label>
        <select
          className="border px-3 py-2 rounded"
          value={selectedTech}
          onChange={handleTechnicianChange}
        >
          <option value="">-- Choose Technician --</option>
          {list.map((t) => (
            <option key={t._id} value={t._id}>
              {t.username}
            </option>
          ))}
        </select>
      </div>

      {selectedTech && (
        <>
          <Filters onApply={applyFilters} />
          <div className="bg-white rounded-2xl border shadow overflow-auto mt-4">
            <table className="min-w-full">
              <thead className="bg-slate-50">
                <tr className="text-left">
                  <Th>Technician</Th>
                  <Th>Pay To</Th>
                  <Th>Mode</Th>
                  <Th>Online</Th>
                  <Th>Cash</Th>
                  <Th>Signature</Th>
                  <Th>Client</Th>
                  <Th>Phone</Th>
                  <Th>Date</Th>
                </tr>
              </thead>
              <tbody>
                {items.map((x) => {
                  const tech = list.find((t) => t._id === x.technicianId);
                  return (
                    <tr key={x._id} className="border-t">
                      <Td>{tech ? tech.username : x.technicianId}</Td>
                      <Td>{x.payToName}</Td>
                      <Td>{x.mode}</Td>
                      <Td>₹{x.online}</Td>
                      <Td>₹{x.cash}</Td>
                      <Td>
                        {x.signature ? (
                          <img src={x.signature} className="h-10" />
                        ) : (
                          "-"
                        )}
                      </Td>
                      <Td>{x.clientName}</Td>
                      <Td>{x.phone}</Td>
                      <Td>{new Date(x.createdAt).toLocaleString()}</Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => changePage(page - 1)}
              disabled={page === 1}
              className="px-3 py-2 rounded bg-gray-200 disabled:opacity-50"
            >
              Prev
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => changePage(page + 1)}
              disabled={page === totalPages}
              className="px-3 py-2 rounded bg-gray-200 disabled:opacity-50"
            >
              Next
            </button>
          </div>

          <button
            onClick={exportCSV}
            className="mt-4 px-3 py-2 rounded-xl bg-slate-900 text-white"
          >
            Export CSV
          </button>
        </>
      )}
    </AdminLayout>
  );
}

function Th({ children }) {
  return <th className="px-3 py-2 text-sm font-semibold">{children}</th>;
}
function Td({ children }) {
  return <td className="px-3 py-2">{children}</td>;
}
