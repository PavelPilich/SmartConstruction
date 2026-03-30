import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays, CheckCircle2, Clock, Circle, Users, CloudSun,
  CalendarClock, MessageSquare, Send,
} from "lucide-react";
import { Badge, Btn, Modal } from "../../components/ui";
import { usePortalAuth } from "../../components/layout/PortalLayout";

interface ScheduleItem {
  date: string;
  dayLabel: string;
  title: string;
  description: string;
  crew: string;
  status: "Completed" | "Today" | "Upcoming";
  weather?: string;
}

const schedule: ScheduleItem[] = [
  {
    date: "Mar 28", dayLabel: "Friday",
    title: "Roof tear-off begins (Day 1-2)",
    description: "Remove all existing shingles, underlayment, and damaged decking from south and west slopes. Dump trailer staged in driveway.",
    crew: "Mike Rodriguez crew (4 installers)",
    status: "Completed",
  },
  {
    date: "Mar 29", dayLabel: "Saturday",
    title: "Underlayment and shingle installation",
    description: "Install GAF FeltBuster synthetic underlayment, ice & water shield at eaves/valleys, and begin GAF Timberline HDZ shingle install on south slope.",
    crew: "Mike Rodriguez crew (4 installers)",
    status: "Completed",
  },
  {
    date: "Mar 30", dayLabel: "Sunday",
    title: "New shingles installation (Day 3-4)",
    description: "Continue shingle installation on west and north slopes. Install ridge vent and ridge cap shingles. Flash all penetrations.",
    crew: "Mike Rodriguez crew (3 installers)",
    status: "Today",
    weather: "62\u00b0F, Clear skies",
  },
  {
    date: "Apr 1", dayLabel: "Tuesday",
    title: "Gutter replacement",
    description: "Remove old 5-inch aluminum gutters. Install new seamless gutters in white with leaf guard system. Re-attach downspouts.",
    crew: "Alex Petrov (gutter specialist)",
    status: "Upcoming",
    weather: "58\u00b0F, Partly cloudy",
  },
  {
    date: "Apr 2", dayLabel: "Wednesday",
    title: "Final cleanup and touch-ups",
    description: "Magnetic nail sweep of yard and driveway. Touch up any sealant. Clean all debris. Final walk-around with homeowner.",
    crew: "Mike Rodriguez + 1 helper",
    status: "Upcoming",
    weather: "52\u00b0F, Rain likely",
  },
  {
    date: "Apr 3", dayLabel: "Thursday",
    title: "Final drone inspection",
    description: "DJI Mavic 3 aerial documentation of completed work for warranty file and insurance supplement (if needed).",
    crew: "Pavel Korotkov (drone pilot)",
    status: "Upcoming",
    weather: "55\u00b0F, Mostly sunny",
  },
  {
    date: "Apr 4", dayLabel: "Friday",
    title: "City of Plymouth inspection",
    description: "Building inspector reviews completed work per permit #BP-2026-0447. Must pass before project closeout.",
    crew: "Pavel Korotkov (on-site contact)",
    status: "Upcoming",
    weather: "60\u00b0F, Clear",
  },
  {
    date: "Apr 5", dayLabel: "Saturday",
    title: "Project complete!",
    description: "Certificate of completion issued. Warranty paperwork delivered. Depreciation holdback recovery submitted to State Farm.",
    crew: "Office (Sarah Mitchell)",
    status: "Upcoming",
  },
];

const statusColors: Record<string, string> = {
  Completed: "#10b981",
  Today: "#3b82f6",
  Upcoming: "#94a3b8",
};

export default function PortalSchedulePage() {
  const navigate = useNavigate();
  const { isLoggedIn } = usePortalAuth();
  const [rescheduleModal, setRescheduleModal] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleReason, setRescheduleReason] = useState("");
  const [rescheduleSubmitted, setRescheduleSubmitted] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ScheduleItem | null>(null);

  if (!isLoggedIn) {
    navigate("/portal", { replace: true });
    return null;
  }

  const handleRescheduleSubmit = () => {
    setRescheduleSubmitted(true);
    setTimeout(() => {
      setRescheduleModal(false);
      setRescheduleSubmitted(false);
      setRescheduleDate("");
      setRescheduleReason("");
    }, 2000);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Work Schedule</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            1847 Maple Grove Dr &bull; Estimated completion: Apr 5, 2026
          </p>
        </div>
        <Btn size="sm" color="#3b82f6" onClick={() => { setRescheduleModal(true); setRescheduleSubmitted(false); }}>
          <CalendarClock className="w-4 h-4 inline mr-1" /> Request Reschedule
        </Btn>
      </div>

      {/* Weather Forecast Bar */}
      <div className="bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl border border-sky-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <CloudSun className="w-4 h-4 text-sky-600" />
          <span className="text-sm font-semibold text-sky-900">7-Day Weather Forecast</span>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
          {[
            { day: "Sun", temp: "62\u00b0", icon: "\u2600\ufe0f", good: true },
            { day: "Mon", temp: "60\u00b0", icon: "\u26c5", good: true },
            { day: "Tue", temp: "58\u00b0", icon: "\u26c5", good: true },
            { day: "Wed", temp: "52\u00b0", icon: "\ud83c\udf27\ufe0f", good: false },
            { day: "Thu", temp: "55\u00b0", icon: "\u2600\ufe0f", good: true },
            { day: "Fri", temp: "60\u00b0", icon: "\u2600\ufe0f", good: true },
            { day: "Sat", temp: "57\u00b0", icon: "\u26c5", good: true },
          ].map((d) => (
            <div key={d.day} className={`text-center p-2 rounded-lg ${d.good ? "bg-green-50" : "bg-red-50"}`}>
              <div className="text-xs font-medium text-gray-600">{d.day}</div>
              <div className="text-lg my-0.5">{d.icon}</div>
              <div className="text-xs font-bold text-gray-800">{d.temp}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="space-y-0">
          {schedule.map((item, i) => (
            <div key={i} className="flex gap-4">
              {/* Timeline line + dot */}
              <div className="flex flex-col items-center w-8 flex-shrink-0">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    item.status === "Completed"
                      ? "bg-green-500"
                      : item.status === "Today"
                      ? "bg-blue-500 ring-4 ring-blue-200 animate-pulse"
                      : "bg-gray-300"
                  }`}
                >
                  {item.status === "Completed" ? (
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  ) : item.status === "Today" ? (
                    <Clock className="w-4 h-4 text-white" />
                  ) : (
                    <Circle className="w-4 h-4 text-white" />
                  )}
                </div>
                {i < schedule.length - 1 && (
                  <div className={`w-0.5 flex-1 my-1 ${item.status === "Completed" ? "bg-green-300" : "bg-gray-200"}`} />
                )}
              </div>

              {/* Content */}
              <div
                className={`flex-1 pb-6 cursor-pointer rounded-lg p-3 -mt-1 transition hover:bg-gray-50 ${
                  item.status === "Today" ? "bg-blue-50 hover:bg-blue-50" : ""
                }`}
                onClick={() => setSelectedItem(item)}
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-gray-500">{item.date} ({item.dayLabel})</span>
                  <Badge color={statusColors[item.status]}>
                    {item.status === "Today" ? "In Progress" : item.status}
                  </Badge>
                </div>
                <h4 className="text-sm font-semibold text-gray-900 mt-1">{item.title}</h4>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" /> {item.crew}
                  </span>
                  {item.weather && (
                    <span className="text-xs text-sky-600 flex items-center gap-1">
                      <CloudSun className="w-3.5 h-3.5" /> {item.weather}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Schedule Item Detail Modal */}
      <Modal
        open={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        title={selectedItem?.title || "Schedule Detail"}
      >
        {selectedItem && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge color={statusColors[selectedItem.status]}>
                {selectedItem.status === "Today" ? "In Progress" : selectedItem.status}
              </Badge>
              <span className="text-sm text-gray-500">{selectedItem.date} ({selectedItem.dayLabel})</span>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-700 leading-relaxed">{selectedItem.description}</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="w-4 h-4 text-gray-400" />
              <span>{selectedItem.crew}</span>
            </div>
            {selectedItem.weather && (
              <div className="flex items-center gap-2 text-sm text-sky-600">
                <CloudSun className="w-4 h-4" />
                <span>{selectedItem.weather}</span>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Btn variant="outline" color="#6b7280" onClick={() => setSelectedItem(null)}>Close</Btn>
              {selectedItem.status === "Upcoming" && (
                <Btn color="#3b82f6" onClick={() => { setSelectedItem(null); setRescheduleModal(true); setRescheduleSubmitted(false); }}>
                  <CalendarClock className="w-4 h-4 inline mr-1" /> Request Change
                </Btn>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Reschedule Request Modal */}
      <Modal
        open={rescheduleModal}
        onClose={() => { setRescheduleModal(false); setRescheduleSubmitted(false); }}
        title={rescheduleSubmitted ? "Request Submitted" : "Request Reschedule"}
      >
        {!rescheduleSubmitted ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Need to reschedule upcoming work? Submit a request and our team will get back to you within 2 hours.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preferred New Date</label>
              <input
                type="date"
                value={rescheduleDate}
                onChange={(e) => setRescheduleDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
              <textarea
                value={rescheduleReason}
                onChange={(e) => setRescheduleReason(e.target.value)}
                rows={3}
                placeholder="Let us know why you need to reschedule..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Btn variant="outline" color="#6b7280" onClick={() => setRescheduleModal(false)}>Cancel</Btn>
              <Btn
                color="#3b82f6"
                onClick={handleRescheduleSubmit}
                disabled={!rescheduleDate || !rescheduleReason}
              >
                <Send className="w-4 h-4 inline mr-1" /> Submit Request
              </Btn>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 space-y-3">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Request Submitted!</h3>
            <p className="text-sm text-gray-500">
              Our team will review your reschedule request and contact you within 2 hours.
            </p>
            <p className="text-xs text-gray-400 flex items-center gap-1 justify-center">
              <MessageSquare className="w-3.5 h-3.5" /> You will receive an SMS confirmation
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
