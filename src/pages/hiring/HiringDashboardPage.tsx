import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserPlus, Briefcase, Users, Star, CalendarCheck, Globe, ExternalLink, Edit,
  XCircle, Sparkles, CheckCircle2, Loader2, ChevronRight,
  RotateCcw, Eye,
} from "lucide-react";
import { Badge, Btn, StatCard, Modal, SmartSelect, FileUploadSim } from "../../components/ui";

/* ── platform helpers ── */
const PLATFORMS = [
  { id: "facebook", label: "Facebook", short: "FB", color: "#1877F2" },
  { id: "instagram", label: "Instagram", short: "IG", color: "#E4405F" },
  { id: "tiktok", label: "TikTok", short: "TT", color: "#010101" },
  { id: "linkedin", label: "LinkedIn", short: "LI", color: "#0A66C2" },
  { id: "indeed", label: "Indeed", short: "IN", color: "#2164f3" },
  { id: "ziprecruiter", label: "ZipRecruiter", short: "ZR", color: "#5BA71B" },
  { id: "craigslist", label: "Craigslist", short: "CL", color: "#5a0e99" },
  { id: "googlejobs", label: "Google Jobs", short: "GJ", color: "#4285F4" },
] as const;

type Platform = (typeof PLATFORMS)[number]["id"];

interface Position {
  id: string;
  title: string;
  department: string;
  type: string;
  payRange: string;
  location: string;
  status: "open" | "closed";
  postedDate: string;
  applications: number;
  platforms: Platform[];
  description: string;
  fbPost: string;
  igCaption: string;
  tiktokScript: string;
  linkedinPost: string;
  indeedListing: string;
}

/* ── initial mock data ── */
const initialPositions: Position[] = [
  {
    id: "pos-1",
    title: "Roofing Crew Lead",
    department: "Construction",
    type: "Full-time",
    payRange: "$28-$38/hr",
    location: "Minneapolis, MN",
    status: "open",
    postedDate: "2026-03-15",
    applications: 12,
    platforms: ["facebook", "instagram", "tiktok", "linkedin", "indeed", "ziprecruiter", "craigslist", "googlejobs"],
    description: "",
    fbPost: "",
    igCaption: "",
    tiktokScript: "",
    linkedinPost: "",
    indeedListing: "",
  },
  {
    id: "pos-2",
    title: "Sales Representative",
    department: "Sales",
    type: "Full-time",
    payRange: "$50K-$75K + Commission",
    location: "Minneapolis, MN",
    status: "open",
    postedDate: "2026-03-20",
    applications: 8,
    platforms: ["facebook", "instagram", "linkedin", "indeed", "ziprecruiter", "googlejobs"],
    description: "",
    fbPost: "",
    igCaption: "",
    tiktokScript: "",
    linkedinPost: "",
    indeedListing: "",
  },
  {
    id: "pos-3",
    title: "Drone Operator / Inspector",
    department: "Inspections",
    type: "Full-time",
    payRange: "$25-$35/hr",
    location: "Minneapolis, MN",
    status: "open",
    postedDate: "2026-03-22",
    applications: 4,
    platforms: ["facebook", "instagram", "tiktok", "linkedin", "indeed", "ziprecruiter", "craigslist", "googlejobs"],
    description: "",
    fbPost: "",
    igCaption: "",
    tiktokScript: "",
    linkedinPost: "",
    indeedListing: "",
  },
];

/* ── AI content generator (simulated) ── */
function generateAIContent(title: string, dept: string, type: string, pay: string, location: string) {
  return {
    description: `About Smart Construction & Remodeling\nSmart Construction & Remodeling Inc. is Minnesota's fastest-growing construction company specializing in roofing, siding, gutters, and storm damage restoration. We serve the greater Minneapolis-St. Paul metro area with a commitment to quality craftsmanship, safety, and customer satisfaction.\n\nPosition: ${title}\nDepartment: ${dept}\nType: ${type}\nCompensation: ${pay}\nLocation: ${location}\n\nResponsibilities:\n- Lead and coordinate daily crew operations for residential and commercial projects\n- Ensure all work meets company quality standards and building codes\n- Manage material inventory, tool maintenance, and job-site logistics\n- Train and mentor crew members on best practices and safety protocols\n- Communicate with project managers on timelines, budgets, and progress\n- Conduct daily safety briefings and ensure OSHA compliance\n- Inspect completed work for quality assurance before client walk-throughs\n- Document project progress with daily reports and photos\n\nQualifications:\n- Minimum 3 years of construction experience (roofing preferred)\n- Previous leadership or crew lead experience strongly preferred\n- Valid driver's license required; CDL a plus\n- OSHA 10-Hour or 30-Hour certification preferred\n- Ability to lift 50+ lbs and work at heights\n- Strong communication and problem-solving skills\n- Bilingual (English/Spanish) is a plus\n\nBenefits:\n- Competitive pay: ${pay}\n- Health, dental, and vision insurance\n- 401(k) with company match\n- Paid time off and holidays\n- Company vehicle for crew leads\n- Tool allowance and safety gear provided\n- Career advancement opportunities\n- Year-round work with overtime available`,

    fbPost: `We're HIRING! Smart Construction is looking for a ${title} to join our growing team in ${location}.\n\nPay: ${pay}\nType: ${type}\n\nWe offer great benefits, career growth, and a team that feels like family.\n\nApply now: smartconstruction.com/careers\n\n#NowHiring #${dept.replace(/\s/g, "")} #ConstructionJobs #Minneapolis #SmartConstruction #JoinOurTeam`,

    igCaption: `Smart Construction is HIRING a ${title}!\n\nWe're growing fast and looking for talented people to join our crew. If you've got the skills and the drive, we want to hear from you.\n\nPay: ${pay}\nLocation: ${location}\nBenefits: Health, dental, 401k, PTO & more\n\nLink in bio to apply!\n\n#NowHiring #ConstructionLife #${dept.replace(/\s/g, "")} #MinneapolisJobs #ConstructionCareers #SmartConstruction #HiringNow #BuildYourCareer #TradeJobs #BlueCollarLife`,

    tiktokScript: `[HOOK - 0-3s]\n"We're hiring a ${title} and the pay is ${pay}!"\n\n[BODY - 3-20s]\n*Show job site footage, team working together*\n"At Smart Construction, we're not just building roofs — we're building careers. We need a ${title} who's ready to lead, grow, and earn.\n\nHere's what you get:\n- ${pay}\n- Full benefits package\n- Company vehicle\n- A team that's got your back"\n\n[CTA - 20-30s]\n*Text overlay: smartconstruction.com/careers*\n"Link in bio. Your career upgrade starts now. Apply today!"\n\n#NowHiring #ConstructionTikTok #${dept.replace(/\s/g, "")} #TradeJobs #Minneapolis`,

    linkedinPost: `Smart Construction & Remodeling Inc. is seeking a ${title} to join our ${dept} team in ${location}.\n\nAs one of Minnesota's fastest-growing construction companies, we offer competitive compensation (${pay}), comprehensive benefits, and genuine opportunities for career advancement.\n\nThe ideal candidate brings leadership experience, strong technical skills, and a commitment to safety and quality.\n\nKey highlights:\n- Competitive compensation: ${pay}\n- Full benefits: health, dental, vision, 401(k)\n- Career growth in a rapidly expanding company\n- Supportive, team-oriented culture\n\nInterested? Apply at smartconstruction.com/careers or send your resume directly.\n\n#Hiring #Construction #${dept} #Minneapolis #Careers`,

    indeedListing: `${title} - Smart Construction & Remodeling Inc.\n${location} | ${type} | ${pay}\n\nCompany Overview:\nSmart Construction & Remodeling Inc. is a leading construction company in the Minneapolis-St. Paul metro area. We specialize in roofing, siding, gutters, and storm damage restoration, serving both residential and commercial clients.\n\nJob Summary:\nWe are seeking an experienced ${title} to join our ${dept} department. This is a ${type.toLowerCase()} position offering competitive pay and comprehensive benefits.\n\nKey Responsibilities:\n- Lead daily operations and coordinate with project management\n- Ensure quality workmanship and safety compliance\n- Train and supervise team members\n- Manage materials, equipment, and job-site logistics\n- Maintain project documentation and progress reports\n\nRequirements:\n- 3+ years of relevant construction experience\n- Leadership experience preferred\n- Valid driver's license (CDL a plus)\n- OSHA certification preferred\n- Physical ability to perform demanding construction work\n\nBenefits:\n- Health, dental, and vision insurance\n- 401(k) retirement plan with company match\n- Paid time off and holidays\n- Company vehicle (for qualifying positions)\n- Tool allowance and safety equipment\n- Training and advancement opportunities\n\nEqual Opportunity Employer`,
  };
}

/* ── component ── */
export default function HiringDashboardPage() {
  const navigate = useNavigate();
  const [positions, setPositions] = useState<Position[]>(initialPositions);
  const [modalOpen, setModalOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishIdx, setPublishIdx] = useState(-1);
  const [publishDone, setPublishDone] = useState(false);
  const [toast, setToast] = useState("");
  const [editId, setEditId] = useState<string | null>(null);

  /* new position form */
  const [form, setForm] = useState({
    title: "",
    department: "",
    type: "Full-time",
    payRange: "",
    location: "Minneapolis, MN",
  });
  const [content, setContent] = useState({
    description: "",
    fbPost: "",
    igCaption: "",
    tiktokScript: "",
    linkedinPost: "",
    indeedListing: "",
  });
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(
    PLATFORMS.map((p) => p.id)
  );

  const totalApps = positions.reduce((s, p) => s + p.applications, 0);
  const openCount = positions.filter((p) => p.status === "open").length;
  const publishedPlatforms = new Set(positions.flatMap((p) => p.platforms)).size;

  /* toast auto-hide */
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  /* ── publish animation ── */
  useEffect(() => {
    if (!publishing) return;
    if (publishIdx >= selectedPlatforms.length) {
      setPublishing(false);
      setPublishDone(true);
      return;
    }
    const t = setTimeout(() => setPublishIdx((i) => i + 1), 500);
    return () => clearTimeout(t);
  }, [publishing, publishIdx, selectedPlatforms.length]);

  function resetModal() {
    setStep(1);
    setForm({ title: "", department: "", type: "Full-time", payRange: "", location: "Minneapolis, MN" });
    setContent({ description: "", fbPost: "", igCaption: "", tiktokScript: "", linkedinPost: "", indeedListing: "" });
    setSelectedPlatforms(PLATFORMS.map((p) => p.id));
    setGenerating(false);
    setPublishing(false);
    setPublishIdx(-1);
    setPublishDone(false);
    setEditId(null);
  }

  function openNew() {
    resetModal();
    setModalOpen(true);
  }

  function openEdit(pos: Position) {
    setEditId(pos.id);
    setForm({ title: pos.title, department: pos.department, type: pos.type, payRange: pos.payRange, location: pos.location });
    setContent({
      description: pos.description,
      fbPost: pos.fbPost,
      igCaption: pos.igCaption,
      tiktokScript: pos.tiktokScript,
      linkedinPost: pos.linkedinPost,
      indeedListing: pos.indeedListing,
    });
    setSelectedPlatforms(pos.platforms as Platform[]);
    setStep(pos.description ? 2 : 1);
    setModalOpen(true);
  }

  function handleGenerate() {
    setGenerating(true);
    setTimeout(() => {
      const c = generateAIContent(form.title, form.department, form.type, form.payRange, form.location);
      setContent(c);
      setGenerating(false);
      setStep(2);
    }, 2000);
  }

  function handlePublish() {
    setStep(3);
    setPublishing(true);
    setPublishIdx(0);
  }

  function handleFinish() {
    const id = editId || `pos-${Date.now()}`;
    const newPos: Position = {
      id,
      title: form.title,
      department: form.department,
      type: form.type,
      payRange: form.payRange,
      location: form.location,
      status: "open",
      postedDate: new Date().toISOString().split("T")[0],
      applications: editId ? positions.find((p) => p.id === editId)?.applications || 0 : 0,
      platforms: selectedPlatforms,
      ...content,
    };
    if (editId) {
      setPositions((prev) => prev.map((p) => (p.id === editId ? newPos : p)));
    } else {
      setPositions((prev) => [...prev, newPos]);
    }
    setToast(`Published to ${selectedPlatforms.length} platforms!`);
    setModalOpen(false);
    resetModal();
  }

  function handleClose(id: string) {
    setPositions((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "closed" as const } : p))
    );
    setToast("Position closed. Auto-removing from all 8 platforms...");
  }

  function togglePlatform(pid: Platform) {
    setSelectedPlatforms((prev) =>
      prev.includes(pid) ? prev.filter((p) => p !== pid) : [...prev, pid]
    );
  }

  const formValid = form.title && form.department && form.type && form.payRange && form.location;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-600" /> AI Hiring
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Create positions, AI-generate job descriptions & social posts, publish everywhere
          </p>
        </div>
        <Btn color="#7c3aed" onClick={openNew}>
          <UserPlus className="w-4 h-4 mr-1.5 inline" /> New Position
        </Btn>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
        <StatCard icon={Briefcase} label="Open Positions" value={openCount} color="#7c3aed" />
        <StatCard icon={Users} label="Total Applications" value={totalApps} color="#3b82f6" />
        <StatCard icon={Star} label="Strong Candidates" value={8} color="#10b981" />
        <StatCard icon={CalendarCheck} label="Interviews Scheduled" value={3} color="#f59e0b" />
        <StatCard icon={Globe} label="Published Platforms" value={publishedPlatforms} color="#6366f1" />
      </div>

      {/* Position cards */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900">Open Positions</h2>
        {positions.map((pos) => (
          <div
            key={pos.id}
            className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-gray-900">{pos.title}</h3>
                  <Badge color={pos.department === "Construction" ? "#7c3aed" : pos.department === "Sales" ? "#3b82f6" : "#10b981"}>
                    {pos.department}
                  </Badge>
                  <Badge color={pos.status === "open" ? "#10b981" : "#ef4444"}>
                    {pos.status === "open" ? "Open" : "Closed"}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                  <span>{pos.type}</span>
                  <span>{pos.payRange}</span>
                  <span>{pos.location}</span>
                  <span>Posted {pos.postedDate}</span>
                  <span className="font-semibold text-gray-700">{pos.applications} applications</span>
                </div>
                {/* Platform badges */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs text-gray-400 mr-1">Published:</span>
                  {pos.platforms.map((pid) => {
                    const pl = PLATFORMS.find((p) => p.id === pid)!;
                    return (
                      <Badge key={pid} color={pl.color} sm>
                        {pl.short}
                      </Badge>
                    );
                  })}
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                <Btn
                  size="sm"
                  color="#3b82f6"
                  onClick={() => navigate(`/hiring/${pos.id}`)}
                >
                  <Eye className="w-3.5 h-3.5 mr-1 inline" /> View Applications
                </Btn>
                <Btn size="sm" color="#6b7280" variant="outline" onClick={() => openEdit(pos)}>
                  <Edit className="w-3.5 h-3.5 mr-1 inline" /> Edit
                </Btn>
                {pos.status === "open" && (
                  <Btn size="sm" color="#ef4444" variant="outline" onClick={() => handleClose(pos.id)}>
                    <XCircle className="w-3.5 h-3.5 mr-1 inline" /> Close Position
                  </Btn>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Create / Edit Modal ── */}
      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); resetModal(); }}
        title={editId ? "Edit Position" : "Create New Position"}
        wide
      >
        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step >= s ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-500"
                }`}
              >
                {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
              </div>
              <span className={`text-xs font-medium ${step >= s ? "text-purple-700" : "text-gray-400"}`}>
                {s === 1 ? "Basic Info" : s === 2 ? "AI Content" : "Publish"}
              </span>
              {s < 3 && <ChevronRight className="w-4 h-4 text-gray-300" />}
            </div>
          ))}
        </div>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Position Title <span className="text-red-500">*</span>
              </label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Roofing Crew Lead"
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500/30 focus:outline-none"
              />
            </div>
            <SmartSelect
              label="Department"
              required
              value={form.department}
              onChange={(v) => setForm({ ...form, department: v })}
              options={["Construction", "Sales", "Inspections", "Admin", "Management"]}
              placeholder="Select department..."
            />
            <SmartSelect
              label="Employment Type"
              required
              value={form.type}
              onChange={(v) => setForm({ ...form, type: v })}
              options={["Full-time", "Part-time", "Contract"]}
              placeholder="Select type..."
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pay Range <span className="text-red-500">*</span>
              </label>
              <input
                value={form.payRange}
                onChange={(e) => setForm({ ...form, payRange: e.target.value })}
                placeholder="e.g. $28-$38/hr"
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500/30 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location <span className="text-red-500">*</span>
              </label>
              <input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="e.g. Minneapolis, MN"
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500/30 focus:outline-none"
              />
            </div>
            <div className="flex justify-end pt-2">
              <Btn
                color="#7c3aed"
                onClick={handleGenerate}
                disabled={!formValid || generating}
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1.5 inline animate-spin" /> Generating with AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-1.5 inline" /> Generate with AI
                  </>
                )}
              </Btn>
            </div>
          </div>
        )}

        {/* Step 2: AI-generated content */}
        {step === 2 && (
          <div className="space-y-5">
            <Btn size="sm" color="#6b7280" variant="outline" onClick={() => setStep(1)}>
              Back to Basic Info
            </Btn>

            {[
              { key: "description", label: "Job Description", rows: 12 },
              { key: "fbPost", label: "Facebook Post", rows: 5 },
              { key: "igCaption", label: "Instagram Caption", rows: 5 },
              { key: "tiktokScript", label: "TikTok Script", rows: 8 },
              { key: "linkedinPost", label: "LinkedIn Post", rows: 6 },
              { key: "indeedListing", label: "Indeed / Job Board Listing", rows: 10 },
            ].map(({ key, label, rows }) => (
              <div key={key}>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-semibold text-gray-700">{label}</label>
                  <button
                    onClick={() => {
                      const c = generateAIContent(form.title, form.department, form.type, form.payRange, form.location);
                      setContent((prev) => ({ ...prev, [key]: c[key as keyof typeof c] }));
                    }}
                    className="text-xs text-purple-600 hover:text-purple-800 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Regenerate
                  </button>
                </div>
                <textarea
                  value={content[key as keyof typeof content]}
                  onChange={(e) => setContent({ ...content, [key]: e.target.value })}
                  rows={rows}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500/30 focus:outline-none resize-y"
                />
              </div>
            ))}

            {/* Platform selection */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Publish to Platforms
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PLATFORMS.map((pl) => (
                  <label
                    key={pl.id}
                    className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition ${
                      selectedPlatforms.includes(pl.id)
                        ? "border-purple-400 bg-purple-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedPlatforms.includes(pl.id)}
                      onChange={() => togglePlatform(pl.id)}
                      className="accent-purple-600"
                    />
                    <span className="text-sm font-medium text-gray-800">{pl.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Btn color="#7c3aed" onClick={handlePublish} disabled={selectedPlatforms.length === 0}>
                <Globe className="w-4 h-4 mr-1.5 inline" /> Publish to All Selected
              </Btn>
            </div>
          </div>
        )}

        {/* Step 3: Publishing animation */}
        {step === 3 && (
          <div className="space-y-4 py-4">
            <h3 className="text-center text-lg font-bold text-gray-900 mb-4">
              {publishDone ? "All Published!" : "Publishing..."}
            </h3>
            <div className="space-y-2">
              {selectedPlatforms.map((pid, i) => {
                const pl = PLATFORMS.find((p) => p.id === pid)!;
                const done = publishIdx > i;
                const active = publishIdx === i;
                return (
                  <div
                    key={pid}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition ${
                      done
                        ? "border-green-200 bg-green-50"
                        : active
                        ? "border-purple-300 bg-purple-50"
                        : "border-gray-200"
                    }`}
                  >
                    {done ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : active ? (
                      <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                    )}
                    <span
                      className={`text-sm font-medium ${
                        done ? "text-green-700" : active ? "text-purple-700" : "text-gray-500"
                      }`}
                    >
                      {pl.label}
                    </span>
                    {done && <span className="text-xs text-green-600 ml-auto">Published</span>}
                    {active && <span className="text-xs text-purple-600 ml-auto">Publishing...</span>}
                  </div>
                );
              })}
            </div>
            {publishDone && (
              <div className="text-center pt-4">
                <div className="text-green-600 font-bold text-lg mb-3">
                  Published to {selectedPlatforms.length} platforms!
                </div>
                <Btn color="#7c3aed" onClick={handleFinish}>
                  Done
                </Btn>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium z-50 animate-in flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-400" /> {toast}
        </div>
      )}
    </div>
  );
}
