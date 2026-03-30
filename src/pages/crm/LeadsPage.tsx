import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "../../components/ui";
import { useProjectStore, STAGE_COLORS } from "./ProjectsPage";
import type { Project, ProjectStage } from "./ProjectsPage";
import { MapPin, DollarSign, User, Columns3 } from "lucide-react";

/* ── Pipeline stages in order ──────────────────────── */

const PIPELINE_STAGES: ProjectStage[] = [
  "Lead",
  "Contacted",
  "Inspected",
  "Quoted",
  "Signed",
  "In Progress",
  "Complete",
];

const COLUMN_HEADER_COLORS: Record<ProjectStage, string> = {
  Lead: "#6b7280",
  Contacted: "#3b82f6",
  Inspected: "#8b5cf6",
  Quoted: "#f59e0b",
  Signed: "#10b981",
  "In Progress": "#0ea5e9",
  Complete: "#22c55e",
};

/* ── Helpers ────────────────────────────────────────── */

const fmt = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

/* ── Kanban card ───────────────────────────────────── */

function KanbanCard({ project }: { project: Project }) {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(`/crm/projects/${project.id}`)}
      className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md hover:border-blue-200 transition cursor-pointer"
    >
      <div className="flex items-center gap-1.5 mb-1.5">
        <User className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-sm font-semibold text-gray-900 truncate">
          {project.customerName}
        </span>
      </div>
      <div className="flex items-start gap-1.5 mb-1.5">
        <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
        <span className="text-xs text-gray-500 leading-tight">{project.address}</span>
      </div>
      <div className="flex items-center justify-between mt-2">
        <Badge color="#6366f1" sm>
          {project.type}
        </Badge>
        {project.quoteAmount > 0 && (
          <span className="flex items-center gap-0.5 text-xs font-bold text-gray-700">
            <DollarSign className="w-3 h-3 text-green-500" />
            {fmt(project.quoteAmount)}
          </span>
        )}
      </div>
    </div>
  );
}

/* ── Column ────────────────────────────────────────── */

function KanbanColumn({
  stage,
  items,
}: {
  stage: ProjectStage;
  items: Project[];
}) {
  const color = COLUMN_HEADER_COLORS[stage];
  const total = items.reduce((s, p) => s + p.quoteAmount, 0);

  return (
    <div className="flex flex-col min-w-[240px] max-w-[280px] shrink-0">
      {/* Column header */}
      <div
        className="rounded-t-xl px-3 py-2.5 flex items-center justify-between"
        style={{ background: color + "15", borderBottom: `2px solid ${color}` }}
      >
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm" style={{ color }}>
            {stage}
          </span>
          <span
            className="text-xs font-bold px-1.5 py-0.5 rounded-full"
            style={{ background: color + "22", color }}
          >
            {items.length}
          </span>
        </div>
        {total > 0 && (
          <span className="text-xs font-medium text-gray-500">{fmt(total)}</span>
        )}
      </div>

      {/* Cards */}
      <div className="flex-1 bg-gray-50 rounded-b-xl p-2 space-y-2 min-h-[120px]">
        {items.length === 0 && (
          <div className="text-xs text-gray-300 text-center py-6">No projects</div>
        )}
        {items.map((p) => (
          <KanbanCard key={p.id} project={p} />
        ))}
      </div>
    </div>
  );
}

/* ── Main component ────────────────────────────────── */

export default function LeadsPage() {
  const [allProjects] = useProjectStore();

  const grouped = useMemo(() => {
    const map: Record<ProjectStage, Project[]> = {
      Lead: [],
      Contacted: [],
      Inspected: [],
      Quoted: [],
      Signed: [],
      "In Progress": [],
      Complete: [],
    };
    for (const p of allProjects) {
      map[p.stage].push(p);
    }
    return map;
  }, [allProjects]);

  const totalPipeline = allProjects.reduce((s, p) => s + p.quoteAmount, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Columns3 className="w-6 h-6 text-blue-500" />
          Leads Pipeline
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {allProjects.length} projects &middot; {fmt(totalPipeline)} total pipeline
        </p>
      </div>

      {/* Kanban board */}
      <div className="overflow-x-auto -mx-4 px-4 pb-4">
        <div className="flex gap-3">
          {PIPELINE_STAGES.map((stage) => (
            <KanbanColumn key={stage} stage={stage} items={grouped[stage]} />
          ))}
        </div>
      </div>
    </div>
  );
}
