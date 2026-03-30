import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, CalendarDays, HardHat, ClipboardCheck, Truck, Users, Plus, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Badge, Btn, StatCard, Modal, SmartSelect } from "../../components/ui";
import { useAppStore } from "../../stores/useAppStore";

type EventType = "inspection" | "work" | "delivery" | "meeting";
type EventStatus = "scheduled" | "in_progress" | "completed";

interface ScheduleEvent {
  id: string;
  projectId: string;
  title: string;
  type: EventType;
  startDate: string;
  endDate: string;
  crew: string;
  status: EventStatus;
}

let initialEvents: ScheduleEvent[] = [
  { id: "e1", projectId: "PRJ-001", title: "Roof Inspection - Thompson", type: "inspection", startDate: "2026-03-02T09:00", endDate: "2026-03-02T11:00", crew: "Alpha Team", status: "completed" },
  { id: "e2", projectId: "PRJ-002", title: "Siding Install - Garcia", type: "work", startDate: "2026-03-05T07:00", endDate: "2026-03-07T16:00", crew: "Bravo Team", status: "completed" },
  { id: "e3", projectId: "PRJ-001", title: "Material Delivery - Shingles", type: "delivery", startDate: "2026-03-10T08:00", endDate: "2026-03-10T10:00", crew: "Logistics", status: "completed" },
  { id: "e4", projectId: "PRJ-003", title: "Client Meeting - Davis Remodel", type: "meeting", startDate: "2026-03-12T14:00", endDate: "2026-03-12T15:30", crew: "Sales", status: "completed" },
  { id: "e5", projectId: "PRJ-001", title: "Roof Tear-Off - Thompson", type: "work", startDate: "2026-03-16T07:00", endDate: "2026-03-18T16:00", crew: "Alpha Team", status: "in_progress" },
  { id: "e6", projectId: "PRJ-004", title: "Window Measurements", type: "inspection", startDate: "2026-03-20T10:00", endDate: "2026-03-20T12:00", crew: "Charlie Team", status: "scheduled" },
  { id: "e7", projectId: "PRJ-002", title: "Gutter Delivery - Garcia", type: "delivery", startDate: "2026-03-22T08:00", endDate: "2026-03-22T09:00", crew: "Logistics", status: "scheduled" },
  { id: "e8", projectId: "PRJ-005", title: "Insurance Adjuster Walk", type: "meeting", startDate: "2026-03-24T13:00", endDate: "2026-03-24T14:30", crew: "Sales", status: "scheduled" },
  { id: "e9", projectId: "PRJ-003", title: "Interior Framing - Davis", type: "work", startDate: "2026-03-26T07:00", endDate: "2026-03-28T16:00", crew: "Delta Team", status: "scheduled" },
  { id: "e10", projectId: "PRJ-004", title: "Final Inspection - Windows", type: "inspection", startDate: "2026-03-30T09:00", endDate: "2026-03-30T11:00", crew: "Charlie Team", status: "scheduled" },
  { id: "e11", projectId: "PRJ-001", title: "Roof Completion Inspection", type: "inspection", startDate: "2026-04-02T09:00", endDate: "2026-04-02T11:00", crew: "Alpha Team", status: "scheduled" },
  { id: "e12", projectId: "PRJ-005", title: "Drywall Delivery", type: "delivery", startDate: "2026-04-04T08:00", endDate: "2026-04-04T10:00", crew: "Logistics", status: "scheduled" },
];

const typeColors: Record<string, string> = {
  inspection: "#8b5cf6",
  work: "#3b82f6",
  delivery: "#f59e0b",
  meeting: "#10b981",
};

const typeLabels: Record<string, string> = {
  inspection: "Inspection",
  work: "Work",
  delivery: "Delivery",
  meeting: "Meeting",
};

const statusColors: Record<EventStatus, string> = {
  scheduled: "#3b82f6",
  in_progress: "#f59e0b",
  completed: "#10b981",
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

const EVENT_TYPES: EventType[] = ["inspection", "work", "delivery", "meeting"];

const DEFAULT_TYPE_LABELS = Object.values(typeLabels);

const EMPTY_EVENT_FORM = {
  title: "",
  typeLabel: "Inspection",
  date: "",
  crew: "",
  projectRef: "",
  notes: "",
};

export default function CalendarPage() {
  const navigate = useNavigate();
  const addToast = useAppStore((s) => s.addToast);
  const [events, setEvents] = useState<ScheduleEvent[]>(initialEvents);
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventForm, setEventForm] = useState({ ...EMPTY_EVENT_FORM });
  const [currentMonth, setCurrentMonth] = useState(2); // March (0-indexed)
  const [currentYear, setCurrentYear] = useState(2026);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
  const [eventTypeOptions, setEventTypeOptions] = useState<string[]>(DEFAULT_TYPE_LABELS);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const monthName = new Date(currentYear, currentMonth).toLocaleString("en", { month: "long", year: "numeric" });

  const eventsThisMonth = events.filter((e) => {
    const d = new Date(e.startDate);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const getEventsForDay = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return eventsThisMonth.filter((e) => e.startDate.startsWith(dateStr));
  };

  const now = new Date();
  const upcoming = events
    .filter((e) => new Date(e.startDate) >= now)
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 7);

  const thisWeekEvents = events.filter((e) => {
    const d = new Date(e.startDate);
    const diff = (d.getTime() - now.getTime()) / 86400000;
    return diff >= 0 && diff <= 7;
  });

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); }
    else setCurrentMonth(currentMonth - 1);
  };
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); }
    else setCurrentMonth(currentMonth + 1);
  };

  const handleCreateEvent = () => {
    if (!eventForm.title.trim() || !eventForm.date) {
      addToast("Title and date are required", "error");
      return;
    }
    const labelToKey = Object.entries(typeLabels).find(([, v]) => v === eventForm.typeLabel);
    const eventType = labelToKey ? labelToKey[0] : eventForm.typeLabel.toLowerCase();
    // Ensure custom types have a color and label entry
    if (!typeColors[eventType]) typeColors[eventType] = "#6366f1";
    if (!typeLabels[eventType]) typeLabels[eventType] = eventForm.typeLabel;
    const newEvent: ScheduleEvent = {
      id: `e${Date.now()}`,
      projectId: eventForm.projectRef || "N/A",
      title: eventForm.title,
      type: eventType as EventType,
      startDate: `${eventForm.date}T09:00`,
      endDate: `${eventForm.date}T17:00`,
      crew: eventForm.crew || "Unassigned",
      status: "scheduled",
    };
    setEvents((prev) => [...prev, newEvent]);
    setShowEventModal(false);
    setEventForm({ ...EMPTY_EVENT_FORM });
    addToast(`Event "${eventForm.title}" scheduled for ${eventForm.date}`, "success");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
          <p className="text-sm text-gray-500 mt-1">Construction scheduling overview</p>
        </div>
        <Btn color="#3b82f6" onClick={() => setShowEventModal(true)}>
          <span className="flex items-center gap-1.5"><Plus className="w-4 h-4" /> Schedule Event</span>
        </Btn>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={CalendarDays} label="Events This Week" value={thisWeekEvents.length} sub="Upcoming" color="#3b82f6" />
        <StatCard icon={HardHat} label="Active Jobs" value={events.filter((e) => e.status === "in_progress").length} sub="In progress" color="#f59e0b" />
        <StatCard icon={ClipboardCheck} label="Inspections" value={events.filter((e) => e.type === "inspection").length} sub="Total scheduled" color="#8b5cf6" />
        <StatCard icon={Truck} label="Deliveries" value={events.filter((e) => e.type === "delivery").length} sub="Total scheduled" color="#f59e0b" />
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-gray-100 transition">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900">{monthName}</h2>
          <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-gray-100 transition">
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-px mb-1">
          {DAYS.map((d) => (
            <div key={d} className="text-center text-xs font-medium text-gray-500 py-2">{d}</div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-px">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="h-20 bg-gray-50 rounded-lg" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dayEvents = getEventsForDay(day);
            const isToday = day === now.getDate() && currentMonth === now.getMonth() && currentYear === now.getFullYear();
            const isSelected = selectedDay === day;
            return (
              <div
                key={day}
                onClick={() => {
                  if (dayEvents.length > 0) {
                    setSelectedDay(day);
                  } else {
                    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                    setEventForm({ ...EMPTY_EVENT_FORM, date: dateStr });
                    setShowEventModal(true);
                  }
                }}
                className={`h-20 rounded-lg p-1.5 border transition cursor-pointer hover:bg-gray-50 ${
                  isToday ? "border-blue-400 bg-blue-50" : isSelected ? "border-blue-300 bg-blue-50/50" : "border-transparent"
                }`}
              >
                <div className={`text-xs font-medium ${isToday ? "text-blue-600" : "text-gray-700"}`}>{day}</div>
                <div className="flex flex-wrap gap-0.5 mt-1">
                  {dayEvents.map((ev) => (
                    <div
                      key={ev.id}
                      className="w-2 h-2 rounded-full cursor-pointer hover:scale-150 transition-transform"
                      style={{ backgroundColor: typeColors[ev.type] }}
                      title={ev.title}
                      onClick={(e) => { e.stopPropagation(); setSelectedEvent(ev); }}
                    />
                  ))}
                </div>
                {dayEvents.length > 0 && (
                  <div className="text-[10px] text-gray-500 mt-0.5 truncate">{dayEvents[0].title.split(" - ")[0]}</div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100">
          {(Object.keys(typeColors) as EventType[]).map((type) => (
            <div key={type} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: typeColors[type] }} />
              <span className="text-xs text-gray-600">{typeLabels[type]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Upcoming Events</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {upcoming.map((ev) => {
            const start = new Date(ev.startDate);
            return (
              <div key={ev.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition cursor-pointer" onClick={() => setSelectedEvent(ev)}>
                <div className="flex items-center gap-3">
                  <div className="w-1 h-10 rounded-full" style={{ backgroundColor: typeColors[ev.type] }} />
                  <div>
                    <div className="text-sm font-medium text-gray-900">{ev.title}</div>
                    <div className="text-xs text-gray-500">
                      {start.toLocaleDateString("en", { month: "short", day: "numeric" })} at{" "}
                      {start.toLocaleTimeString("en", { hour: "numeric", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge color={typeColors[ev.type]}>{typeLabels[ev.type]}</Badge>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <Users className="w-3 h-3" /> {ev.crew}
                  </div>
                  <Badge color={statusColors[ev.status]} sm>{ev.status.replace("_", " ")}</Badge>
                  <span className="text-xs text-blue-500 hover:underline cursor-pointer" onClick={(e) => {
                    e.stopPropagation();
                    if (ev.projectId && ev.projectId !== "N/A") {
                      navigate(`/crm/projects/${ev.projectId}`);
                    } else {
                      addToast("No project linked to this event", "info");
                    }
                  }}>{ev.projectId}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Day Detail Modal */}
      <Modal open={selectedDay !== null} onClose={() => setSelectedDay(null)} title={selectedDay ? `Events on ${new Date(currentYear, currentMonth, selectedDay).toLocaleDateString("en", { month: "long", day: "numeric", year: "numeric" })}` : ""}>
        {selectedDay && (() => {
          const dayEvts = getEventsForDay(selectedDay);
          return (
            <div className="space-y-3">
              {dayEvts.length === 0 ? (
                <p className="text-sm text-gray-500">No events scheduled</p>
              ) : dayEvts.map((ev) => (
                <div key={ev.id} className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition" onClick={() => { setSelectedDay(null); setSelectedEvent(ev); }}>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-8 rounded-full" style={{ backgroundColor: typeColors[ev.type] }} />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{ev.title}</div>
                      <div className="text-xs text-gray-500">{new Date(ev.startDate).toLocaleTimeString("en", { hour: "numeric", minute: "2-digit" })} — {ev.crew}</div>
                    </div>
                    <Badge color={typeColors[ev.type]} sm>{typeLabels[ev.type]}</Badge>
                  </div>
                </div>
              ))}
              <Btn color="#3b82f6" variant="outline" onClick={() => {
                const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`;
                setSelectedDay(null);
                setEventForm({ ...EMPTY_EVENT_FORM, date: dateStr });
                setShowEventModal(true);
              }}><span className="flex items-center gap-1.5"><Plus className="w-4 h-4" /> Add Event</span></Btn>
            </div>
          );
        })()}
      </Modal>

      {/* Event Detail Modal */}
      <Modal open={selectedEvent !== null} onClose={() => setSelectedEvent(null)} title="Event Details">
        {selectedEvent && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-10 rounded-full" style={{ backgroundColor: typeColors[selectedEvent.type] }} />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{selectedEvent.title}</h3>
                <Badge color={typeColors[selectedEvent.type]}>{typeLabels[selectedEvent.type]}</Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">Start</div>
                <div className="text-sm font-medium text-gray-900">{new Date(selectedEvent.startDate).toLocaleString("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">End</div>
                <div className="text-sm font-medium text-gray-900">{new Date(selectedEvent.endDate).toLocaleString("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">Crew</div>
                <div className="text-sm font-medium text-gray-900">{selectedEvent.crew}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">Status</div>
                <Badge color={statusColors[selectedEvent.status]}>{selectedEvent.status.replace("_", " ")}</Badge>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              {selectedEvent.projectId && selectedEvent.projectId !== "N/A" && (
                <Btn color="#3b82f6" variant="outline" onClick={() => { setSelectedEvent(null); navigate(`/crm/projects/${selectedEvent.projectId}`); }}>View Project</Btn>
              )}
              {selectedEvent.status !== "completed" && (
                <Btn color="#f59e0b" variant="outline" onClick={() => {
                  const newStatus: EventStatus = selectedEvent.status === "scheduled" ? "in_progress" : "completed";
                  setEvents((prev) => prev.map((e) => e.id === selectedEvent.id ? { ...e, status: newStatus } : e));
                  setSelectedEvent({ ...selectedEvent, status: newStatus });
                  addToast(`Event marked as ${newStatus.replace("_", " ")}`, "success");
                }}>
                  {selectedEvent.status === "scheduled" ? "Start" : "Complete"}
                </Btn>
              )}
              <Btn color="#ef4444" variant="outline" onClick={() => {
                setEvents((prev) => prev.filter((e) => e.id !== selectedEvent.id));
                setSelectedEvent(null);
                addToast("Event deleted", "success");
              }}>Delete</Btn>
            </div>
          </div>
        )}
      </Modal>

      {/* Schedule Event Modal */}
      <Modal open={showEventModal} onClose={() => setShowEventModal(false)} title="Schedule Event">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30" placeholder="Event title" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <SmartSelect
                label="Type"
                value={eventForm.typeLabel}
                onChange={(v) => setEventForm({ ...eventForm, typeLabel: v })}
                options={eventTypeOptions}
                onAddNew={(v) => setEventTypeOptions((prev) => [...prev, v])}
                placeholder="Select type..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input type="date" value={eventForm.date} onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Crew Assignment</label>
              <input value={eventForm.crew} onChange={(e) => setEventForm({ ...eventForm, crew: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30" placeholder="e.g. Alpha Team" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Reference</label>
              <input value={eventForm.projectRef} onChange={(e) => setEventForm({ ...eventForm, projectRef: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30" placeholder="e.g. PRJ-001" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea value={eventForm.notes} onChange={(e) => setEventForm({ ...eventForm, notes: e.target.value })}
              rows={3} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30" placeholder="Additional details..." />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Btn color="#6b7280" variant="outline" onClick={() => setShowEventModal(false)}>Cancel</Btn>
            <Btn color="#3b82f6" onClick={handleCreateEvent}>Schedule</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
