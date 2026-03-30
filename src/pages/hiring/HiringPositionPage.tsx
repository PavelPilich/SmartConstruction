import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Briefcase, Users, Star, AlertTriangle, XCircle, Eye, CalendarCheck,
  CheckCircle2, Clock, Mail, Phone, MapPin, Award, ChevronDown, ChevronUp, Brain,
} from "lucide-react";
import { Badge, Btn, Modal } from "../../components/ui";

/* ── types ── */
interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  score: number;
  category: "strong" | "possible" | "not_qualified";
  experience: string;
  qualifications: string[];
  workHistory: string;
  certifications: string[];
  whyApply: string;
  heardFrom: string;
  aiNotes: string;
  resumeFile: string;
}

interface PositionData {
  id: string;
  title: string;
  department: string;
  status: "open" | "closed";
  payRange: string;
  postedDate: string;
  type: string;
  location: string;
}

/* ── mock positions ── */
const positionsMap: Record<string, PositionData> = {
  "pos-1": { id: "pos-1", title: "Roofing Crew Lead", department: "Construction", status: "open", payRange: "$28-$38/hr", postedDate: "2026-03-15", type: "Full-time", location: "Minneapolis, MN" },
  "pos-2": { id: "pos-2", title: "Sales Representative", department: "Sales", status: "open", payRange: "$50K-$75K + Commission", postedDate: "2026-03-20", type: "Full-time", location: "Minneapolis, MN" },
  "pos-3": { id: "pos-3", title: "Drone Operator / Inspector", department: "Inspections", status: "open", payRange: "$25-$35/hr", postedDate: "2026-03-22", type: "Full-time", location: "Minneapolis, MN" },
};

/* ── mock candidates (for pos-1) ── */
const candidatesData: Record<string, Candidate[]> = {
  "pos-1": [
    // Strong
    {
      id: "c-1", name: "Mike Anderson", email: "mike.anderson@email.com", phone: "(612) 555-0142", location: "Brooklyn Park, MN",
      score: 92, category: "strong",
      experience: "8 years roofing experience including 3 years as crew lead at ABC Roofing. Managed teams of 4-8 workers on residential and commercial projects. Consistently completed projects on time and under budget.",
      qualifications: ["8yr Roofing Exp", "OSHA 30-Hour", "Crew Lead Exp", "Valid DL"],
      workHistory: "ABC Roofing (Crew Lead, 2021-2026)\nMinnesota Exteriors (Roofer, 2018-2021)\nBob's Roofing (Apprentice, 2017-2018)",
      certifications: ["OSHA 30-Hour", "MN Contractor License", "CPR/First Aid"],
      whyApply: "I'm looking for a company with room to grow. Smart Construction's reputation for quality work and employee development is exactly what I want in my next career move.",
      heardFrom: "Indeed",
      aiNotes: "STRONG match for Roofing Crew Lead. 8 years roofing experience exceeds 3yr minimum. OSHA 30-Hour certified. Previous crew lead role at ABC Roofing with team management of 4-8 workers. Valid driver's license confirmed. No CDL -- may need for material runs but not required. Strong references from previous employers. Overall: STRONG match.",
      resumeFile: "mike-anderson-resume.pdf",
    },
    {
      id: "c-2", name: "Carlos Rivera", email: "carlos.r@email.com", phone: "(651) 555-0198", location: "St. Paul, MN",
      score: 88, category: "strong",
      experience: "12 years in construction including roofing, siding, and gutters. Bilingual (English/Spanish). Previous supervisor role managing bilingual crews.",
      qualifications: ["12yr Construction", "Bilingual", "Supervisor Exp", "References Verified"],
      workHistory: "Twin Cities Roofing (Supervisor, 2020-2026)\nMidwest Exteriors (Foreman, 2016-2020)\nRivera Construction (Laborer, 2014-2016)",
      certifications: ["OSHA 10-Hour", "CPR/First Aid"],
      whyApply: "I want to bring my leadership experience and bilingual skills to a company that values diversity and quality. Smart Construction seems like the perfect fit.",
      heardFrom: "Facebook",
      aiNotes: "STRONG match. 12 years construction experience significantly exceeds minimum. Bilingual English/Spanish is a valuable asset for crew communication. Previous supervisor role demonstrates leadership capability. References verified and positive. Missing OSHA 30-Hour (has 10-Hour) -- upgrade recommended. Overall: STRONG match.",
      resumeFile: "carlos-rivera-resume.pdf",
    },
    {
      id: "c-3", name: "Jake Olsen", email: "jake.olsen@email.com", phone: "(763) 555-0167", location: "Maple Grove, MN",
      score: 85, category: "strong",
      experience: "5 years roofing experience. CDL holder. Equipment operator certified. Strong safety record with zero incidents.",
      qualifications: ["5yr Roofing", "CDL Class B", "Equipment Operator", "Zero Incidents"],
      workHistory: "Northern Roofing Co (Roofer, 2022-2026)\nAll-Weather Exteriors (Roofer, 2021-2022)",
      certifications: ["OSHA 30-Hour", "CDL Class B", "Forklift Certified"],
      whyApply: "I'm ready to step into a leadership role. I've been told I'm a natural leader on the job site and I want to grow with a company that invests in its people.",
      heardFrom: "LinkedIn",
      aiNotes: "STRONG match. 5 years roofing experience meets minimum requirement. CDL Class B is a significant plus for material transportation. Equipment operator certification adds versatility. Perfect safety record demonstrates responsibility. No formal crew lead title yet, but peer reviews mention leadership qualities. Overall: STRONG match.",
      resumeFile: "jake-olsen-resume.pdf",
    },
    {
      id: "c-4", name: "Tom Kowalski", email: "tom.k@email.com", phone: "(612) 555-0234", location: "Richfield, MN",
      score: 82, category: "strong",
      experience: "6 years exterior construction including roofing and siding. MN Licensed contractor. Previously ran own small crew.",
      qualifications: ["6yr Exterior", "MN Licensed", "Own Crew Exp", "Valid DL"],
      workHistory: "Kowalski Exteriors (Owner/Operator, 2022-2026)\nPremier Roofing (Senior Roofer, 2020-2022)",
      certifications: ["MN Contractor License", "OSHA 10-Hour", "CPR/First Aid"],
      whyApply: "After running my own small operation, I realized I prefer being part of a larger team where I can focus on the work itself rather than all the business overhead.",
      heardFrom: "Google",
      aiNotes: "STRONG match. 6 years exterior construction experience exceeds minimum. MN Licensed contractor shows professional commitment. Experience running own crew demonstrates leadership and business sense. Transitioning from self-employment -- may need adjustment to corporate structure. Valid driver's license confirmed. Overall: STRONG match.",
      resumeFile: "tom-kowalski-resume.pdf",
    },
    // Possible
    {
      id: "c-5", name: "Sarah Kim", email: "sarah.kim@email.com", phone: "(952) 555-0189", location: "Eden Prairie, MN",
      score: 65, category: "possible",
      experience: "2 years construction experience as general laborer. No crew lead experience but eager to learn. Strong work ethic noted by references.",
      qualifications: ["2yr Construction", "Strong Work Ethic", "Fast Learner"],
      workHistory: "BuildRight MN (Laborer, 2024-2026)\nRetail Management (2020-2024)",
      certifications: ["OSHA 10-Hour"],
      whyApply: "I made the switch to construction two years ago and haven't looked back. I'm ready for more responsibility.",
      heardFrom: "Indeed",
      aiNotes: "POSSIBLE match. 2 years construction experience is below 3yr minimum but shows commitment to the trade. No crew lead experience yet -- would need mentoring. Previous retail management experience could translate to team leadership. OSHA 10-Hour only. Overall: POSSIBLE match -- could grow into role with training.",
      resumeFile: "sarah-kim-resume.pdf",
    },
    {
      id: "c-6", name: "David Chen", email: "david.chen@email.com", phone: "(612) 555-0312", location: "Minneapolis, MN",
      score: 58, category: "possible",
      experience: "4 years carpentry background. No roofing-specific experience but strong general construction skills.",
      qualifications: ["4yr Carpentry", "General Construction", "Detail Oriented"],
      workHistory: "Chen Woodworks (Carpenter, 2022-2026)\nFreelance Carpentry (2020-2022)",
      certifications: ["OSHA 10-Hour"],
      whyApply: "I want to expand my skills into roofing and exterior work. I'm a fast learner and very detail-oriented.",
      heardFrom: "Friend/Referral",
      aiNotes: "POSSIBLE match. 4 years carpentry experience shows construction aptitude but no roofing-specific skills. Would need significant training on roofing techniques and safety. Detail-oriented nature is a plus. No leadership experience. Overall: POSSIBLE match -- would need training period.",
      resumeFile: "david-chen-resume.pdf",
    },
    {
      id: "c-7", name: "Marcus Williams", email: "marcus.w@email.com", phone: "(763) 555-0276", location: "Plymouth, MN",
      score: 55, category: "possible",
      experience: "3 years general construction. Basic roofing knowledge. Currently working toward OSHA 30-Hour cert.",
      qualifications: ["3yr General Construction", "Basic Roofing", "Working on OSHA 30"],
      workHistory: "Metro Builders (Laborer, 2023-2026)\nDay Labor (2022-2023)",
      certifications: [],
      whyApply: "I've been working my way up in construction and I'm ready for a stable position with a great company.",
      heardFrom: "Facebook",
      aiNotes: "POSSIBLE match. 3 years general construction meets minimum experience but lacks roofing specialization. No certifications yet but reportedly working on OSHA 30-Hour. No leadership experience. Overall: POSSIBLE match -- entry-level consideration.",
      resumeFile: "marcus-williams-resume.pdf",
    },
    {
      id: "c-8", name: "Alex Petrov", email: "alex.p@email.com", phone: "(651) 555-0143", location: "Woodbury, MN",
      score: 52, category: "possible",
      experience: "1.5 years roofing helper. Strong physical fitness. Highly motivated but limited experience.",
      qualifications: ["1.5yr Roofing Helper", "Strong Fitness", "Motivated"],
      workHistory: "Local Roofing Co (Helper, 2024-2026)",
      certifications: ["OSHA 10-Hour"],
      whyApply: "I love roofing work and want to build a career in this field. I'm the hardest worker on any crew I join.",
      heardFrom: "Indeed",
      aiNotes: "POSSIBLE match. 1.5 years as roofing helper -- relevant but below minimum. No leadership experience. High motivation noted. Would be better suited for a standard roofer position, not crew lead. Overall: POSSIBLE match for future consideration.",
      resumeFile: "alex-petrov-resume.pdf",
    },
    {
      id: "c-9", name: "Lisa Nguyen", email: "lisa.n@email.com", phone: "(612) 555-0187", location: "Bloomington, MN",
      score: 48, category: "possible",
      experience: "Project management background with 1 year construction exposure. Strong organizational skills.",
      qualifications: ["PM Background", "Organized", "1yr Construction"],
      workHistory: "Construction PM Intern (2025-2026)\nOffice Manager (2020-2025)",
      certifications: [],
      whyApply: "My project management skills combined with my growing construction knowledge could bring a unique perspective to crew leadership.",
      heardFrom: "LinkedIn",
      aiNotes: "POSSIBLE match. Strong organizational and PM skills but very limited hands-on construction experience (1 year). No certifications. Could be valuable in a different role. Overall: POSSIBLE -- better suited for project coordinator role.",
      resumeFile: "lisa-nguyen-resume.pdf",
    },
    // Not Qualified
    {
      id: "c-10", name: "John Smith", email: "john.smith@email.com", phone: "(612) 555-0999", location: "Minneapolis, MN",
      score: 22, category: "not_qualified",
      experience: "No construction experience. Background in retail and food service.",
      qualifications: ["No Construction Exp"],
      workHistory: "Target (Sales Associate, 2023-2026)\nSubway (Team Member, 2021-2023)",
      certifications: [],
      whyApply: "Looking for a career change and heard construction pays well.",
      heardFrom: "Indeed",
      aiNotes: "NOT QUALIFIED. No construction experience whatsoever. No relevant certifications. No leadership experience in relevant field. Motivation appears primarily financial rather than trade-oriented. Overall: Does not meet minimum qualifications for Crew Lead position.",
      resumeFile: "john-smith-resume.pdf",
    },
    {
      id: "c-11", name: "Emma Larsson", email: "emma.l@email.com", phone: "(952) 555-0445", location: "Minnetonka, MN",
      score: 18, category: "not_qualified",
      experience: "No construction experience. Recent college graduate with marketing degree.",
      qualifications: ["No Construction Exp", "Marketing Degree"],
      workHistory: "University of Minnesota (Student, 2022-2026)\nCoffee Shop (Barista, 2020-2022)",
      certifications: [],
      whyApply: "I'm interested in the business side of construction and thought this could be a way in.",
      heardFrom: "Google",
      aiNotes: "NOT QUALIFIED. No construction experience. Recent graduate -- wrong role for career entry. Marketing degree could be useful in a different department (marketing/sales). Overall: Does not meet qualifications. Consider redirecting to marketing role if available.",
      resumeFile: "emma-larsson-resume.pdf",
    },
    {
      id: "c-12", name: "Ryan O'Brien", email: "ryan.ob@email.com", phone: "(763) 555-0321", location: "Coon Rapids, MN",
      score: 15, category: "not_qualified",
      experience: "No relevant experience. Application appears auto-submitted to multiple positions.",
      qualifications: ["No Relevant Exp"],
      workHistory: "Various part-time positions",
      certifications: [],
      whyApply: "Applying to all open positions in my area.",
      heardFrom: "Indeed",
      aiNotes: "NOT QUALIFIED. No construction experience. Application appears mass-submitted with generic responses. No certifications or relevant skills. Overall: Does not meet any qualifications for this position.",
      resumeFile: "ryan-obrien-resume.pdf",
    },
  ],
  "pos-2": [
    {
      id: "c-20", name: "Jennifer Wells", email: "jen.wells@email.com", phone: "(612) 555-0567", location: "Minneapolis, MN",
      score: 90, category: "strong",
      experience: "6 years B2B sales in home improvement industry. Consistently exceeded quotas by 120%.",
      qualifications: ["6yr B2B Sales", "Home Improvement", "120% Quota", "CRM Expert"],
      workHistory: "HomeAdvisors (Senior Sales, 2022-2026)\nLowe's Pro (Account Rep, 2020-2022)",
      certifications: [],
      whyApply: "I want to combine my sales expertise with a company that truly delivers quality construction work.",
      heardFrom: "LinkedIn",
      aiNotes: "STRONG match. 6 years B2B sales in home improvement -- highly relevant. Consistent quota achievement demonstrates proven track record. CRM proficiency. Industry knowledge is excellent. Overall: STRONG match.",
      resumeFile: "jennifer-wells-resume.pdf",
    },
    {
      id: "c-21", name: "Brian Patel", email: "brian.p@email.com", phone: "(651) 555-0678", location: "Eagan, MN",
      score: 84, category: "strong",
      experience: "4 years insurance sales, familiar with storm damage claims process.",
      qualifications: ["4yr Insurance Sales", "Storm Claims", "Networking Pro"],
      workHistory: "State Farm (Agent, 2022-2026)\nInsurance Corp (Sales, 2020-2022)",
      certifications: [],
      whyApply: "My insurance background gives me unique insight into the construction sales process.",
      heardFrom: "Indeed",
      aiNotes: "STRONG match. Insurance background provides excellent understanding of claims-based sales cycle. 4 years sales experience. Strong networking skills. Overall: STRONG match.",
      resumeFile: "brian-patel-resume.pdf",
    },
    {
      id: "c-22", name: "Amy Tran", email: "amy.t@email.com", phone: "(612) 555-0789", location: "Roseville, MN",
      score: 60, category: "possible",
      experience: "2 years retail sales. No B2B or construction experience.",
      qualifications: ["2yr Retail Sales", "Customer Service"],
      workHistory: "Best Buy (Sales Assoc, 2024-2026)",
      certifications: [],
      whyApply: "Ready to move into a higher-paying sales career.",
      heardFrom: "Facebook",
      aiNotes: "POSSIBLE match. Retail sales experience shows customer interaction skills but lacks B2B and construction industry knowledge. Would need significant training. Overall: POSSIBLE -- entry-level consideration.",
      resumeFile: "amy-tran-resume.pdf",
    },
    {
      id: "c-23", name: "Kevin Murphy", email: "kev.m@email.com", phone: "(763) 555-0890", location: "Brooklyn Center, MN",
      score: 55, category: "possible",
      experience: "3 years car sales. Aggressive closer but no construction background.",
      qualifications: ["3yr Auto Sales", "Strong Closer"],
      workHistory: "Luther Auto (Sales, 2023-2026)",
      certifications: [],
      whyApply: "I can sell anything. Ready for a new challenge.",
      heardFrom: "Indeed",
      aiNotes: "POSSIBLE match. Strong sales background but no construction industry knowledge. Closing skills transferable. Would need product training. Overall: POSSIBLE match.",
      resumeFile: "kevin-murphy-resume.pdf",
    },
    {
      id: "c-24", name: "Rachel Green", email: "rachel.g@email.com", phone: "(952) 555-0901", location: "Edina, MN",
      score: 48, category: "possible",
      experience: "1 year inside sales. Phone-based only.",
      qualifications: ["1yr Inside Sales", "Phone Skills"],
      workHistory: "TeleSales Inc (Rep, 2025-2026)",
      certifications: [],
      whyApply: "Looking for an outside sales opportunity.",
      heardFrom: "Indeed",
      aiNotes: "POSSIBLE match. Minimal sales experience and phone-only. No field sales or construction background. Overall: POSSIBLE -- would need extensive development.",
      resumeFile: "rachel-green-resume.pdf",
    },
    {
      id: "c-25", name: "Tyler Dean", email: "tyler.d@email.com", phone: "(612) 555-0112", location: "Minneapolis, MN",
      score: 20, category: "not_qualified",
      experience: "No sales experience. Recent high school graduate.",
      qualifications: ["No Sales Exp"],
      workHistory: "Fast food (2025-2026)",
      certifications: [],
      whyApply: "Need a job.",
      heardFrom: "Indeed",
      aiNotes: "NOT QUALIFIED. No sales experience. No professional background. Minimal effort in application. Overall: Does not meet qualifications.",
      resumeFile: "tyler-dean-resume.pdf",
    },
    {
      id: "c-26", name: "Diana Price", email: "diana.p@email.com", phone: "(763) 555-0223", location: "Anoka, MN",
      score: 55, category: "possible",
      experience: "2 years real estate sales. Understands property market.",
      qualifications: ["2yr Real Estate", "Property Knowledge"],
      workHistory: "Keller Williams (Agent, 2024-2026)",
      certifications: [],
      whyApply: "Real estate and construction seem like a natural fit.",
      heardFrom: "LinkedIn",
      aiNotes: "POSSIBLE match. Real estate background provides property market understanding. Sales skills transferable. No construction-specific knowledge. Overall: POSSIBLE match.",
      resumeFile: "diana-price-resume.pdf",
    },
    {
      id: "c-27", name: "Chris Blake", email: "chris.b@email.com", phone: "(651) 555-0334", location: "Burnsville, MN",
      score: 15, category: "not_qualified",
      experience: "No relevant experience.",
      qualifications: ["No Relevant Exp"],
      workHistory: "Warehouse Worker (2023-2026)",
      certifications: [],
      whyApply: "Looking for better pay.",
      heardFrom: "Craigslist",
      aiNotes: "NOT QUALIFIED. No sales or customer-facing experience. Warehouse background not relevant. Overall: Does not meet qualifications.",
      resumeFile: "chris-blake-resume.pdf",
    },
  ],
  "pos-3": [
    {
      id: "c-30", name: "Alex Morgan", email: "alex.m@email.com", phone: "(612) 555-0456", location: "Minneapolis, MN",
      score: 91, category: "strong",
      experience: "3 years commercial drone operation with FAA Part 107. Experienced in roof inspections and mapping.",
      qualifications: ["3yr Drone Ops", "FAA Part 107", "Roof Inspections", "DJI Certified"],
      workHistory: "AerialView MN (Drone Pilot, 2023-2026)\nFreelance Drone Photography (2022-2023)",
      certifications: ["FAA Part 107", "DJI Enterprise Certified"],
      whyApply: "I want to combine my drone expertise with the construction industry to provide the best inspection services possible.",
      heardFrom: "LinkedIn",
      aiNotes: "STRONG match. 3 years drone operation with FAA Part 107 certification. Specific roof inspection experience is highly valuable. DJI Enterprise certified. Overall: STRONG match.",
      resumeFile: "alex-morgan-resume.pdf",
    },
    {
      id: "c-31", name: "Sam Torres", email: "sam.t@email.com", phone: "(651) 555-0567", location: "Woodbury, MN",
      score: 72, category: "possible",
      experience: "1 year drone photography, FAA Part 107. No construction inspection experience.",
      qualifications: ["1yr Drone", "FAA Part 107", "Photography"],
      workHistory: "Freelance Photography (2025-2026)",
      certifications: ["FAA Part 107"],
      whyApply: "Interested in applying drone skills to construction inspections.",
      heardFrom: "Indeed",
      aiNotes: "POSSIBLE match. Has FAA Part 107 and drone experience but limited to photography. No construction-specific inspection experience. Would need training on damage assessment. Overall: POSSIBLE match.",
      resumeFile: "sam-torres-resume.pdf",
    },
    {
      id: "c-32", name: "Pat Riley", email: "pat.r@email.com", phone: "(763) 555-0678", location: "Plymouth, MN",
      score: 45, category: "possible",
      experience: "Hobbyist drone operator. No commercial license.",
      qualifications: ["Hobbyist Drone", "No FAA License"],
      workHistory: "IT Support (2022-2026)",
      certifications: [],
      whyApply: "I fly drones as a hobby and want to make it my career.",
      heardFrom: "Facebook",
      aiNotes: "POSSIBLE match. Drone enthusiasm but no commercial license (FAA Part 107 required). Would need to obtain certification. No inspection experience. Overall: POSSIBLE -- would need significant training and certification.",
      resumeFile: "pat-riley-resume.pdf",
    },
    {
      id: "c-33", name: "Jordan Lee", email: "jordan.l@email.com", phone: "(952) 555-0789", location: "Bloomington, MN",
      score: 20, category: "not_qualified",
      experience: "No drone or inspection experience.",
      qualifications: ["No Relevant Exp"],
      workHistory: "Restaurant Server (2024-2026)",
      certifications: [],
      whyApply: "Drones seem cool.",
      heardFrom: "Indeed",
      aiNotes: "NOT QUALIFIED. No drone experience. No certifications. No relevant background. Overall: Does not meet any qualifications.",
      resumeFile: "jordan-lee-resume.pdf",
    },
  ],
};

/* ── component ── */
export default function HiringPositionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const position = positionsMap[id || ""];
  const candidates = candidatesData[id || ""] || [];
  const [detailCandidate, setDetailCandidate] = useState<Candidate | null>(null);
  const [toast, setToast] = useState("");
  const [expandedCategory, setExpandedCategory] = useState<Record<string, boolean>>({ strong: true, possible: true, not_qualified: true });
  const [interviewedIds, setInterviewedIds] = useState<Set<string>>(new Set());
  const [rejectedIds, setRejectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  if (!position) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Position Not Found</h2>
        <Btn onClick={() => navigate("/hiring")}>Back to Hiring</Btn>
      </div>
    );
  }

  const strong = candidates.filter((c) => c.category === "strong");
  const possible = candidates.filter((c) => c.category === "possible");
  const notQualified = candidates.filter((c) => c.category === "not_qualified");

  function scheduleInterview(c: Candidate) {
    setInterviewedIds((prev) => new Set([...prev, c.id]));
    setToast(`Interview scheduled with ${c.name}`);
  }

  function rejectCandidate(c: Candidate) {
    setRejectedIds((prev) => new Set([...prev, c.id]));
    setToast(`${c.name} has been rejected`);
  }

  function ScoreBar({ score }: { score: number }) {
    const color = score >= 75 ? "#10b981" : score >= 40 ? "#f59e0b" : "#ef4444";
    return (
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, background: color }} />
        </div>
        <span className="text-sm font-bold" style={{ color }}>{score}%</span>
      </div>
    );
  }

  function CandidateCard({ c }: { c: Candidate }) {
    const isInterviewed = interviewedIds.has(c.id);
    const isRejected = rejectedIds.has(c.id);

    return (
      <div className={`bg-white rounded-xl border p-4 hover:shadow-md transition ${isRejected ? "opacity-50 border-red-200" : "border-gray-200"}`}>
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="font-bold text-gray-900 flex items-center gap-2">
              {c.name}
              {isInterviewed && <Badge color="#f59e0b">Interview Scheduled</Badge>}
              {isRejected && <Badge color="#ef4444">Rejected</Badge>}
            </h4>
            <p className="text-sm text-gray-500 mt-0.5">{c.experience.slice(0, 100)}...</p>
          </div>
          <div className="w-32">
            <ScoreBar score={c.score} />
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap mb-3">
          {c.qualifications.map((q) => (
            <Badge key={q} color={c.category === "strong" ? "#10b981" : c.category === "possible" ? "#f59e0b" : "#ef4444"} sm>
              {q}
            </Badge>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Btn size="sm" color="#3b82f6" onClick={() => setDetailCandidate(c)}>
            <Eye className="w-3.5 h-3.5 mr-1 inline" /> View Full Application
          </Btn>
          {!isInterviewed && !isRejected && (
            <>
              <Btn size="sm" color="#f59e0b" onClick={() => scheduleInterview(c)}>
                <CalendarCheck className="w-3.5 h-3.5 mr-1 inline" /> Schedule Interview
              </Btn>
              <Btn size="sm" color="#ef4444" variant="outline" onClick={() => rejectCandidate(c)}>
                <XCircle className="w-3.5 h-3.5 mr-1 inline" /> Reject
              </Btn>
            </>
          )}
        </div>
      </div>
    );
  }

  function CategorySection({ title, icon, color, candidates: cats }: { title: string; icon: React.ReactNode; color: string; candidates: Candidate[] }) {
    const key = cats[0]?.category || "strong";
    const isOpen = expandedCategory[key];
    return (
      <div className="space-y-3">
        <button
          onClick={() => setExpandedCategory((prev) => ({ ...prev, [key]: !prev[key] }))}
          className="flex items-center gap-2 w-full text-left"
        >
          <div className="w-3 h-3 rounded-full" style={{ background: color }} />
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            {icon} {title} ({cats.length})
          </h3>
          {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400 ml-auto" /> : <ChevronDown className="w-4 h-4 text-gray-400 ml-auto" />}
        </button>
        {isOpen && (
          <div className="space-y-3 ml-5">
            {cats.map((c) => (
              <CandidateCard key={c.id} c={c} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back */}
      <button onClick={() => navigate("/hiring")} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition">
        <ArrowLeft className="w-4 h-4" /> Back to AI Hiring
      </button>

      {/* Position header */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{position.title}</h1>
              <Badge color={position.status === "open" ? "#10b981" : "#ef4444"}>
                {position.status === "open" ? "Open" : "Closed"}
              </Badge>
              <Badge color="#7c3aed">{position.department}</Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>{position.type}</span>
              <span>{position.payRange}</span>
              <span>{position.location}</span>
              <span>Posted {position.postedDate}</span>
            </div>
          </div>
          <Btn size="sm" color="#ef4444" variant="outline" onClick={() => { setToast("Position closed. Auto-removing from all platforms..."); }}>
            <XCircle className="w-3.5 h-3.5 mr-1 inline" /> Close Position
          </Btn>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-4 pt-4 border-t border-gray-100">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{candidates.length}</div>
            <div className="text-xs text-gray-500">Applications</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{strong.length}</div>
            <div className="text-xs text-gray-500">Strong</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{possible.length}</div>
            <div className="text-xs text-gray-500">Possible</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-500">{notQualified.length}</div>
            <div className="text-xs text-gray-500">Not Qualified</div>
          </div>
        </div>
      </div>

      {/* AI Screening header */}
      <div className="flex items-center gap-2">
        <Brain className="w-5 h-5 text-purple-600" />
        <h2 className="text-lg font-bold text-gray-900">AI Candidate Screening</h2>
      </div>

      {/* Categories */}
      {strong.length > 0 && (
        <CategorySection
          title="STRONG MATCH"
          icon={<Star className="w-4 h-4 text-green-600" />}
          color="#10b981"
          candidates={strong}
        />
      )}
      {possible.length > 0 && (
        <CategorySection
          title="POSSIBLE MATCH"
          icon={<AlertTriangle className="w-4 h-4 text-yellow-600" />}
          color="#f59e0b"
          candidates={possible}
        />
      )}
      {notQualified.length > 0 && (
        <CategorySection
          title="NOT QUALIFIED"
          icon={<XCircle className="w-4 h-4 text-red-500" />}
          color="#ef4444"
          candidates={notQualified}
        />
      )}

      {/* Application Detail Modal */}
      <Modal
        open={!!detailCandidate}
        onClose={() => setDetailCandidate(null)}
        title={detailCandidate ? `Application: ${detailCandidate.name}` : ""}
        wide
      >
        {detailCandidate && (
          <div className="space-y-5">
            {/* Contact */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700">{detailCandidate.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700">{detailCandidate.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700">{detailCandidate.location}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Briefcase className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700">Heard via: {detailCandidate.heardFrom}</span>
              </div>
            </div>

            {/* Score */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">AI Match Score</label>
              <div className="w-full">
                <ScoreBar score={detailCandidate.score} />
              </div>
            </div>

            {/* Certifications */}
            {detailCandidate.certifications.length > 0 && (
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">Certifications</label>
                <div className="flex gap-1.5 flex-wrap">
                  {detailCandidate.certifications.map((cert) => (
                    <Badge key={cert} color="#7c3aed">
                      <Award className="w-3 h-3 mr-0.5 inline" /> {cert}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Resume */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">Resume</label>
              <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg border border-blue-200 text-sm text-blue-700">
                <Briefcase className="w-4 h-4" /> {detailCandidate.resumeFile}
              </div>
            </div>

            {/* Experience */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">Experience Summary</label>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{detailCandidate.experience}</p>
            </div>

            {/* Work History */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">Work History</label>
              <pre className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap font-sans">{detailCandidate.workHistory}</pre>
            </div>

            {/* Why Apply */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">Why Smart Construction?</label>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{detailCandidate.whyApply}</p>
            </div>

            {/* AI Notes */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block flex items-center gap-1.5">
                <Brain className="w-4 h-4 text-purple-600" /> AI Screening Notes
              </label>
              <div className="text-sm text-gray-700 bg-purple-50 border border-purple-200 p-3 rounded-lg whitespace-pre-wrap">
                {detailCandidate.aiNotes}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
              {!interviewedIds.has(detailCandidate.id) && !rejectedIds.has(detailCandidate.id) && (
                <>
                  <Btn color="#f59e0b" onClick={() => { scheduleInterview(detailCandidate); setDetailCandidate(null); }}>
                    <CalendarCheck className="w-4 h-4 mr-1 inline" /> Schedule Interview
                  </Btn>
                  <Btn color="#ef4444" variant="outline" onClick={() => { rejectCandidate(detailCandidate); setDetailCandidate(null); }}>
                    <XCircle className="w-4 h-4 mr-1 inline" /> Reject
                  </Btn>
                </>
              )}
              <Btn color="#6b7280" variant="outline" onClick={() => setDetailCandidate(null)}>
                Close
              </Btn>
            </div>
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
