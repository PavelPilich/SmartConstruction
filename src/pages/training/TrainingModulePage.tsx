import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Clock, CheckCircle2, PlayCircle, BookOpen, Award,
  ChevronDown, ChevronRight, Lightbulb, Target, MousePointer,
} from "lucide-react";
import { Badge, Btn, Modal } from "../../components/ui";
import {
  getTrainingModules, completeModule, updateModuleProgress, subscribeTraining,
} from "./TrainingDashboardPage";

/* ───── Module content data ───── */
interface ChapterMarker { time: string; label: string; }
interface QuizQuestion { q: string; options: string[]; correct: number; }
interface GuideSection { title: string; what: string; why: string; steps: string[]; tip: string; }

interface ModuleContent {
  videoChapters: ChapterMarker[];
  guide: GuideSection[];
  quiz: QuizQuestion[];
  certTitle?: string;
}

const moduleContents: Record<string, ModuleContent> = {
  "platform-overview": {
    videoChapters: [
      { time: "0:00", label: "Welcome to Smart Construction" },
      { time: "2:30", label: "Dashboard Overview" },
      { time: "6:00", label: "Sidebar Navigation" },
      { time: "10:00", label: "Xactimate 7-Step Workflow" },
      { time: "15:00", label: "Quick Actions & Stat Cards" },
      { time: "20:00", label: "Navigating Between Pages" },
      { time: "25:00", label: "Best Practices" },
    ],
    guide: [
      { title: "Dashboard — Stat Cards", what: "The top row of the dashboard displays real-time stat cards: Total Estimates, Approved, Pending, Declined, Total Value, and Average Estimate.", why: "These cards give you an immediate snapshot of your business without navigating anywhere else.", steps: ["Open the platform — you land on the Dashboard by default", "Review the stat cards across the top row", "Click any stat card to filter estimates by that status"], tip: "The stat cards update in real-time. If a number looks wrong, check if someone else approved or declined an estimate." },
      { title: "Dashboard — Xactimate 7-Step Workflow", what: "Seven workflow step cards show each phase of the Xactimate estimating process: Create Project, Property Inspection, Upload to Xactimate, Generate Estimate, Submit to Insurance, Review & Approve, and Invoice & Close.", why: "This guides every employee through the exact process for every job. No steps get missed.", steps: ["View the 7-step workflow cards on the dashboard", "Each card shows the step number, title, and description", "Use this as a reference checklist for every project"], tip: "Print this workflow or bookmark it. New employees should follow these steps for every single project until it becomes second nature." },
      { title: "Dashboard — Quick Actions", what: "Buttons for common tasks: New Estimate, New Project, Schedule Inspection, View Reports.", why: "Saves time by providing one-click access to the most common actions.", steps: ["Click 'New Estimate' to start an estimate immediately", "Click 'New Project' to create a CRM project", "Click 'Schedule Inspection' to book a drone inspection", "Click 'View Reports' to see financial reports"], tip: "Keyboard shortcut: press 'N' on the dashboard to open the New Estimate form." },
      { title: "Dashboard — Recent Estimates & Blocked Alerts", what: "A table of recent estimates shows date, customer, status, and amount. Below that, blocked personnel alerts appear when any registered employee has been blocked by admin.", why: "You can quickly see what needs attention and who might need follow-up.", steps: ["Scroll down on the dashboard to see the Recent Estimates table", "Click any row to open the full Estimate Detail page", "Check Blocked Alerts — these employees cannot access the system"], tip: "Sort the table by clicking column headers. The Status column uses color-coded badges." },
      { title: "Sidebar Navigation", what: "The left sidebar organizes the entire platform into sections: Dashboard, CRM, Inspections, Storm Intel, Estimates, Scheduling, Financial, Contracts, QuickBooks, Registration, Client Portal, Sales, and Settings.", why: "Every feature is accessible from the sidebar. Understanding the layout means you will never get lost.", steps: ["The sidebar is always visible on the left", "Click any section label to expand its sub-items", "The active page is highlighted in blue", "Quick Stats at the bottom shows live counts"], tip: "The sidebar collapses on mobile. Use the hamburger menu icon to toggle it." },
      { title: "Navigating Between Pages", what: "You move between pages using the sidebar links, breadcrumbs at the top, or action buttons within pages.", why: "Efficient navigation saves hours per week when managing dozens of projects.", steps: ["Click sidebar items for direct navigation", "Use the browser back button or breadcrumbs to go back", "Use 'Back' buttons on detail pages to return to lists", "The header shows which page you are currently on"], tip: "Right-click sidebar links and 'Open in New Tab' to compare two pages side by side." },
    ],
    quiz: [
      { q: "What is the first step in the Xactimate 7-step workflow?", options: ["Generate Estimate", "Create Project", "Submit to Insurance", "Property Inspection"], correct: 1 },
      { q: "How many main sections are in the sidebar navigation?", options: ["5", "8", "13", "10"], correct: 2 },
      { q: "Which dashboard element shows real-time business metrics?", options: ["Sidebar", "Stat Cards", "Footer", "Settings page"], correct: 1 },
      { q: "What does the green 'All Systems Online' indicator mean?", options: ["Only estimates work", "All API integrations are connected and functioning", "The server is rebooting", "Only CRM is active"], correct: 1 },
      { q: "Where can you see blocked personnel alerts?", options: ["Settings page", "Dashboard bottom section", "Calendar", "Reports"], correct: 1 },
    ],
    certTitle: "Platform Certified — Smart Construction",
  },
  "crm-projects": {
    videoChapters: [
      { time: "0:00", label: "CRM Introduction" },
      { time: "5:00", label: "Creating a New Project" },
      { time: "12:00", label: "Project Stages" },
      { time: "20:00", label: "Edit, Delete & Notes" },
      { time: "28:00", label: "Linked Estimates" },
      { time: "35:00", label: "Leads Pipeline Kanban" },
      { time: "40:00", label: "Best Practices" },
    ],
    guide: [
      { title: "Creating a New Project", what: "Click 'New Project' on the Projects page to create a project. Fill in: Customer Name, Address, Phone, Email, Type (Roof/Siding/Window/Other), and optional notes.", why: "Every job starts as a project. This is the central record that links estimates, inspections, contracts, and invoices together.", steps: ["Navigate to CRM > Projects in the sidebar", "Click the 'New Project' button in the top right", "Fill in all required fields (name, address, phone)", "Select the project type from the dropdown", "Add any initial notes", "Click 'Create Project'"], tip: "Always enter the full street address — this enables the drone inspection scheduler to auto-populate the flight location." },
      { title: "Project Stages & How to Change Them", what: "Each project moves through stages: Lead, Contacted, Inspected, Estimated, Approved, In Progress, Completed, Closed. The stage badge on each project card shows where it is.", why: "Stages let you track where every job stands. Managers can filter by stage to see what needs attention.", steps: ["Open a project by clicking its card", "Find the 'Stage' dropdown at the top of the project detail", "Select the new stage from the dropdown", "The change saves automatically and updates the badge"], tip: "Move projects to 'Approved' only after you have the insurance company's written approval letter with scope and amount." },
      { title: "Edit, Delete & Add Notes", what: "Every project can be edited (change customer info, type, stage) or deleted. Notes can be added as a running log of activity.", why: "Keeps the project record accurate and provides a complete history for every team member.", steps: ["Click 'Edit' on the project detail page", "Modify any fields and click 'Save'", "To add a note, scroll to the Notes section", "Type your note and click 'Add Note'", "To delete a project, click the delete icon and confirm"], tip: "Add a note every time you communicate with the customer. This creates a paper trail that protects the company." },
      { title: "Linked Estimates", what: "From a project detail page, you can see all estimates linked to that project. Click 'Create Estimate' to start a new one that auto-links.", why: "Keeps estimates organized per project — especially important when a job has supplements or revised estimates.", steps: ["Open the project detail page", "Scroll to the 'Estimates' section", "Click any estimate to view its detail", "Click 'Create Estimate' to add a new linked estimate"], tip: "A single project can have multiple estimates — the original, a supplement, and a revised version. Link them all." },
      { title: "Leads Pipeline — Kanban View", what: "The Leads Pipeline page shows projects as cards in kanban columns organized by stage. You can conceptually drag projects between stages.", why: "Visual pipeline management lets you see your entire sales funnel at a glance.", steps: ["Navigate to CRM > Leads Pipeline in the sidebar", "View projects organized in stage columns", "Click any project card to open its detail", "Use filters at the top to narrow by type or date"], tip: "Focus on the 'Contacted' and 'Inspected' columns — those are your hottest leads that need follow-up." },
    ],
    quiz: [
      { q: "What is required when creating a new project?", options: ["Only the customer name", "Customer name, address, phone, and type", "Just an email address", "An existing estimate"], correct: 1 },
      { q: "What stage should a project be in before scheduling a drone inspection?", options: ["Completed", "Lead or Contacted", "Closed", "Invoiced"], correct: 1 },
      { q: "How do you link an estimate to a project?", options: ["Create estimate from the project detail page", "Send an email", "Upload a PDF", "Call the office"], correct: 0 },
      { q: "What is the purpose of the Leads Pipeline kanban view?", options: ["To delete old projects", "To visually track projects through sales stages", "To generate invoices", "To schedule drone flights"], correct: 1 },
      { q: "Why should you add notes after every customer interaction?", options: ["It's optional", "To create a paper trail and keep the team informed", "To increase the estimate amount", "Notes are only for managers"], correct: 1 },
    ],
    certTitle: "CRM & Project Management Certified",
  },
  "estimating": {
    videoChapters: [
      { time: "0:00", label: "Xactimate Overview" },
      { time: "8:00", label: "Creating an Estimate" },
      { time: "18:00", label: "Adding Line Items from Price List" },
      { time: "30:00", label: "Edit & Duplicate" },
      { time: "40:00", label: "Submitting to Insurance" },
      { time: "50:00", label: "Supplements" },
    ],
    guide: [
      { title: "Creating an Estimate", what: "Start a new estimate by clicking 'New Estimate'. Enter the customer name, project address, select line items from the Xactimate price list, and the system calculates totals automatically.", why: "Accurate estimates win jobs and ensure profitability. The price list uses current Xactimate pricing.", steps: ["Navigate to Estimates in the sidebar", "Click 'New Estimate'", "Enter customer name and address", "Add line items from the price list (search or browse categories)", "Adjust quantities for each line item", "Review the total and click 'Save'"], tip: "Always double-check the price list sync date — prices update quarterly from Xactimate." },
      { title: "Adding Line Items from Price List", what: "The price list contains hundreds of Xactimate line items organized by category: Roofing, Siding, Windows, Gutters, Interior, etc. Search or browse to add items.", why: "Using standardized Xactimate pricing ensures your estimates match what insurance companies expect to see.", steps: ["In the estimate editor, click 'Add Line Item'", "Use the search bar to find items by name or code", "Or browse by category (Roofing, Siding, etc.)", "Click an item to add it", "Enter the quantity (sq ft, linear ft, each, etc.)", "The price auto-fills from the current price list"], tip: "Use the 'Favorites' feature to save your most-used line items — roofing shingles, underlayment, and drip edge are used on almost every job." },
      { title: "Edit, Duplicate & Submit", what: "Existing estimates can be edited, duplicated (for supplements), or submitted to insurance. The submit action formats the estimate in Xactimate-compatible format.", why: "Duplicating saves time when creating supplements. Submitting in the correct format speeds up insurance approval.", steps: ["Open an existing estimate", "Click 'Edit' to modify line items or customer info", "Click 'Duplicate' to create a copy (useful for supplements)", "Click 'Submit to Insurance' to generate the formatted document", "Select the insurance company from the dropdown", "Confirm and send"], tip: "Before submitting to insurance, have a senior estimator review the scope. Missed items mean lost revenue." },
      { title: "Supplements", what: "Supplements are additional estimates created when the original scope doesn't cover all needed work. They reference the original estimate and show only the additional items.", why: "Insurance companies frequently underpay initial claims. Supplements capture the additional work discovered during the project.", steps: ["Navigate to Estimates > Supplements", "Click 'Create Supplement'", "Link it to the original estimate", "Add only the NEW line items not in the original", "Include photos and documentation supporting each item", "Submit to the insurance adjuster"], tip: "Document everything with photos BEFORE starting work. Undocumented supplements get denied." },
    ],
    quiz: [
      { q: "Where do Xactimate prices come from in the platform?", options: ["You type them manually", "They sync from the Xactimate price list database", "The customer tells you", "Insurance sets them"], correct: 1 },
      { q: "When should you create a supplement?", options: ["Before the initial inspection", "When additional damage is discovered beyond the original scope", "On every job automatically", "Only for roofing jobs"], correct: 1 },
      { q: "What should you do before submitting an estimate to insurance?", options: ["Send it to the customer first", "Have a senior estimator review the scope", "Delete all notes", "Wait 30 days"], correct: 1 },
      { q: "What is the best practice for supplement documentation?", options: ["No documentation needed", "Take photos before starting work", "Only verbal descriptions", "Wait until the job is done"], correct: 1 },
      { q: "How are line item quantities measured?", options: ["Always in dollars", "By unit type — sq ft, linear ft, or each depending on the item", "Only in hours", "By weight"], correct: 1 },
    ],
    certTitle: "Xactimate Estimating Certified",
  },
  "insurance-claims": {
    videoChapters: [
      { time: "0:00", label: "Insurance Claims Overview" },
      { time: "5:00", label: "Initial Customer Contact" },
      { time: "12:00", label: "Filing the Claim" },
      { time: "20:00", label: "Adjuster Meeting" },
      { time: "30:00", label: "Approval Process" },
      { time: "38:00", label: "Common Pitfalls" },
    ],
    guide: [
      { title: "Initial Customer Contact — Storm Damage", what: "When a homeowner reports storm damage, the first step is always to schedule a drone inspection — never start repairs or promise anything before assessing.", why: "Proper documentation from the start protects both the customer and the company. Starting work before insurance approval can void the claim.", steps: ["Receive customer inquiry (phone, door knock, or lead)", "Create a new Project in the CRM", "Schedule a drone inspection within 48 hours", "Send the customer a confirmation text/email", "Do NOT discuss pricing or start any work yet"], tip: "The first 48 hours after a storm are critical. Respond fast and schedule inspections before competitors reach the homeowner." },
      { title: "Filing the Insurance Claim", what: "Help the customer file their claim with their insurance company. The claim number links everything together.", why: "A properly filed claim with good documentation gets approved faster and for higher amounts.", steps: ["Get the customer's insurance company name and policy number", "Help them call the claims line (or they call themselves)", "Record the claim number in the Project notes", "Upload drone inspection photos to the project", "Prepare the Xactimate estimate based on inspection findings"], tip: "Never file a claim on behalf of the customer without their explicit written permission. This is a legal requirement." },
      { title: "Meeting the Insurance Adjuster", what: "When the insurance adjuster visits the property, you should be present with your documentation ready — inspection report, photos, and Xactimate estimate.", why: "Being prepared and professional at the adjuster meeting directly impacts the approved amount.", steps: ["Confirm the adjuster visit date with the customer", "Print or have digital copies of: inspection report, drone photos, Xactimate estimate", "Meet the adjuster on-site", "Walk the property together, pointing out documented damage", "Take notes on what the adjuster agrees and disagrees with", "Record the adjuster's name, phone, and email in the project"], tip: "Always be respectful to adjusters. They handle hundreds of claims — being organized and professional makes you stand out and gets faster approvals." },
      { title: "Getting Approval — Scope and Amount", what: "The insurance company sends an approval letter with the agreed scope of work and approved dollar amount. This document is required before starting any work.", why: "Starting work without written approval exposes the company to non-payment. The approval letter is your contract with the insurance company.", steps: ["Wait for the written approval letter (not just a verbal OK)", "Compare the approved scope to your estimate", "If scope matches, proceed to contract signing", "If scope is less, prepare a supplement", "Upload the approval letter to the project", "Change the project stage to 'Approved'"], tip: "If the approved amount is significantly less than your estimate, file a supplement immediately. Do not start work on a short-funded project." },
    ],
    quiz: [
      { q: "What is the first step when a homeowner reports storm damage?", options: ["Start repairs immediately", "Schedule a drone inspection", "Call their insurance company", "Send an invoice"], correct: 1 },
      { q: "What document do you need from the insurance company before starting work?", options: ["W-9 Form", "Approval letter with scope and amount", "Business license", "Building permit"], correct: 1 },
      { q: "When should you be present during the insurance process?", options: ["Never — let the customer handle it", "Only at signing", "At the adjuster's property visit", "Only after work is complete"], correct: 2 },
      { q: "What should you do if the approved amount is less than your estimate?", options: ["Accept it and lose money", "File a supplement with additional documentation", "Cancel the project", "Argue with the adjuster"], correct: 1 },
      { q: "Why should you never start work before getting written approval?", options: ["It's just a suggestion", "You risk non-payment and voiding the claim", "The customer prefers to wait", "It doesn't matter"], correct: 1 },
    ],
    certTitle: "Insurance Claims Specialist",
  },
  "drone-inspection": {
    videoChapters: [
      { time: "0:00", label: "Drone Inspection Overview" },
      { time: "10:00", label: "12 Inspection Types" },
      { time: "25:00", label: "Scheduling an Inspection" },
      { time: "40:00", label: "Autonomous Flight Sequence" },
      { time: "55:00", label: "AI Damage Detection" },
      { time: "70:00", label: "Reports — Conservative vs Aggressive" },
      { time: "80:00", label: "Safety Protocols" },
    ],
    guide: [
      { title: "12 Inspection Types", what: "The platform supports 12 types of drone inspections: Shingle Roof, Metal Roof, Flat Roof, Tile Roof, Siding, Windows, Gutters, Chimney, Skylights, Ventilation, Fascia & Soffit, and Full Property (all combined).", why: "Different roof and property types require different flight patterns and camera angles. Selecting the right type ensures complete coverage.", steps: ["When scheduling, select the inspection type from the dropdown", "For storm damage, typically select 'Full Property'", "For targeted inspections, select the specific type", "Multiple types can be combined in one flight"], tip: "For insurance claims, always run 'Full Property' to capture everything. A missed section means missed money." },
      { title: "Scheduling an Inspection", what: "Schedule inspections with date, time, address, inspection type, and flight settings (altitude, overlap, camera angle).", why: "Proper scheduling ensures the crew has the right equipment and the customer knows when to expect the visit.", steps: ["Navigate to Inspections in the sidebar", "Click 'Schedule Inspection'", "Enter the property address", "Select the date and time", "Choose inspection type(s)", "Set flight parameters (altitude: 80-120 ft recommended, overlap: 75%)", "Assign a drone operator from the crew list", "Click 'Schedule'"], tip: "Schedule inspections for mid-morning (10am-2pm) when shadows are minimal and lighting is optimal for damage detection." },
      { title: "Autonomous Flight Sequence", what: "Once on-site, the drone flies an automated grid pattern. It captures overlapping images, then performs a focused inspection of flagged areas.", why: "Autonomous flight ensures consistent, complete coverage. Human pilots can miss areas or get inconsistent overlap.", steps: ["Arrive at the property and set up the DJI Mavic", "Open the flight app and load the scheduled inspection", "Perform pre-flight safety check (weather, obstacles, airspace)", "Tap 'Start Autonomous Flight'", "The drone flies the grid pattern automatically", "Monitor the flight from the ground controller", "Drone returns to home point when complete", "Upload images to the platform"], tip: "Always keep visual line of sight with the drone. FAA Part 107 requires it." },
      { title: "AI Damage Detection", what: "Uploaded images are analyzed by AI that detects damage: missing shingles, cracks, hail damage, ponding water, flashing issues, etc. Sensitivity can be adjusted from conservative to aggressive.", why: "AI catches damage that human eyes miss, especially hairline cracks and subtle hail impacts. This finds more billable work.", steps: ["After uploading inspection images, click 'Run AI Analysis'", "Set detection sensitivity (1-10, default 5)", "Conservative (1-3): Only obvious, undeniable damage", "Standard (4-6): Balanced detection", "Aggressive (7-10): Catches subtle damage, more false positives", "Review AI-flagged areas on the annotated images", "Accept or dismiss each finding"], tip: "For insurance claims, run analysis at sensitivity 7. For maintenance inspections, use 4-5. Always manually review AI findings." },
      { title: "Two Reports — Conservative & Aggressive", what: "The system generates two inspection reports: Conservative (only clear damage, lower estimate) and Aggressive (all possible damage, higher estimate).", why: "The conservative report is safe to show the insurance adjuster. The aggressive report shows the maximum possible scope — use it to prepare supplements.", steps: ["After AI analysis, click 'Generate Reports'", "Two reports appear: Conservative and Aggressive", "Conservative report: shows only confirmed damage with high confidence", "Aggressive report: includes all potential damage including subtle finds", "Download or share either report", "Use Conservative for initial insurance submission", "Use Aggressive for supplement planning"], tip: "Show the adjuster the Conservative report first. If they approve it all, you're done. If not, you have the Aggressive report ready for supplementing." },
    ],
    quiz: [
      { q: "How many inspection types does the platform support?", options: ["5", "8", "12", "20"], correct: 2 },
      { q: "What altitude range is recommended for roof inspections?", options: ["20-50 ft", "80-120 ft", "200-300 ft", "500 ft"], correct: 1 },
      { q: "Which AI sensitivity level should you use for insurance claims?", options: ["1 (lowest)", "5 (standard)", "7 (aggressive)", "10 (maximum)"], correct: 2 },
      { q: "Which report should you show the insurance adjuster first?", options: ["Aggressive", "Conservative", "Both at the same time", "Neither — no report needed"], correct: 1 },
      { q: "What FAA requirement must you follow during drone flight?", options: ["Fly only at night", "Maintain visual line of sight", "Fly above 400 ft", "No requirements"], correct: 1 },
    ],
    certTitle: "Drone Operator — Level 1",
  },
  "safety-osha": {
    videoChapters: [
      { time: "0:00", label: "Safety Overview" },
      { time: "10:00", label: "OSHA Requirements" },
      { time: "20:00", label: "Fall Protection" },
      { time: "30:00", label: "Ladder Safety" },
      { time: "40:00", label: "PPE Requirements" },
      { time: "50:00", label: "Emergency Procedures" },
    ],
    guide: [
      { title: "OSHA Requirements for Construction", what: "OSHA requires fall protection at 6 feet, hard hats, safety glasses, and proper ladder usage on all construction sites.", why: "Violations result in fines up to $15,625 per occurrence. More importantly, safety protects lives.", steps: ["Complete this training module first", "Always wear required PPE on every job site", "Conduct a site safety assessment before starting work", "Report hazards immediately to your supervisor", "Document safety compliance in the project notes"], tip: "Take a photo of the crew wearing PPE at the start of every job. This documents compliance and protects the company." },
      { title: "Fall Protection", what: "Any work at 6 feet or above requires fall protection: harnesses, guardrails, or safety nets.", why: "Falls are the number one cause of death in construction. This is non-negotiable.", steps: ["Inspect your harness before every use", "Anchor to a rated anchor point (5,000 lbs minimum)", "Keep the lanyard short to minimize fall distance", "Never remove fall protection to 'get a better angle'", "Report any frayed or damaged equipment immediately"], tip: "If you're on a roof, you're above 6 feet. Always wear your harness. No exceptions." },
      { title: "PPE Requirements", what: "Required PPE on every job: hard hat, safety glasses, work gloves, steel-toe boots, high-visibility vest, hearing protection (when using power tools).", why: "PPE is your last line of defense. When everything else fails, PPE prevents injuries.", steps: ["Check your PPE before leaving for the job site", "Replace any damaged or worn PPE immediately", "Hard hats must be replaced every 5 years or after impact", "Safety glasses must be ANSI Z87.1 rated", "Steel-toe boots must meet ASTM F2413 standards"], tip: "Keep a spare set of PPE in your truck. You'll thank yourself when you forget something." },
      { title: "Emergency Procedures", what: "Know the emergency action plan: call 911, administer first aid, notify the supervisor, document the incident.", why: "A quick, correct response can save a life. Hesitation costs critical seconds.", steps: ["If someone is injured, call 911 immediately", "Do not move the injured person unless they are in immediate danger", "Administer first aid if you are trained", "Call your supervisor immediately", "Secure the area to prevent additional injuries", "Document everything: photos, witness names, time, description", "Complete the incident report within 24 hours"], tip: "Know the address of every job site before you start work. You need to give it to 911 dispatchers." },
    ],
    quiz: [
      { q: "At what height does OSHA require fall protection?", options: ["4 feet", "6 feet", "10 feet", "Only above 20 feet"], correct: 1 },
      { q: "What is the minimum rated anchor point for a personal fall arrest system?", options: ["1,000 lbs", "3,000 lbs", "5,000 lbs", "500 lbs"], correct: 2 },
      { q: "What should you do first if a coworker is injured on the job?", options: ["Continue working", "Call 911", "Fill out paperwork", "Call the customer"], correct: 1 },
      { q: "How often must hard hats be replaced?", options: ["Every year", "Every 5 years or after any impact", "Never — they last forever", "Every month"], correct: 1 },
      { q: "What ANSI standard must safety glasses meet?", options: ["ANSI Z87.1", "ANSI B11", "ANSI C12", "No standard required"], correct: 0 },
    ],
    certTitle: "Safety & OSHA Compliant",
  },
  "sales-scripts": {
    videoChapters: [
      { time: "0:00", label: "Sales Overview" },
      { time: "5:00", label: "Door Knocking Scripts" },
      { time: "15:00", label: "Phone Scripts" },
      { time: "25:00", label: "Handling Objections" },
      { time: "35:00", label: "Insurance Claim Conversation" },
      { time: "40:00", label: "Closing Techniques" },
    ],
    guide: [
      { title: "Door Knocking Scripts", what: "Structured scripts for approaching homeowners after a storm. The script covers introduction, identifying damage, offering a free inspection, and setting the appointment.", why: "A consistent script ensures professionalism and converts more doors into appointments. Without a script, reps fumble and lose opportunities.", steps: ["Approach the door with a smile and your company badge visible", "Introduce yourself: 'Hi, I'm [Name] with Smart Construction'", "Reference the storm: 'We've been working in your neighborhood after the recent storm'", "Point out visible damage if you see any: 'I noticed your [shingles/siding] might have some damage'", "Offer the free inspection: 'We offer a free drone inspection — no obligation'", "Set the appointment: 'Would tomorrow morning or afternoon work better?'", "Leave a door hanger if no one answers"], tip: "Never say 'your roof is damaged' — say 'it looks like there might be some storm impact that's worth checking.' Certainty before inspection is unprofessional." },
      { title: "Phone Scripts", what: "Scripts for inbound and outbound calls: answering leads, following up on inspections, and scheduling appointments.", why: "Phone calls convert leads to jobs. A professional phone presence builds trust before you ever meet the customer.", steps: ["Answer within 3 rings: 'Smart Construction, this is [Name], how can I help you?'", "Listen to the customer's concern completely before responding", "Ask qualifying questions: address, type of damage, insurance company, when it happened", "Offer the free inspection with a specific time: 'I can have our drone team out there Wednesday at 10am'", "Confirm all details and send a text confirmation", "Follow up within 24 hours if they don't confirm"], tip: "Smile when you talk on the phone — the customer can hear it in your voice. This sounds silly but it works." },
      { title: "Common Objections and Responses", what: "The top 5 objections and proven responses: 'I already have a contractor', 'I'm not interested', 'My insurance won't cover it', 'Let me think about it', 'How much does it cost?'", why: "Every salesperson hears the same objections. Having prepared responses converts objections into appointments.", steps: ["'Already have a contractor' — 'That's great! We actually find a lot of additional damage that other contractors miss with our drone technology. A second opinion never hurts.'", "'Not interested' — 'I understand. Just so you know, most storm damage is invisible from the ground. Our free drone inspection catches things you can't see.'", "'Insurance won't cover it' — 'Actually, most homeowner policies cover storm damage at no cost to you except the deductible. We handle all the paperwork.'", "'Let me think about it' — 'Absolutely. One thing to keep in mind — insurance claims have a time limit. I'll leave my card and follow up in a couple days.'", "'How much does it cost?' — 'The inspection is 100% free. If we find damage, your insurance covers the repairs. Your only cost is typically your deductible.'"], tip: "Never argue with a homeowner. Acknowledge their concern, then redirect. 'I understand, and...' is your best friend." },
      { title: "Insurance Claim Conversation Flow", what: "How to explain the insurance claim process to a homeowner in simple terms. Most homeowners have never filed a claim and are nervous.", why: "A clear explanation builds trust and removes the fear barrier. Confused customers don't sign.", steps: ["Start with: 'Let me walk you through how this works — it's simpler than most people think'", "Explain: 'Your homeowner's insurance covers storm damage. We document the damage with drone photos and a professional estimate'", "Continue: 'We submit everything to your insurance company. They send an adjuster to verify'", "Add: 'Once approved, your insurance pays for the repairs. Your only cost is your deductible — typically $1,000-$2,500'", "Close with: 'We handle all the paperwork and communication with your insurance company. You just approve the work and enjoy your new roof'"], tip: "Use the phrase 'at no additional cost to you beyond your deductible' — it's accurate and reassuring." },
    ],
    quiz: [
      { q: "What is the first thing you should do when door knocking?", options: ["Ask for money", "Introduce yourself and your company", "Start climbing the roof", "Hand them a contract"], correct: 1 },
      { q: "How should you respond to 'I already have a contractor'?", options: ["Walk away", "Insult the other contractor", "Offer a free second opinion with drone technology", "Offer a lower price"], correct: 2 },
      { q: "What should you never say to a homeowner before inspecting?", options: ["'Hi, I'm with Smart Construction'", "'Your roof IS damaged'", "'We offer free inspections'", "'Would tomorrow work?'"], correct: 1 },
      { q: "How quickly should you answer a phone call?", options: ["Whenever you get to it", "Within 3 rings", "After 10 rings", "Let it go to voicemail first"], correct: 1 },
      { q: "What is the homeowner's typical cost for insurance-covered storm repairs?", options: ["Full cost of repairs", "Nothing at all", "Their deductible only", "50% of the total"], correct: 2 },
    ],
    certTitle: "Sales Certified — Smart Construction",
  },
  "customer-communication": {
    videoChapters: [
      { time: "0:00", label: "Communication Principles" },
      { time: "5:00", label: "Setting Expectations" },
      { time: "12:00", label: "Update Cadence" },
      { time: "18:00", label: "Handling Complaints" },
      { time: "25:00", label: "Review Requests" },
    ],
    guide: [
      { title: "Setting Expectations from Day One", what: "At the first meeting, provide a clear timeline: inspection date, estimate delivery, insurance submission, approval timeline, and projected work start.", why: "Customers who know what to expect don't call to complain. Uncertainty breeds frustration.", steps: ["At the initial meeting, verbally walk through the timeline", "Send a follow-up text/email with the timeline in writing", "Update the project notes with the communicated timeline", "Set reminders for each milestone", "Proactively reach out before the customer has to ask"], tip: "Under-promise and over-deliver on timelines. Say 'about 2 weeks' even if you think it'll be 10 days." },
      { title: "Update Cadence", what: "Contact every active customer at least once per week with a status update, even if nothing has changed.", why: "The number one complaint in construction is lack of communication. Weekly updates prevent this.", steps: ["Every Monday, review your active projects", "Send a brief text or call to each customer", "Even if nothing changed: 'Hi, this is [Name] from SC. Just checking in — your estimate is still with the insurance company. I'll follow up with them this week.'", "Log the communication in project notes"], tip: "A 30-second text on Monday prevents a 10-minute complaint call on Friday." },
      { title: "Handling Complaints", what: "When a customer complains, follow the L.A.S.T. method: Listen, Apologize, Solve, Thank.", why: "Handled well, a complaint becomes a 5-star review. Handled poorly, it becomes a lawsuit.", steps: ["LISTEN — Let them finish completely. Do not interrupt.", "APOLOGIZE — 'I'm sorry you're experiencing this. That's not acceptable.'", "SOLVE — 'Here's what I'm going to do to fix this...' — give a specific action and timeline", "THANK — 'Thank you for bringing this to my attention. We want to make this right.'", "Follow up within 24 hours to confirm the issue is resolved"], tip: "Never get defensive. The customer doesn't care whose fault it is — they care about the solution." },
    ],
    quiz: [
      { q: "How often should you contact active customers with updates?", options: ["Only when they call", "Once a month", "At least once per week", "Never — wait for them to call"], correct: 2 },
      { q: "What does the 'L' in the L.A.S.T. complaint method stand for?", options: ["Leave", "Listen", "Leverage", "Litigate"], correct: 1 },
      { q: "What should you do if nothing has changed on a customer's project?", options: ["Don't contact them", "Still send a brief update", "Tell them it's delayed", "Transfer them to a manager"], correct: 1 },
      { q: "What timeline approach should you use with customers?", options: ["Give the shortest possible timeline", "Under-promise and over-deliver", "Don't commit to any timeline", "Give the exact date you think"], correct: 1 },
      { q: "What is the most common complaint in construction?", options: ["Cost too high", "Lack of communication", "Wrong materials", "Slow work"], correct: 1 },
    ],
    certTitle: "Customer Communication Certified",
  },
};

/* Fallback content for modules without detailed content */
const defaultContent: ModuleContent = {
  videoChapters: [
    { time: "0:00", label: "Introduction" },
    { time: "5:00", label: "Key Concepts" },
    { time: "15:00", label: "Hands-On Walkthrough" },
    { time: "25:00", label: "Best Practices" },
  ],
  guide: [
    { title: "Module Overview", what: "This module covers the key concepts and hands-on skills you need.", why: "Understanding this topic is essential for your role at Smart Construction.", steps: ["Watch the training video above", "Read through the guide sections", "Complete the quiz at the bottom", "Apply what you learned on your next project"], tip: "Take notes while watching the video. The quiz questions are drawn directly from the content." },
  ],
  quiz: [
    { q: "Did you complete the training video for this module?", options: ["Yes, I watched the full video", "I skipped some parts", "I haven't watched it", "What video?"], correct: 0 },
    { q: "What is the first step when applying this knowledge?", options: ["Skip it", "Follow the procedures outlined in the training", "Make up your own process", "Ask a coworker to do it"], correct: 1 },
    { q: "Who should you contact if you have questions about this topic?", options: ["No one", "Your supervisor or the training lead", "The customer", "A random coworker"], correct: 1 },
    { q: "How often should you review this training material?", options: ["Never again", "Quarterly or when procedures change", "Only if asked", "Every day"], correct: 1 },
    { q: "What should you do after completing this module?", options: ["Forget about it", "Apply the knowledge on your next project", "Delete the training", "Complain about it"], correct: 1 },
  ],
};

/* ───── Component ───── */
export default function TrainingModulePage() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const [, setTick] = useState(0);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const videoTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({});
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [certModalOpen, setCertModalOpen] = useState(false);

  useEffect(() => {
    const unsub = subscribeTraining(() => setTick((t) => t + 1));
    return () => { unsub(); if (videoTimer.current) clearInterval(videoTimer.current); };
  }, []);

  const modules = getTrainingModules();
  const mod = modules.find((m) => m.id === id);
  if (!mod) return <div className="p-8 text-center text-gray-500">Module not found. <Btn onClick={() => nav("/training")}>Back to Training</Btn></div>;

  const content = (id && moduleContents[id]) || defaultContent;

  const playVideo = () => {
    if (videoPlaying) return;
    setVideoPlaying(true);
    setVideoProgress(0);
    videoTimer.current = setInterval(() => {
      setVideoProgress((p) => {
        if (p >= 100) {
          if (videoTimer.current) clearInterval(videoTimer.current);
          setVideoPlaying(false);
          if (mod.status !== "completed") updateModuleProgress(mod.id, Math.max(mod.progress, 50));
          return 100;
        }
        return p + 2;
      });
    }, 200);
  };

  const toggleSection = (i: number) => setExpandedSections((s) => ({ ...s, [i]: !s[i] }));

  const quizScore = () => {
    let correct = 0;
    content.quiz.forEach((q, i) => { if (quizAnswers[i] === q.correct) correct++; });
    return correct;
  };

  const submitQuiz = () => {
    setQuizSubmitted(true);
    const score = quizScore();
    const passed = score / content.quiz.length >= 0.8;
    if (passed && mod.status !== "completed") {
      completeModule(mod.id, content.certTitle);
      setCertModalOpen(true);
    }
  };

  const resetQuiz = () => {
    setQuizAnswers({});
    setQuizSubmitted(false);
  };

  const score = quizScore();
  const passed = score / content.quiz.length >= 0.8;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => nav("/training")} className="p-2 hover:bg-gray-100 rounded-lg transition">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{mod.title}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge color="#6366f1">{mod.category}</Badge>
            <Badge color="#6b7280"><Clock className="w-3 h-3 inline mr-0.5" />{mod.duration}</Badge>
            {mod.status === "completed" ? <Badge color="#10b981">Completed</Badge> : mod.status === "in-progress" ? <Badge color="#3b82f6">In Progress</Badge> : <Badge color="#6b7280">Not Started</Badge>}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-white border rounded-xl p-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="font-medium text-gray-700">Module Progress</span>
          <span className="text-gray-500">{mod.progress}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3">
          <div className={`rounded-full h-3 transition-all ${mod.status === "completed" ? "bg-green-500" : "bg-blue-500"}`} style={{ width: `${mod.progress}%` }} />
        </div>
      </div>

      {/* Video section */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="relative bg-gray-900 w-full" style={{ aspectRatio: "16/9" }}>
          {!videoPlaying && videoProgress < 100 ? (
            <button onClick={playVideo} className="absolute inset-0 flex flex-col items-center justify-center text-white hover:bg-gray-800/50 transition">
              <PlayCircle className="w-20 h-20 text-blue-400 mb-3" />
              <span className="text-lg font-medium">Click to play training video</span>
              <span className="text-sm text-gray-400 mt-1">{mod.title} — {mod.duration}</span>
            </button>
          ) : videoPlaying ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
              <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mb-4" />
              <span className="text-lg font-semibold text-blue-400">Video Playing...</span>
              <span className="text-sm text-gray-400 mt-1">{videoProgress}% complete</span>
              <div className="w-64 bg-gray-700 rounded-full h-2 mt-3">
                <div className="bg-blue-500 rounded-full h-2 transition-all" style={{ width: `${videoProgress}%` }} />
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
              <CheckCircle2 className="w-16 h-16 text-green-400 mb-3" />
              <span className="text-lg font-semibold text-green-400">Video Complete</span>
              <button onClick={() => { setVideoProgress(0); setVideoPlaying(false); }} className="mt-2 text-sm text-blue-400 hover:underline">Watch Again</button>
            </div>
          )}
        </div>
        {/* Chapter markers */}
        <div className="p-4 border-t">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Chapters</h3>
          <div className="flex flex-wrap gap-2">
            {content.videoChapters.map((ch, i) => (
              <button key={i} onClick={playVideo} className="text-xs bg-gray-100 hover:bg-blue-50 text-gray-600 hover:text-blue-600 rounded-lg px-3 py-1.5 transition">
                <span className="text-blue-500 font-mono mr-1">{ch.time}</span> {ch.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Guide content */}
      <div className="bg-white border rounded-xl">
        <div className="px-5 py-4 border-b flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-bold text-gray-900">Module Guide — Complete Reference</h2>
        </div>
        <div className="divide-y">
          {content.guide.map((section, i) => (
            <div key={i}>
              <button onClick={() => toggleSection(i)} className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition text-left">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-500" />
                  <span className="font-semibold text-gray-900">{section.title}</span>
                </div>
                {expandedSections[i] ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
              </button>
              {expandedSections[i] && (
                <div className="px-5 pb-5 space-y-3">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="text-xs font-semibold text-blue-700 uppercase mb-1">What it is</div>
                    <p className="text-sm text-gray-700">{section.what}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="text-xs font-semibold text-green-700 uppercase mb-1">Why you need it</div>
                    <p className="text-sm text-gray-700">{section.why}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs font-semibold text-gray-700 uppercase mb-1 flex items-center gap-1"><MousePointer className="w-3 h-3" /> How to use it</div>
                    <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                      {section.steps.map((step, j) => <li key={j}>{step}</li>)}
                    </ol>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-3 flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-xs font-semibold text-yellow-700 uppercase mb-0.5">Pro Tip</div>
                      <p className="text-sm text-gray-700">{section.tip}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Quiz section */}
      <div className="bg-white border rounded-xl">
        <div className="px-5 py-4 border-b flex items-center gap-2">
          <Award className="w-5 h-5 text-purple-600" />
          <h2 className="text-lg font-bold text-gray-900">Module Quiz — {content.quiz.length} Questions</h2>
          <span className="text-xs text-gray-500 ml-auto">80% required to pass</span>
        </div>
        <div className="p-5 space-y-6">
          {content.quiz.map((q, qi) => (
            <div key={qi} className={`rounded-lg border p-4 ${quizSubmitted ? (quizAnswers[qi] === q.correct ? "border-green-300 bg-green-50" : "border-red-300 bg-red-50") : "border-gray-200"}`}>
              <div className="font-semibold text-gray-900 text-sm mb-3">Q{qi + 1}: {q.q}</div>
              <div className="space-y-2">
                {q.options.map((opt, oi) => (
                  <label key={oi} className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition text-sm ${quizAnswers[qi] === oi ? "bg-blue-100 border border-blue-300" : "hover:bg-gray-50 border border-transparent"} ${quizSubmitted && oi === q.correct ? "!bg-green-100 !border-green-400 font-semibold" : ""} ${quizSubmitted && quizAnswers[qi] === oi && oi !== q.correct ? "!bg-red-100 !border-red-400" : ""}`}>
                    <input type="radio" name={`q-${qi}`} checked={quizAnswers[qi] === oi} onChange={() => !quizSubmitted && setQuizAnswers((a) => ({ ...a, [qi]: oi }))} disabled={quizSubmitted} className="accent-blue-600" />
                    <span>{opt}</span>
                    {quizSubmitted && oi === q.correct && <CheckCircle2 className="w-4 h-4 text-green-600 ml-auto" />}
                  </label>
                ))}
              </div>
            </div>
          ))}

          {!quizSubmitted ? (
            <Btn color="#8b5cf6" size="lg" onClick={submitQuiz} disabled={Object.keys(quizAnswers).length < content.quiz.length} className="w-full">
              Submit Quiz ({Object.keys(quizAnswers).length}/{content.quiz.length} answered)
            </Btn>
          ) : (
            <div className={`rounded-xl p-5 text-center ${passed ? "bg-green-50 border border-green-300" : "bg-red-50 border border-red-300"}`}>
              <div className="text-3xl font-bold mb-1">{score}/{content.quiz.length} — {Math.round((score / content.quiz.length) * 100)}%</div>
              <div className={`text-lg font-semibold ${passed ? "text-green-700" : "text-red-700"}`}>
                {passed ? "PASSED" : "NOT PASSED — 80% Required"}
              </div>
              {passed && content.certTitle && (
                <div className="mt-3 flex items-center justify-center gap-2 text-purple-700">
                  <Award className="w-5 h-5" />
                  <span className="font-bold">Certificate Earned: {content.certTitle}</span>
                </div>
              )}
              {!passed && (
                <Btn color="#ef4444" onClick={resetQuiz} className="mt-3">Try Again</Btn>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Certificate earned modal */}
      <Modal open={certModalOpen} onClose={() => setCertModalOpen(false)} title="Certificate Earned!" wide>
        <div className="text-center py-6">
          <div className="border-4 border-double border-indigo-300 rounded-xl p-8 mx-auto max-w-lg bg-gradient-to-b from-white to-indigo-50">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-black">SC</div>
              <span className="text-lg font-bold text-gray-900">Smart Construction & Remodeling</span>
            </div>
            <div className="text-xs text-gray-400 uppercase tracking-widest mb-6">Certificate of Completion</div>
            <div className="text-sm text-gray-600 mb-1">This certifies that</div>
            <div className="text-2xl font-bold text-indigo-700 mb-1">Employee Name</div>
            <div className="text-sm text-gray-600 mb-4">has successfully completed</div>
            <div className="text-xl font-bold text-gray-900 mb-1">{content.certTitle}</div>
            <div className="text-sm text-gray-500 mb-6">{new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</div>
            <div className="flex items-center justify-center gap-8 pt-4 border-t border-indigo-200">
              <div className="text-center">
                <div className="text-lg text-indigo-600 italic">Pavel Pilich</div>
                <div className="text-xs text-gray-400 border-t border-gray-300 pt-1 mt-1">Owner, Smart Construction</div>
              </div>
              <div className="text-center">
                <Award className="w-8 h-8 text-yellow-500 mx-auto" />
                <div className="text-xs text-gray-400 mt-1">Official Seal</div>
              </div>
            </div>
          </div>
          <Btn color="#3b82f6" onClick={() => setCertModalOpen(false)} className="mt-4">Continue Training</Btn>
        </div>
      </Modal>
    </div>
  );
}
