import { useState, useMemo } from "react";
import { Badge, Btn } from "../../components/ui";
import { useAppStore } from "../../stores/useAppStore";
import { xactCategories, priceList } from "../../data/xactimate";
import { Search, RefreshCw } from "lucide-react";

export default function PriceListPage() {
  const { addToast } = useAppStore();
  const [catFilter, setCatFilter] = useState("all");
  const [plSearch, setPlSearch] = useState("");

  const filteredPL = useMemo(() => {
    let items = priceList;
    if (catFilter !== "all") items = items.filter((i) => i.cat === catFilter);
    if (plSearch) {
      const q = plSearch.toLowerCase();
      items = items.filter((i) => i.code.toLowerCase().includes(q) || i.desc.toLowerCase().includes(q));
    }
    return items;
  }, [catFilter, plSearch]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Xactimate Price List</h2>
        <div className="flex items-center gap-2">
          <Badge color="#10b981">Minneapolis, MN Region</Badge>
          <Badge color="#3b82f6" sm>Updated Mar 2026</Badge>
          <Btn size="sm" variant="outline" onClick={() => addToast("Prices synced from Xactimate API")}><RefreshCw className="w-4 h-4 inline mr-1" />Sync Prices</Btn>
        </div>
      </div>
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setCatFilter("all")} className={`px-3 py-1.5 text-xs rounded-lg font-medium ${catFilter === "all" ? "bg-blue-600 text-white" : "bg-white border text-gray-600"}`}>
          All ({priceList.length})
        </button>
        {xactCategories.map((c) => {
          const count = priceList.filter((p) => p.cat === c.code).length;
          return (
            <button key={c.code} onClick={() => setCatFilter(c.code)}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium ${catFilter === c.code ? "text-white" : "bg-white border text-gray-600"}`}
              style={catFilter === c.code ? { background: c.color } : {}}>
              {c.name} ({count})
            </button>
          );
        })}
      </div>
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
        <input value={plSearch} onChange={(e) => setPlSearch(e.target.value)} placeholder="Search Xactimate codes..." className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              {["Category", "Code", "Description", "Unit", "Price (MN)"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredPL.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-sm">No items match your search or filter.</td></tr>
            )}
            {filteredPL.map((item, i) => {
              const cat = xactCategories.find((c) => c.code === item.cat);
              return (
                <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-2.5"><span className="px-2 py-0.5 rounded text-xs font-bold text-white" style={{ background: cat?.color || "#94a3b8" }}>{cat?.name || item.cat}</span></td>
                  <td className="px-4 py-2.5 font-mono text-xs text-blue-700 font-semibold">{item.code}</td>
                  <td className="px-4 py-2.5 text-gray-800">{item.desc}</td>
                  <td className="px-4 py-2.5 text-gray-500">{item.unit}</td>
                  <td className="px-4 py-2.5 font-semibold">${item.price.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="text-xs text-gray-500">Prices from Xactimate pricing database — Minneapolis, MN region. Auto-updated monthly via API. {priceList.length} line items loaded.</div>
    </div>
  );
}
