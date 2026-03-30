import { useState } from "react";
import { Badge, Btn, StatCard, Modal, SmartSelect } from "../../components/ui";
import {
  Star, Trophy, TrendingUp, Users, DollarSign, ChevronDown, ChevronUp,
  Award, ThumbsUp, ThumbsDown, MessageSquare,
} from "lucide-react";
import { useAppStore } from "../../stores/useAppStore";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface RatingBreakdown {
  quality: number;
  timeliness: number;
  communication: number;
  cleanup: number;
  professionalism: number;
}

interface Review {
  id: string;
  customer: string;
  date: string;
  stars: number;
  comment: string;
}

interface Employee {
  id: string;
  name: string;
  role: string;
  avgRating: number;
  reviews: number;
  completedJobs: number | null;
  onTimePercent: number | null;
  customerComment: string;
  bonus: number;
  breakdown: RatingBreakdown;
  recentReviews: Review[];
  trendData: number[]; // last 6 months avg
  callbacks: number;
  safetyScore: number;
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */
const mockEmployees: Employee[] = [
  {
    id: "E1", name: "Carlos Mendez", role: "Crew Lead", avgRating: 4.9, reviews: 12, completedJobs: 8, onTimePercent: 100,
    customerComment: "Best crew ever!", bonus: 1000,
    breakdown: { quality: 4.9, timeliness: 5.0, communication: 4.8, cleanup: 4.9, professionalism: 5.0 },
    recentReviews: [
      { id: "R1", customer: "Mrs. Thompson", date: "Mar 25, 2026", stars: 5, comment: "Absolutely flawless work. Carlos and his team were professional, clean, and fast." },
      { id: "R2", customer: "Mr. Chen", date: "Mar 18, 2026", stars: 5, comment: "Best crew ever! They finished a day early." },
      { id: "R3", customer: "Mrs. Andersen", date: "Mar 10, 2026", stars: 5, comment: "Spotless cleanup, wonderful communication throughout." },
    ],
    trendData: [4.5, 4.6, 4.7, 4.8, 4.9, 4.9], callbacks: 0, safetyScore: 100,
  },
  {
    id: "E2", name: "Mike Rodriguez", role: "Crew Lead", avgRating: 4.8, reviews: 15, completedJobs: 10, onTimePercent: 95,
    customerComment: "Very professional", bonus: 850,
    breakdown: { quality: 4.8, timeliness: 4.7, communication: 4.9, cleanup: 4.6, professionalism: 5.0 },
    recentReviews: [
      { id: "R4", customer: "Mr. Garcia", date: "Mar 22, 2026", stars: 5, comment: "Very professional team. Great communication." },
      { id: "R5", customer: "Mrs. Lee", date: "Mar 14, 2026", stars: 4, comment: "Good work, minor delay due to weather." },
    ],
    trendData: [4.4, 4.5, 4.6, 4.7, 4.8, 4.8], callbacks: 1, safetyScore: 98,
  },
  {
    id: "E3", name: "David Park", role: "Crew Lead", avgRating: 4.7, reviews: 9, completedJobs: 7, onTimePercent: 100,
    customerComment: "Great work", bonus: 650,
    breakdown: { quality: 4.7, timeliness: 4.8, communication: 4.6, cleanup: 4.7, professionalism: 4.7 },
    recentReviews: [
      { id: "R6", customer: "Mr. Hoffman", date: "Mar 20, 2026", stars: 5, comment: "Great work on the entire roof replacement." },
    ],
    trendData: [4.3, 4.4, 4.5, 4.6, 4.7, 4.7], callbacks: 0, safetyScore: 100,
  },
  {
    id: "E4", name: "James Wilson", role: "Crew Lead", avgRating: 4.5, reviews: 11, completedJobs: 9, onTimePercent: 91,
    customerComment: "Good quality", bonus: 0,
    breakdown: { quality: 4.6, timeliness: 4.3, communication: 4.5, cleanup: 4.4, professionalism: 4.7 },
    recentReviews: [
      { id: "R7", customer: "Mrs. Brown", date: "Mar 19, 2026", stars: 4, comment: "Good quality work. Took a bit longer than expected." },
    ],
    trendData: [4.2, 4.3, 4.4, 4.4, 4.5, 4.5], callbacks: 2, safetyScore: 95,
  },
  {
    id: "E5", name: "Sam Chen", role: "Crew Lead", avgRating: 4.4, reviews: 6, completedJobs: 5, onTimePercent: 100,
    customerComment: "Neat and clean", bonus: 0,
    breakdown: { quality: 4.4, timeliness: 4.5, communication: 4.3, cleanup: 4.6, professionalism: 4.2 },
    recentReviews: [
      { id: "R8", customer: "Mr. Patel", date: "Mar 16, 2026", stars: 4, comment: "Neat and clean job. Very satisfied." },
    ],
    trendData: [4.0, 4.1, 4.2, 4.3, 4.3, 4.4], callbacks: 0, safetyScore: 100,
  },
  {
    id: "E6", name: "Tony Harris", role: "Crew Lead", avgRating: 4.2, reviews: 8, completedJobs: 6, onTimePercent: 83,
    customerComment: "A bit slow", bonus: 0,
    breakdown: { quality: 4.3, timeliness: 3.8, communication: 4.2, cleanup: 4.1, professionalism: 4.5 },
    recentReviews: [
      { id: "R9", customer: "Mrs. Davis", date: "Mar 12, 2026", stars: 4, comment: "A bit slow but quality was good." },
    ],
    trendData: [4.0, 4.0, 4.1, 4.1, 4.2, 4.2], callbacks: 3, safetyScore: 92,
  },
  {
    id: "E7", name: "Jake Morrison", role: "Sales", avgRating: 4.8, reviews: 14, completedJobs: null, onTimePercent: null,
    customerComment: "Very helpful", bonus: 0,
    breakdown: { quality: 4.7, timeliness: 4.8, communication: 4.9, cleanup: 4.8, professionalism: 4.8 },
    recentReviews: [
      { id: "R10", customer: "Mr. Kim", date: "Mar 24, 2026", stars: 5, comment: "Very helpful and knowledgeable. Made the process easy." },
    ],
    trendData: [4.5, 4.6, 4.6, 4.7, 4.8, 4.8], callbacks: 0, safetyScore: 100,
  },
  {
    id: "E8", name: "Sarah Chen", role: "Sales", avgRating: 4.6, reviews: 10, completedJobs: null, onTimePercent: null,
    customerComment: "Responsive", bonus: 0,
    breakdown: { quality: 4.5, timeliness: 4.7, communication: 4.8, cleanup: 4.4, professionalism: 4.6 },
    recentReviews: [
      { id: "R11", customer: "Mrs. Martin", date: "Mar 21, 2026", stars: 5, comment: "Responsive and very thorough in the estimate." },
    ],
    trendData: [4.2, 4.3, 4.4, 4.5, 4.5, 4.6], callbacks: 0, safetyScore: 100,
  },
];

const bonusHistory = [
  { month: "February 2026", pool: 2500, recipients: [{ name: "Mike Rodriguez", amount: 1100 }, { name: "Carlos Mendez", amount: 900 }, { name: "David Park", amount: 500 }] },
  { month: "January 2026", pool: 2500, recipients: [{ name: "Carlos Mendez", amount: 1000 }, { name: "David Park", amount: 850 }, { name: "Sam Chen", amount: 650 }] },
  { month: "December 2025", pool: 2000, recipients: [{ name: "Mike Rodriguez", amount: 900 }, { name: "Carlos Mendez", amount: 700 }, { name: "James Wilson", amount: 400 }] },
];

/* ------------------------------------------------------------------ */
/*  Star rating component                                              */
/* ------------------------------------------------------------------ */
function StarRating({ value, onChange, size = "md" }: { value: number; onChange?: (v: number) => void; size?: "sm" | "md" }) {
  const sz = size === "sm" ? "w-4 h-4" : "w-5 h-5";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange?.(s)}
          disabled={!onChange}
          className={`${onChange ? "cursor-pointer hover:scale-110" : "cursor-default"} transition`}
        >
          <Star className={`${sz} ${s <= value ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />
        </button>
      ))}
    </div>
  );
}

function rankBadge(rank: number) {
  if (rank === 1) return <span className="text-lg">&#x1F947;</span>;
  if (rank === 2) return <span className="text-lg">&#x1F948;</span>;
  if (rank === 3) return <span className="text-lg">&#x1F949;</span>;
  return <span className="text-sm font-bold text-gray-500">{rank}</span>;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function EmployeeRatingsPage() {
  const addToast = useAppStore((s) => s.addToast);
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showSubmit, setShowSubmit] = useState(false);
  const [showBonusHistory, setShowBonusHistory] = useState(false);

  // Submit rating form
  const [ratingEmployee, setRatingEmployee] = useState("");
  const [ratingProject, setRatingProject] = useState("");
  const [ratingQuality, setRatingQuality] = useState(0);
  const [ratingTimeliness, setRatingTimeliness] = useState(0);
  const [ratingCommunication, setRatingCommunication] = useState(0);
  const [ratingCleanup, setRatingCleanup] = useState(0);
  const [ratingProfessionalism, setRatingProfessionalism] = useState(0);
  const [ratingComment, setRatingComment] = useState("");
  const [ratingRecommend, setRatingRecommend] = useState<boolean | null>(null);

  const sorted = [...employees].sort((a, b) => b.avgRating - a.avgRating);
  const avgAll = employees.length > 0
    ? (employees.reduce((s, e) => s + e.avgRating, 0) / employees.length).toFixed(1)
    : "0";

  function submitRating() {
    if (!ratingEmployee || ratingQuality === 0 || ratingTimeliness === 0 || ratingCommunication === 0 || ratingCleanup === 0 || ratingProfessionalism === 0) {
      addToast("Please select an employee and rate all 5 categories.", "error");
      return;
    }

    const newAvg = (ratingQuality + ratingTimeliness + ratingCommunication + ratingCleanup + ratingProfessionalism) / 5;
    setEmployees((prev) =>
      prev.map((e) => {
        if (e.name !== ratingEmployee) return e;
        const totalWeight = e.reviews;
        const newOverall = Number(((e.avgRating * totalWeight + newAvg) / (totalWeight + 1)).toFixed(1));
        return {
          ...e,
          avgRating: newOverall,
          reviews: e.reviews + 1,
          recentReviews: [
            { id: `R-${Date.now()}`, customer: "New Customer", date: "Mar 30, 2026", stars: Math.round(newAvg), comment: ratingComment || "No comment" },
            ...e.recentReviews,
          ],
        };
      }),
    );

    setShowSubmit(false);
    resetRatingForm();
    addToast("Rating submitted successfully! Averages updated.", "success");
  }

  function resetRatingForm() {
    setRatingEmployee("");
    setRatingProject("");
    setRatingQuality(0);
    setRatingTimeliness(0);
    setRatingCommunication(0);
    setRatingCleanup(0);
    setRatingProfessionalism(0);
    setRatingComment("");
    setRatingRecommend(null);
  }

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Trophy className="w-7 h-7 text-yellow-500" /> Employee Performance &amp; Ratings
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Monthly Bonus Pool: <span className="font-bold text-green-600">$2,500</span></p>
        </div>
        <Btn color="#3b82f6" onClick={() => setShowSubmit(true)}>
          <span className="flex items-center gap-1.5"><Star className="w-4 h-4" /> Submit Rating</span>
        </Btn>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <StatCard icon={Star} label="Avg Rating" value={`${avgAll}/5`} color="#eab308" />
        <StatCard icon={MessageSquare} label="Reviews This Month" value={employees.reduce((s, e) => s + e.reviews, 0)} color="#3b82f6" />
        <StatCard icon={Trophy} label="Top Performer" value={sorted[0]?.name || "—"} color="#22c55e" />
        <StatCard icon={DollarSign} label="Bonus Recipients" value={employees.filter((e) => e.bonus > 0).length} color="#8b5cf6" />
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 border-b bg-gray-50">
          <h2 className="font-bold text-gray-900">Leaderboard</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="text-xs text-gray-500 uppercase border-b bg-gray-50/50">
              <th className="px-4 py-2.5 text-left w-12">Rank</th>
              <th className="px-4 py-2.5 text-left">Employee</th>
              <th className="px-4 py-2.5 text-left">Role</th>
              <th className="px-4 py-2.5 text-center">Avg Rating</th>
              <th className="px-4 py-2.5 text-center">Reviews</th>
              <th className="px-4 py-2.5 text-center">Jobs</th>
              <th className="px-4 py-2.5 text-center">On-Time</th>
              <th className="px-4 py-2.5 text-left">Comment</th>
              <th className="px-4 py-2.5 text-right">Bonus</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((emp, idx) => {
              const rank = idx + 1;
              const isExpanded = expandedId === emp.id;
              return (
                <tr key={emp.id} className="group">
                  <td colSpan={9} className="p-0">
                    <div
                      onClick={() => setExpandedId(isExpanded ? null : emp.id)}
                      className={`grid cursor-pointer transition hover:bg-blue-50/50 ${
                        rank <= 3 ? "bg-yellow-50/30" : ""
                      }`}
                      style={{ gridTemplateColumns: "48px 1fr 100px 100px 80px 80px 80px 1fr 80px" }}
                    >
                      <div className="px-4 py-3 flex items-center">{rankBadge(rank)}</div>
                      <div className="px-4 py-3 font-medium text-gray-900 text-sm">{emp.name}</div>
                      <div className="px-4 py-3 text-sm text-gray-600">{emp.role}</div>
                      <div className="px-4 py-3 flex items-center justify-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm font-bold">{emp.avgRating}</span>
                      </div>
                      <div className="px-4 py-3 text-center text-sm text-gray-600">{emp.reviews}</div>
                      <div className="px-4 py-3 text-center text-sm text-gray-600">{emp.completedJobs ?? "—"}</div>
                      <div className="px-4 py-3 text-center text-sm">
                        {emp.onTimePercent !== null ? (
                          <span className={emp.onTimePercent >= 95 ? "text-green-600 font-medium" : emp.onTimePercent >= 90 ? "text-yellow-600" : "text-red-600"}>
                            {emp.onTimePercent}%
                          </span>
                        ) : "—"}
                      </div>
                      <div className="px-4 py-3 text-sm text-gray-500 italic truncate">"{emp.customerComment}"</div>
                      <div className="px-4 py-3 text-right text-sm font-bold">
                        {emp.bonus > 0 ? <span className="text-green-600">${emp.bonus.toLocaleString()}</span> : <span className="text-gray-400">&mdash;</span>}
                      </div>
                    </div>

                    {/* Expanded detail */}
                    {isExpanded && (
                      <div className="px-6 py-4 bg-blue-50/30 border-t border-blue-100">
                        <div className="grid grid-cols-3 gap-6">
                          {/* Rating breakdown */}
                          <div>
                            <h4 className="text-sm font-bold text-gray-700 mb-2">Rating Breakdown</h4>
                            {Object.entries(emp.breakdown).map(([key, val]) => (
                              <div key={key} className="flex items-center justify-between py-1">
                                <span className="text-sm text-gray-600 capitalize">{key}</span>
                                <div className="flex items-center gap-2">
                                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${(val / 5) * 100}%` }} />
                                  </div>
                                  <span className="text-sm font-medium w-8 text-right">{val}</span>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Trend (bar chart) */}
                          <div>
                            <h4 className="text-sm font-bold text-gray-700 mb-2">Rating Trend (6 Months)</h4>
                            <div className="flex items-end gap-2 h-28">
                              {emp.trendData.map((val, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                  <span className="text-[10px] text-gray-500">{val}</span>
                                  <div
                                    className="w-full bg-blue-500 rounded-t"
                                    style={{ height: `${((val - 3.5) / 1.5) * 100}%`, minHeight: 4 }}
                                  />
                                  <span className="text-[10px] text-gray-400">
                                    {["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"][i]}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Performance History */}
                          <div>
                            <h4 className="text-sm font-bold text-gray-700 mb-2">Performance History</h4>
                            <div className="space-y-1.5 text-sm">
                              <div className="flex justify-between"><span className="text-gray-500">Jobs Completed</span><span className="font-medium">{emp.completedJobs ?? "N/A"}</span></div>
                              <div className="flex justify-between"><span className="text-gray-500">On-Time %</span><span className="font-medium">{emp.onTimePercent !== null ? `${emp.onTimePercent}%` : "N/A"}</span></div>
                              <div className="flex justify-between"><span className="text-gray-500">Callbacks</span><span className="font-medium">{emp.callbacks}</span></div>
                              <div className="flex justify-between"><span className="text-gray-500">Safety Score</span><span className="font-medium">{emp.safetyScore}%</span></div>
                            </div>
                          </div>
                        </div>

                        {/* Recent Reviews */}
                        <div className="mt-4">
                          <h4 className="text-sm font-bold text-gray-700 mb-2">Recent Reviews</h4>
                          <div className="space-y-2">
                            {emp.recentReviews.map((rev) => (
                              <div key={rev.id} className="bg-white rounded-lg border border-gray-200 p-3 flex items-start gap-3">
                                <div className="flex-shrink-0 mt-0.5">
                                  <StarRating value={rev.stars} size="sm" />
                                </div>
                                <div className="flex-1">
                                  <div className="text-sm text-gray-700">{rev.comment}</div>
                                  <div className="text-xs text-gray-400 mt-1">{rev.customer} &middot; {rev.date}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Monthly Bonus Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-500" /> Monthly Bonus Distribution
            </h2>
            <p className="text-sm text-gray-500">Pool: $2,500 &middot; Top 3 get proportional share based on weighted score</p>
          </div>
          <div className="flex gap-2">
            <Btn color="#6b7280" variant="outline" size="sm" onClick={() => setShowBonusHistory(!showBonusHistory)}>
              <span className="flex items-center gap-1">{showBonusHistory ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />} History</span>
            </Btn>
            <Btn color="#22c55e" size="sm" onClick={() => addToast("March 2026 bonuses approved and locked in!", "success")}>
              <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" /> Approve Bonuses</span>
            </Btn>
          </div>
        </div>

        {/* Current month */}
        <div className="grid grid-cols-3 gap-3 mb-3">
          {sorted.filter((e) => e.bonus > 0).map((e, i) => (
            <div key={e.id} className={`rounded-lg border p-3 ${i === 0 ? "border-yellow-300 bg-yellow-50" : i === 1 ? "border-gray-300 bg-gray-50" : "border-orange-200 bg-orange-50/30"}`}>
              <div className="flex items-center gap-2 mb-1">
                {rankBadge(i + 1)}
                <span className="font-medium text-gray-900 text-sm">{e.name}</span>
              </div>
              <div className="text-lg font-bold text-green-600">${e.bonus.toLocaleString()}</div>
              <div className="text-xs text-gray-500">Rating: {e.avgRating} &middot; {e.reviews} reviews</div>
            </div>
          ))}
        </div>

        {/* History */}
        {showBonusHistory && (
          <div className="space-y-3 mt-4 pt-4 border-t">
            <h3 className="text-sm font-bold text-gray-700">Bonus History</h3>
            {bonusHistory.map((bh) => (
              <div key={bh.month} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm text-gray-800">{bh.month}</span>
                  <span className="text-xs text-gray-500">Pool: ${bh.pool.toLocaleString()}</span>
                </div>
                <div className="flex gap-3">
                  {bh.recipients.map((r, i) => (
                    <span key={i} className="text-xs text-gray-600">
                      {rankBadge(i + 1)} {r.name}: <span className="font-bold text-green-600">${r.amount}</span>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/*  SUBMIT RATING MODAL                                          */}
      {/* ============================================================ */}
      <Modal open={showSubmit} onClose={() => { setShowSubmit(false); resetRatingForm(); }} title="Submit Customer Rating" wide>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <SmartSelect
              label="Employee / Crew"
              required
              value={ratingEmployee}
              onChange={setRatingEmployee}
              options={employees.map((e) => e.name)}
              placeholder="Select employee..."
            />
            <SmartSelect
              label="Project Reference"
              value={ratingProject}
              onChange={setRatingProject}
              options={["MN-0247 Thompson", "MN-0089 Garcia", "MN-0156 Chen", "MN-0312 Andersen"]}
              placeholder="Select project..."
            />
          </div>

          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <h3 className="font-bold text-gray-900 text-sm">Rate Each Category (1-5 Stars)</h3>
            {[
              { label: "Quality", value: ratingQuality, setter: setRatingQuality },
              { label: "Timeliness", value: ratingTimeliness, setter: setRatingTimeliness },
              { label: "Communication", value: ratingCommunication, setter: setRatingCommunication },
              { label: "Cleanup", value: ratingCleanup, setter: setRatingCleanup },
              { label: "Professionalism", value: ratingProfessionalism, setter: setRatingProfessionalism },
            ].map((cat) => (
              <div key={cat.label} className="flex items-center justify-between">
                <span className="text-sm text-gray-700 font-medium">{cat.label}</span>
                <StarRating value={cat.value} onChange={cat.setter} />
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
            <textarea
              value={ratingComment}
              onChange={(e) => setRatingComment(e.target.value)}
              placeholder="Share your experience..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Would you recommend?</label>
            <div className="flex gap-3">
              <button
                onClick={() => setRatingRecommend(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition ${
                  ratingRecommend === true ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                <ThumbsUp className="w-4 h-4" /> Yes
              </button>
              <button
                onClick={() => setRatingRecommend(false)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition ${
                  ratingRecommend === false ? "border-red-500 bg-red-50 text-red-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                <ThumbsDown className="w-4 h-4" /> No
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <Btn color="#6b7280" variant="outline" onClick={() => { setShowSubmit(false); resetRatingForm(); }}>Cancel</Btn>
            <Btn color="#3b82f6" onClick={submitRating}>
              <span className="flex items-center gap-1.5"><Star className="w-4 h-4" /> Submit Rating</span>
            </Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
