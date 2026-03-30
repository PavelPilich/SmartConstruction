import { useNavigate } from "react-router-dom";
import {
  Briefcase, CheckCircle2, Clock, DollarSign, Camera, Eye,
  AlertTriangle, ShieldX, ShieldCheck, FileWarning, ArrowRight, Bell,
} from "lucide-react";
import { StatCard, Badge, Btn } from "../../components/ui";
import { useSubAuth } from "../../components/layout/SubPortalLayout";

export default function SubDashboardPage() {
  const navigate = useNavigate();
  const { complianceStatus } = useSubAuth();

  return (
    <div className="space-y-6">
      {/* Compliance Banner */}
      {complianceStatus === "green" && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-green-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-green-800">All documents current</p>
            <p className="text-xs text-green-600">Your compliance status is up to date. You can accept new jobs.</p>
          </div>
        </div>
      )}
      {complianceStatus === "yellow" && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-yellow-800">2 documents expiring soon</p>
              <p className="text-xs text-yellow-600">Update these before they expire to avoid being blocked.</p>
            </div>
          </div>
          <div className="ml-9 space-y-1">
            <p className="text-xs text-yellow-700 flex items-center gap-1.5">
              <FileWarning className="w-3.5 h-3.5" /> Workers Comp Insurance — expires in 28 days
            </p>
            <p className="text-xs text-yellow-700 flex items-center gap-1.5">
              <FileWarning className="w-3.5 h-3.5" /> Auto Insurance — expires in 45 days
            </p>
          </div>
        </div>
      )}
      {complianceStatus === "red" && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <ShieldX className="w-6 h-6 text-red-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-red-800">BLOCKED — Workers Comp expired. Cannot accept new jobs until renewed.</p>
            <p className="text-xs text-red-600">Upload your renewed Workers Comp certificate to restore access.</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Briefcase} label="Active Jobs" value={3} color="#ea580c" onClick={() => navigate("/sub/myjobs")} />
        <StatCard icon={CheckCircle2} label="Completed This Month" value={5} color="#16a34a" />
        <StatCard icon={Clock} label="Pending Payment" value="$8,400" color="#eab308" onClick={() => navigate("/sub/payments")} />
        <StatCard icon={DollarSign} label="YTD Earnings" value="$42,600" color="#3b82f6" onClick={() => navigate("/sub/payments")} />
      </div>

      {/* My Active Jobs */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-900">My Active Jobs</h2>
          <Btn color="#ea580c" variant="outline" size="sm" onClick={() => navigate("/sub/myjobs")}>
            View All
          </Btn>
        </div>
        <div className="space-y-3">
          {/* Job 1 */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-sm font-bold text-gray-900">MN-0247 Thompson Roof Replacement</p>
                <p className="text-xs text-gray-500">1847 Elm Street, Plymouth, MN 55441</p>
              </div>
              <Badge color="#ea580c">In Progress</Badge>
            </div>
            <p className="text-xs text-gray-600 mb-2">Complete tear-off and re-roof, 28 squares, GAF Timberline HDZ</p>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-green-600">Your Pay: $4,800</span>
              <span className="text-xs text-gray-500">Due Apr 2, 2026</span>
            </div>
            {/* Progress bar */}
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>Progress</span>
                <span>60%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-orange-500 h-2 rounded-full transition-all" style={{ width: "60%" }} />
              </div>
              <p className="text-[11px] text-gray-400 mt-0.5">12 photos uploaded</p>
            </div>
            <div className="flex gap-2">
              <Btn color="#ea580c" size="sm" onClick={() => navigate("/sub/myjobs")} className="flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5" /> Upload Photos
              </Btn>
              <Btn color="#6b7280" variant="outline" size="sm" onClick={() => navigate("/sub/myjobs")} className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" /> View Details
              </Btn>
            </div>
          </div>

          {/* Job 2 */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-sm font-bold text-gray-900">MN-0089 Garcia Siding</p>
                <p className="text-xs text-gray-500">2340 Birch Lane, Maple Grove, MN 55369</p>
              </div>
              <Badge color="#3b82f6">Scheduled</Badge>
            </div>
            <p className="text-xs text-gray-600 mb-2">LP SmartSide siding install, east and south walls</p>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-green-600">Your Pay: $4,200</span>
              <span className="text-xs text-gray-500">Starts Mar 31, 2026</span>
            </div>
            <Btn color="#6b7280" variant="outline" size="sm" onClick={() => navigate("/sub/myjobs")} className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" /> View Details
            </Btn>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-3">Recent Activity</h2>
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          <div className="px-4 py-3 flex items-start gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <DollarSign className="w-4 h-4 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">Payment received: <span className="font-bold">$3,600</span> for MN-0156 Chen Windows</p>
              <p className="text-xs text-gray-400">2 days ago</p>
            </div>
          </div>
          <div className="px-4 py-3 flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">Job completed: <span className="font-bold">MN-0312 Andersen Exterior</span></p>
              <p className="text-xs text-gray-400">5 days ago</p>
            </div>
          </div>
          <div className="px-4 py-3 flex items-start gap-3">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <Bell className="w-4 h-4 text-orange-600" />
            </div>
            <div className="flex-1 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-900">New job available: <span className="font-bold">Roof Replacement in Edina</span></p>
                <p className="text-xs text-gray-400">1 hour ago</p>
              </div>
              <button onClick={() => navigate("/sub/jobs")} className="text-orange-600 hover:text-orange-700 transition">
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Documents Expiring */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-3">Documents Status</h2>
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-900">Workers Comp Insurance</p>
                <p className="text-xs text-gray-500">Expires in 28 days</p>
              </div>
            </div>
            <Badge color="#eab308">Expiring</Badge>
          </div>
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <div>
                <p className="text-sm text-gray-900">Auto Insurance</p>
                <p className="text-xs text-gray-500">Expires in 45 days</p>
              </div>
            </div>
            <Badge color="#16a34a">OK</Badge>
          </div>
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <div>
                <p className="text-sm text-gray-900">General Liability Insurance</p>
                <p className="text-xs text-gray-500">Expires in 180 days</p>
              </div>
            </div>
            <Badge color="#16a34a">OK</Badge>
          </div>
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <div>
                <p className="text-sm text-gray-900">W-9 Form</p>
                <p className="text-xs text-gray-500">On file</p>
              </div>
            </div>
            <Badge color="#16a34a">OK</Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
