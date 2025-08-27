
export function downloadCSV(filename, rows){
  const processRow = (row) => row.map(col => {
    const inner = (col===null||col===undefined) ? "" : String(col).replace(/"/g, '""');
    if(inner.search(/("|,|\n)/g) >= 0) return `"${inner}"`;
    return inner;
  }).join(",");
  const csvContent = rows.map(processRow).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.click();
}
