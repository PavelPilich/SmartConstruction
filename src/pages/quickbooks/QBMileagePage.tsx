import { useState } from "react";
import {
  MapPin, Car, DollarSign, Calendar, Plus, Play, Download, RefreshCw,
  Upload, Navigation, Fuel, Wrench, TrendingUp, Clock,
} from "lucide-react";
import { Badge, Btn, StatCard, Modal, SmartSelect } from "../../components/ui";

/* ── Types ── */
interface Trip {
  id: string;
  date: string;
  from: string;
  to: string;
  miles: number;
  purpose: string;
  vehicle: string;
  category: TripCategory;
}

type TripCategory = "Job Site" | "Supplies" | "Admin" | "Meeting" | "Personal";

interface Vehicle {
  id: string;
  name: string;
  year: number;
  type: string;
  odometer: number;
  totalMiles: number;
  serviceDue: string;
  primary: boolean;
}

/* ── Data ── */
const IRS_RATE = 0.67;

const initialTrips: Trip[] = [
  { id: "t1", date: "2026-03-30", from: "Office — 7800 Metro Blvd", to: "4821 Maple Dr, Plymouth", miles: 12.4, purpose: "Inspection — Thompson", vehicle: "2024 Ford F-150", category: "Job Site" },
  { id: "t2", date: "2026-03-29", from: "Office", to: "612 Oak Ave, Maple Grove", miles: 18.2, purpose: "Estimate — Johnson", vehicle: "2024 Ford F-150", category: "Job Site" },
  { id: "t3", date: "2026-03-28", from: "Office", to: "Home Depot Plymouth", miles: 8.6, purpose: "Material pickup", vehicle: "2024 Ford F-150", category: "Supplies" },
  { id: "t4", date: "2026-03-27", from: "Office", to: "MN Dept of Commerce", miles: 14.1, purpose: "License renewal", vehicle: "2022 Toyota Camry", category: "Admin" },
  { id: "t5", date: "2026-03-26", from: "Office", to: "1250 Nicollet Mall", miles: 6.8, purpose: "Client meeting — Garcia", vehicle: "2022 Toyota Camry", category: "Meeting" },
  { id: "t6", date: "2026-03-25", from: "Office", to: "9200 Bass Lake Rd, New Hope", miles: 16.4, purpose: "Final walkthrough — Park", vehicle: "2024 Ford F-150", category: "Job Site" },
  { id: "t7", date: "2026-03-24", from: "Office", to: "Menards Edina", miles: 4.2, purpose: "Lumber pickup", vehicle: "2024 Ford F-150", category: "Supplies" },
  { id: "t8", date: "2026-03-23", from: "Office", to: "3400 Xenium Ln, Plymouth", miles: 22.8, purpose: "Roof inspection — Davis", vehicle: "2024 Ford F-150", category: "Job Site" },
  { id: "t9", date: "2026-03-22", from: "Office", to: "Mall of America", miles: 11.6, purpose: "Personal errand", vehicle: "2022 Toyota Camry", category: "Personal" },
  { id: "t10", date: "2026-03-21", from: "Office", to: "ABC Supply Plymouth", miles: 9.4, purpose: "Shingle order pickup", vehicle: "2024 Ford F-150", category: "Supplies" },
  { id: "t11", date: "2026-03-20", from: "Office", to: "5100 Eden Ave, Edina", miles: 3.8, purpose: "Estimate — Wilson", vehicle: "2024 Ford F-150", category: "Job Site" },
  { id: "t12", date: "2026-03-19", from: "Office", to: "CPA Office — Bloomington", miles: 8.2, purpose: "Tax meeting", vehicle: "2022 Toyota Camry", category: "Meeting" },
  { id: "t13", date: "2026-03-18", from: "Office", to: "7200 France Ave, Edina", miles: 2.4, purpose: "Permit office", vehicle: "2024 Ford F-150", category: "Admin" },
  { id: "t14", date: "2026-03-17", from: "Office", to: "2800 Wayzata Blvd", miles: 15.6, purpose: "Inspection — Brown", vehicle: "2024 Ford F-150", category: "Job Site" },
  { id: "t15", date: "2026-03-16", from: "Office", to: "Gym — Lifetime Fitness", miles: 5.2, purpose: "Personal", vehicle: "2022 Toyota Camry", category: "Personal" },
  { id: "t16", date: "2026-03-15", from: "Office", to: "1800 Industrial Blvd, MPLS", miles: 12.0, purpose: "Sub meeting — Petrov", vehicle: "2024 Ford F-150", category: "Meeting" },
  { id: "t17", date: "2026-03-14", from: "Office", to: "Sherwin-Williams Edina", miles: 3.6, purpose: "Paint samples", vehicle: "2024 Ford F-150", category: "Supplies" },
  { id: "t18", date: "2026-03-13", from: "Office", to: "952 Woodhill Rd, Minnetonka", miles: 19.8, purpose: "New lead visit — Mitchell", vehicle: "2024 Ford F-150", category: "Job Site" },
];

const initialVehicles: Vehicle[] = [
  { id: "v1", name: "2024 Ford F-150", year: 2024, type: "Truck", odometer: 18420, totalMiles: 18420, serviceDue: "Apr 15, 2026", primary: true },
  { id: "v2", name: "2022 Toyota Camry", year: 2022, type: "Sedan", odometer: 34800, totalMiles: 34800, serviceDue: "May 1, 2026", primary: false },
];

const categories: TripCategory[] = ["Job Site", "Supplies", "Admin", "Meeting", "Personal"];

const catColors: Record<TripCategory, string> = {
  "Job Site": "#3b82f6",
  Supplies: "#f59e0b",
  Admin: "#8b5cf6",
  Meeting: "#10b981",
  Personal: "#94a3b8",
};

const fmt = (n: number) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtInt = (n: number) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const monthlySummary = [
  { month: "Jan", miles: 842 },
  { month: "Feb", miles: 964 },
  { month: "Mar", miles: 1041 },
];

/* ── Component ── */
export default function QBMileagePage() {
  const [trips, setTrips] = useState(initialTrips);
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [logOpen, setLogOpen] = useState(false);
  const [vehicleOpen, setVehicleOpen] = useState(false);
  const [tracking, setTracking] = useState(false);
  const [form, setForm] = useState({ date: "2026-03-30", from: "", to: "", miles: "", purpose: "", vehicle: vehicles[0].name, category: "Job Site" as TripCategory });
  const [vehicleForm, setVehicleForm] = useState({ name: "", odometer: "" });

  const totalMiles = 2847;
  const businessMiles = trips.filter((t) => t.category !== "Personal").reduce((a, t) => a + t.miles, 0);
  const personalMiles = trips.filter((t) => t.category === "Personal").reduce((a, t) => a + t.miles, 0);
  const allBusinessMiles = 2614;
  const allPersonalMiles = 233;
  const taxDeduction = allBusinessMiles * IRS_RATE;
  const tripsThisMonth = trips.filter((t) => t.date >= "2026-03-01").length;

  const maxMonthMiles = Math.max(...monthlySummary.map((m) => m.miles));

  const handleLogTrip = () => {
    const miles = parseFloat(form.miles);
    if (!form.from || !form.to || isNaN(miles) || miles <= 0 || !form.purpose) return;
    const newTrip: Trip = {
      id: `t${Date.now()}`,
      date: form.date,
      from: form.from,
      to: form.to,
      miles,
      purpose: form.purpose,
      vehicle: form.vehicle,
      category: form.category,
    };
    setTrips((prev) => [newTrip, ...prev]);
    setForm({ date: "2026-03-30", from: "", to: "", miles: "", purpose: "", vehicle: vehicles[0].name, category: "Job Site" });
    setLogOpen(false);
  };

  const handleAddVehicle = () => {
    if (!vehicleForm.name) return;
    const newV: Vehicle = {
      id: `v${Date.now()}`,
      name: vehicleForm.name,
      year: parseInt(vehicleForm.name) || 2024,
      type: "Vehicle",
      odometer: parseInt(vehicleForm.odometer) || 0,
      totalMiles: parseInt(vehicleForm.odometer) || 0,
      serviceDue: "TBD",
      primary: false,
    };
    setVehicles((prev) => [...prev, newV]);
    setVehicleForm({ name: "", odometer: "" });
    setVehicleOpen(false);
  };

  const handleExportCSV = () => {
    const header = "Date,From,To,Miles,Purpose,Vehicle,Category\n";
    const rows = trips.map((t) =>
      `"${t.date}","${t.from}","${t.to}","${t.miles}","${t.purpose}","${t.vehicle}","${t.category}"`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mileage_log_2026.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSyncQB = () => {
    alert("Mileage data synced to QuickBooks successfully.");
  };

  const inputCls = "w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mileage Tracker</h1>
          <p className="text-sm text-gray-500 mt-1">2026 Tax Deduction — IRS Rate: $0.67/mile</p>
        </div>
        <div className="flex gap-2">
          <Btn color="#3b82f6" onClick={() => setLogOpen(true)}>
            <span className="flex items-center gap-1.5"><Plus className="w-4 h-4" /> Log Trip</span>
          </Btn>
          {tracking ? (
            <Btn color="#ef4444" onClick={() => setTracking(false)}>
              <span className="flex items-center gap-1.5"><Navigation className="w-4 h-4 animate-pulse" /> Stop Tracking</span>
            </Btn>
          ) : (
            <Btn color="#10b981" variant="outline" onClick={() => setTracking(true)}>
              <span className="flex items-center gap-1.5"><Play className="w-4 h-4" /> Start GPS Tracking</span>
            </Btn>
          )}
          <Btn color="#6b7280" variant="outline" onClick={() => alert("GPS import simulated — 5 trips imported.")}>
            <span className="flex items-center gap-1.5"><Upload className="w-4 h-4" /> Import from GPS</span>
          </Btn>
        </div>
      </div>

      {/* GPS Tracking Indicator */}
      {tracking && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <Navigation className="w-5 h-5 text-green-600 animate-pulse" />
          <div>
            <span className="text-sm font-medium text-green-800">GPS Tracking Active</span>
            <span className="text-xs text-green-600 ml-2">Recording your route in real-time...</span>
          </div>
          <Btn size="sm" color="#ef4444" className="ml-auto" onClick={() => setTracking(false)}>Stop</Btn>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard icon={MapPin} label="Total Miles" value={totalMiles.toLocaleString()} sub="YTD 2026" color="#3b82f6" />
        <StatCard icon={Car} label="Business Miles" value={allBusinessMiles.toLocaleString()} sub={`${((allBusinessMiles / totalMiles) * 100).toFixed(0)}% of total`} color="#10b981" />
        <StatCard icon={MapPin} label="Personal Miles" value={allPersonalMiles.toLocaleString()} sub={`${((allPersonalMiles / totalMiles) * 100).toFixed(0)}% of total`} color="#94a3b8" />
        <StatCard icon={DollarSign} label="Tax Deduction" value={fmt(taxDeduction)} sub={`at $${IRS_RATE}/mi`} color="#8b5cf6" />
        <StatCard icon={Calendar} label="Trips This Month" value={tripsThisMonth.toString()} sub="March 2026" color="#f59e0b" />
      </div>

      {/* Trip Log Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">Trip Log</h2>
          <div className="flex gap-2">
            <Btn size="sm" color="#3b82f6" variant="outline" onClick={handleExportCSV}>
              <span className="flex items-center gap-1.5"><Download className="w-3.5 h-3.5" /> Export for Tax Filing</span>
            </Btn>
            <Btn size="sm" color="#10b981" variant="outline" onClick={handleSyncQB}>
              <span className="flex items-center gap-1.5"><RefreshCw className="w-3.5 h-3.5" /> Sync to QuickBooks</span>
            </Btn>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-medium text-gray-500">Date</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">From</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">To</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Miles</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Purpose</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Vehicle</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Category</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {trips.map((trip) => (
                <tr key={trip.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                    {new Date(trip.date).toLocaleDateString("en", { month: "short", day: "numeric" })}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs max-w-[180px] truncate">{trip.from}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs max-w-[180px] truncate">{trip.to}</td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">{trip.miles.toFixed(1)}</td>
                  <td className="px-4 py-3 text-gray-700 text-xs">{trip.purpose}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{trip.vehicle}</td>
                  <td className="px-4 py-3">
                    <Badge color={catColors[trip.category]}>{trip.category}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vehicles */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900">Vehicles</h2>
          <Btn size="sm" color="#3b82f6" onClick={() => setVehicleOpen(true)}>
            <span className="flex items-center gap-1.5"><Plus className="w-3.5 h-3.5" /> Add Vehicle</span>
          </Btn>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicles.map((v) => (
            <div key={v.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900 text-sm">{v.name}</h3>
                {v.primary && <Badge color="#3b82f6">Primary</Badge>}
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500 flex items-center gap-1"><Fuel className="w-3 h-3" /> Odometer</span>
                  <span className="text-gray-900 font-medium">{v.odometer.toLocaleString()} mi</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Total Miles</span>
                  <span className="text-gray-900 font-medium">{v.totalMiles.toLocaleString()} mi</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 flex items-center gap-1"><Wrench className="w-3 h-3" /> Service Due</span>
                  <span className="text-gray-900 font-medium">{v.serviceDue}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Summary */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-bold text-gray-900 mb-4">Monthly Summary</h2>
        <div className="flex items-end gap-6 h-36 mb-4">
          {monthlySummary.map((m) => (
            <div key={m.month} className="flex flex-col items-center gap-1 flex-1">
              <span className="text-xs font-semibold text-gray-900">{m.miles} mi</span>
              <div className="w-full max-w-[60px] bg-gray-100 rounded-t" style={{ height: `${(m.miles / maxMonthMiles) * 100}px` }}>
                <div className="w-full bg-blue-500 rounded-t h-full" />
              </div>
              <span className="text-xs text-gray-500">{m.month}</span>
            </div>
          ))}
        </div>
        {/* Business vs Personal split */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Business: {allBusinessMiles} mi ({((allBusinessMiles / totalMiles) * 100).toFixed(0)}%)</span>
            <span>Personal: {allPersonalMiles} mi ({((allPersonalMiles / totalMiles) * 100).toFixed(0)}%)</span>
          </div>
          <div className="flex h-3 rounded-full overflow-hidden bg-gray-100">
            <div className="bg-blue-500 h-full" style={{ width: `${(allBusinessMiles / totalMiles) * 100}%` }} />
            <div className="bg-gray-400 h-full" style={{ width: `${(allPersonalMiles / totalMiles) * 100}%` }} />
          </div>
        </div>
        <div className="flex items-center justify-between bg-purple-50 rounded-lg p-3">
          <span className="text-sm text-purple-700 font-medium">Total Tax Deduction (YTD)</span>
          <span className="text-lg font-bold text-purple-900">{fmt(taxDeduction)}</span>
        </div>
      </div>

      {/* Log Trip Modal */}
      <Modal open={logOpen} onClose={() => setLogOpen(false)} title="Log Trip">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Date</label>
            <input className={inputCls} type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">From</label>
            <input className={inputCls} placeholder="Starting location" value={form.from} onChange={(e) => setForm((f) => ({ ...f, from: e.target.value }))} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">To</label>
            <input className={inputCls} placeholder="Destination" value={form.to} onChange={(e) => setForm((f) => ({ ...f, to: e.target.value }))} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Miles</label>
            <input className={inputCls} type="number" min="0" step="0.1" placeholder="0.0" value={form.miles} onChange={(e) => setForm((f) => ({ ...f, miles: e.target.value }))} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Purpose</label>
            <input className={inputCls} placeholder="e.g., Inspection — Thompson" value={form.purpose} onChange={(e) => setForm((f) => ({ ...f, purpose: e.target.value }))} />
          </div>
          <SmartSelect
            label="Vehicle"
            value={form.vehicle}
            onChange={(v) => setForm((f) => ({ ...f, vehicle: v }))}
            options={vehicles.map((v) => v.name)}
            onAddNew={(v) => {
              const newV: Vehicle = { id: `v${Date.now()}`, name: v, year: 2024, type: "Vehicle", odometer: 0, totalMiles: 0, serviceDue: "TBD", primary: false };
              setVehicles((prev) => [...prev, newV]);
            }}
            placeholder="Select vehicle"
          />
          <SmartSelect
            label="Category"
            value={form.category}
            onChange={(v) => setForm((f) => ({ ...f, category: v as TripCategory }))}
            options={categories}
            placeholder="Select category"
          />
          <div className="flex justify-end gap-2 pt-2">
            <Btn color="#94a3b8" variant="outline" onClick={() => setLogOpen(false)}>Cancel</Btn>
            <Btn color="#3b82f6" onClick={handleLogTrip}>Log Trip</Btn>
          </div>
        </div>
      </Modal>

      {/* Add Vehicle Modal */}
      <Modal open={vehicleOpen} onClose={() => setVehicleOpen(false)} title="Add Vehicle">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Vehicle Name</label>
            <input className={inputCls} placeholder="e.g., 2025 Chevy Silverado" value={vehicleForm.name} onChange={(e) => setVehicleForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Current Odometer</label>
            <input className={inputCls} type="number" min="0" placeholder="e.g., 15000" value={vehicleForm.odometer} onChange={(e) => setVehicleForm((f) => ({ ...f, odometer: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Btn color="#94a3b8" variant="outline" onClick={() => setVehicleOpen(false)}>Cancel</Btn>
            <Btn color="#3b82f6" onClick={handleAddVehicle}>Add Vehicle</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
