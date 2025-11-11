import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen,
  Briefcase,
  ChevronDown,
  ChevronUp,
  Clock,
  FileText,
  HelpCircle,
  Mail,
  MessageCircle,
  Search,
  Shield,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  tags: string[];
}

const faqData: FAQItem[] = [
  // ==================== GETTING STARTED ====================
  {
    id: "faq-001",
    category: "Getting Started",
    question: "What is this Applicant Tracking System?",
    answer:
      "This is a recruitment management system that helps you track job applications, manage candidates, organize jobs, and work with clients. Think of it as your complete hiring assistant that keeps everything organized in one place.",
    tags: ["introduction", "overview", "basics"],
  },
  {
    id: "faq-002",
    category: "Getting Started",
    question: "What's the difference between Applications and Candidates?",
    answer:
      "Applications are new resumes that come in - they're like your inbox. When you review an application and click the green checkmark button to Approve it, that person becomes a Candidate in your system. Candidates can be assigned to jobs, moved through interview stages, and tracked over time. Rejected applications don't become candidates.",
    tags: ["applications", "candidates", "difference", "workflow"],
  },
  {
    id: "faq-003",
    category: "Getting Started",
    question: "How do I navigate around the system?",
    answer:
      "Use the left sidebar to access different sections: Dashboard (home page with charts), Clients (companies you work with), Jobs (open positions), Candidates (approved people), Applications (new resumes to review), Team (your coworkers), Search (find anything), Settings (system configuration), and Get Help (this page).",
    tags: ["navigation", "sidebar", "menu", "basics"],
  },

  // ==================== APPLICATIONS ====================
  {
    id: "faq-010",
    category: "Applications",
    question: "How do I review new applications?",
    answer:
      "Click 'Applications' in the left sidebar. You'll see a list of all new applications. Click on any row to open a drawer showing the person's resume, skills, and details. Use the green checkmark button to Approve (moves them to Candidates), or the red X button to Reject. You can also assign a reviewer using the dropdown in each row.",
    tags: ["applications", "review", "approve", "reject"],
  },
  {
    id: "faq-011",
    category: "Applications",
    question: "Can I filter applications?",
    answer:
      "Yes! At the top of the Applications page, you'll see filter buttons for 'All', 'Pending', 'Approved', and 'Rejected'. Click any of these to see only that type. You can also use the search box to find applications by name, email, or job title.",
    tags: ["applications", "filter", "search"],
  },
  {
    id: "faq-012",
    category: "Applications",
    question: "What happens when I approve an application?",
    answer:
      "When you click the green Approve button, the system automatically creates a new candidate record and links them to the job they applied for. They'll appear on the Candidates page and in that job's pipeline, starting at the first stage. This saves you from manually copying information.",
    tags: ["applications", "approve", "automation"],
  },
  {
    id: "faq-013",
    category: "Applications",
    question: "Can I bulk-select multiple applications?",
    answer:
      "Yes! Each row has a checkbox on the left. Click the checkbox in the table header to select all applications on the current page. Then use the bulk action buttons that appear at the top to approve or reject multiple applications at once.",
    tags: ["applications", "bulk", "selection"],
  },
  {
    id: "faq-014",
    category: "Applications",
    question: "How do applications come into the system?",
    answer:
      "Applications can come in three ways: 1) Direct Apply - people apply through your website or portal, 2) Manual - you or your team manually add someone, 3) Email Automation - resumes sent to your monitoring email are automatically parsed and added. You can see the source in the applications table.",
    tags: ["applications", "source", "automation", "email"],
  },
  {
    id: "faq-015",
    category: "Applications",
    question: "Can I reassign an application to another team member?",
    answer:
      "Yes! In the Applications table, find the 'Assigned To' column. Click the dropdown menu in any row and select a team member's name. That person will be notified and can see it's assigned to them.",
    tags: ["applications", "assign", "team"],
  },

  // ==================== CANDIDATES ====================
  {
    id: "faq-020",
    category: "Candidates",
    question: "How do I view all my candidates?",
    answer:
      "Click 'Candidates' in the left sidebar. You'll see a table with all approved candidates. You can view their name, email, assigned job, current stage (like Interview, Offer, etc.), client, and status. Click any row to open detailed information.",
    tags: ["candidates", "view", "list"],
  },
  {
    id: "faq-021",
    category: "Candidates",
    question: "How do I move a candidate through interview stages?",
    answer:
      "There are two ways: 1) In the Candidates table, click the stage dropdown in any row and select a new stage, or 2) Go to the Jobs page, click on a job to see its pipeline view, then drag and drop candidates between the stage columns (like a board). Both methods work the same way.",
    tags: ["candidates", "stages", "pipeline", "movement"],
  },
  {
    id: "faq-022",
    category: "Candidates",
    question: "What are the different candidate stages?",
    answer:
      "The typical stages are: Screening (initial review), Interview (scheduled or completed interviews), Assessment (skills tests or assignments), Offer (offer extended), Hired (they accepted and started), and Rejected (no longer being considered). Your admin can customize these stages for each job.",
    tags: ["candidates", "stages", "workflow"],
  },
  {
    id: "faq-023",
    category: "Candidates",
    question: "Can I assign a candidate to a different job?",
    answer:
      "Yes! Open the candidate's details (click their row), find the 'Assigned Job' section, click the dropdown, and select a different job. This is helpful when someone isn't right for one position but perfect for another.",
    tags: ["candidates", "reassign", "jobs"],
  },
  {
    id: "faq-024",
    category: "Candidates",
    question: "How do I add notes about a candidate?",
    answer:
      "Open the candidate's details page by clicking their row. Scroll to the 'Notes' section and click the 'Add Note' button. Type your note (like interview feedback, strengths, concerns) and click 'Save'. All notes are timestamped and show who wrote them.",
    tags: ["candidates", "notes", "feedback"],
  },
  {
    id: "faq-025",
    category: "Candidates",
    question: "Can I see a candidate's interview history?",
    answer:
      "Yes! Open the candidate's profile and look for the 'Interview History' section. You'll see all past interviews, including dates, interviewers, ratings, feedback, and outcomes. This helps avoid submitting the same person to a client twice.",
    tags: ["candidates", "interviews", "history"],
  },
  {
    id: "faq-026",
    category: "Candidates",
    question: "What are candidate tags and how do I use them?",
    answer:
      "Tags are labels like 'JavaScript', 'Senior Level', or 'Remote Only' that help you organize candidates. Add tags by opening a candidate's profile and clicking in the tags field. Type to create new tags or select existing ones. Later, you can filter candidates by tags.",
    tags: ["candidates", "tags", "organization"],
  },
  {
    id: "faq-027",
    category: "Candidates",
    question: "How do I filter candidates?",
    answer:
      "Use the search box at the top of the Candidates page to search by name, email, or skills. You can also click on column headers to sort (like sorting by stage or client). If you need more specific filters, use the Search page for advanced filtering.",
    tags: ["candidates", "filter", "search"],
  },

  // ==================== JOBS ====================
  {
    id: "faq-030",
    category: "Jobs",
    question: "How do I create a new job posting?",
    answer:
      "Click 'Jobs' in the left sidebar, then click the blue 'Add Job' button at the top right. Fill in the job title, description, requirements, salary range, location, employment type (full-time, part-time, etc.), and select the client. Click 'Create Job' when done. The job will immediately be available for applications.",
    tags: ["jobs", "create", "posting"],
  },
  {
    id: "faq-031",
    category: "Jobs",
    question: "Can I edit a job after creating it?",
    answer:
      "Yes! Go to the Jobs page, find your job in the list, and click on it. You'll see an 'Edit Job' button at the top. You can change the title, description, requirements, salary, status, or any other field. Changes are saved immediately.",
    tags: ["jobs", "edit", "update"],
  },
  {
    id: "faq-032",
    category: "Jobs",
    question: "How do I see all candidates for a specific job?",
    answer:
      "Click 'Jobs' in the sidebar, then click on any job title. You'll see a pipeline view (like a board) with columns for each stage (Screening, Interview, etc.). Each column shows candidates in that stage. You can drag candidates between columns to update their status.",
    tags: ["jobs", "pipeline", "candidates", "view"],
  },
  {
    id: "faq-033",
    category: "Jobs",
    question: "What does 'Job Status' mean?",
    answer:
      "Job Status shows if a job is Active (accepting applications), On Hold (temporarily paused), Closed (filled or cancelled), or Draft (not yet published). You can change the status in the job's edit page. Closed jobs won't accept new applications.",
    tags: ["jobs", "status", "active", "closed"],
  },
  {
    id: "faq-034",
    category: "Jobs",
    question: "How do I schedule an interview for a candidate?",
    answer:
      "Go to the Jobs page, click on a job to see the pipeline, find the candidate you want to interview, and click on their card. Look for the 'Schedule Interview' button. Fill in the interview details including date, time, type (video, phone, in-person), duration, and optionally create a Zoom meeting link. The candidate will receive an automated email invitation with all the details.",
    tags: ["jobs", "interview", "schedule", "zoom"],
  },
  {
    id: "faq-035",
    category: "Jobs",
    question: "How do I close or archive an old job?",
    answer:
      "Go to the Jobs page, click on the job you want to close, click 'Edit Job', and change the Status dropdown to 'Closed'. This stops new applications but keeps all historical data and candidate information accessible for future reference.",
    tags: ["jobs", "close", "archive"],
  },
  {
    id: "faq-036",
    category: "Jobs",
    question: "What is the pipeline view?",
    answer:
      "The pipeline view is like a board with columns for each interview stage. When you click on a job, you see all candidates organized by their current stage. You can drag candidates between columns to move them forward or backward in the process. It's a visual way to manage your hiring workflow.",
    tags: ["jobs", "pipeline", "kanban", "workflow"],
  },

  // ==================== CLIENTS ====================
  {
    id: "faq-040",
    category: "Clients",
    question: "How do I add a new client?",
    answer:
      "Click 'Clients' in the left sidebar, then click the 'Add Client' button at the top. Fill in the company name, industry, website, address, and primary contact information. You can also add notes. Click 'Create Client' to save. The client will appear in your clients list and can be selected when creating jobs.",
    tags: ["clients", "add", "create"],
  },
  {
    id: "faq-041",
    category: "Clients",
    question: "Can I add multiple contacts for one client?",
    answer:
      "Yes! Open a client's details by clicking their name. Go to the 'Contacts' tab and click 'Add Contact'. Enter the contact's name, email, phone, role, and mark if they're the primary contact. You can add as many contacts as needed - helpful for large companies with multiple hiring managers.",
    tags: ["clients", "contacts", "multiple"],
  },
  {
    id: "faq-042",
    category: "Clients",
    question: "How do I see all jobs for a specific client?",
    answer:
      "Click 'Clients' in the sidebar, then click on the client's name. You'll see their profile with tabs for Overview, Jobs, Contacts, and Notes. Click the 'Jobs' tab to see all jobs (active and closed) for that client.",
    tags: ["clients", "jobs", "view"],
  },
  {
    id: "faq-043",
    category: "Clients",
    question: "Can I add notes about a client?",
    answer:
      "Yes! Open the client's profile and go to the 'Notes' tab. Click 'Add Note' to record information like meeting notes, preferences, feedback, or important dates. All notes show who added them and when.",
    tags: ["clients", "notes", "information"],
  },
  {
    id: "faq-044",
    category: "Clients",
    question: "How do I edit client information?",
    answer:
      "Click 'Clients' in the sidebar, find your client, and click on their name. You'll see an 'Edit Client' button at the top. You can update company name, industry, address, website, or any other details. Changes save automatically.",
    tags: ["clients", "edit", "update"],
  },

  // ==================== TEAM ====================
  {
    id: "faq-050",
    category: "Team",
    question: "How do I add a new team member?",
    answer:
      "Click 'Team' in the left sidebar, then click the 'Add Member' button. Enter their name, email, and select their role (Admin, Recruiter, Hiring Manager, or Viewer). You can also add their department and job title. Click 'Send Invitation' - they'll receive an email to set up their account.",
    tags: ["team", "add", "invite"],
  },
  {
    id: "faq-051",
    category: "Team",
    question: "What are the different user roles?",
    answer:
      "Admin: Full access to everything including settings and team management. Recruiter: Can manage clients, jobs, applications, and candidates. Hiring Manager: Can view and manage jobs and candidates, limited client access. Viewer: Read-only access to see reports and data but can't make changes.",
    tags: ["team", "roles", "permissions"],
  },
  {
    id: "faq-052",
    category: "Team",
    question: "Can I change someone's role or permissions?",
    answer:
      "Yes, but only if you're an Admin. Go to the Team page, click on the team member you want to change, and click 'Edit'. Change their role in the dropdown or toggle specific permissions. Changes take effect immediately and the person will see their new access level.",
    tags: ["team", "permissions", "roles", "edit"],
  },
  {
    id: "faq-053",
    category: "Team",
    question: "How do I deactivate or remove a team member?",
    answer:
      "Go to the Team page, click on the person you want to remove, and click 'Edit'. Look for the 'Status' field and change it to 'Inactive', or click the 'Delete' button if you want to completely remove them. Inactive users can't log in but their data remains. Deleted users are permanently removed.",
    tags: ["team", "remove", "deactivate"],
  },
  {
    id: "faq-054",
    category: "Team",
    question: "Can I see what each team member is working on?",
    answer:
      "Go to the Team page to see a list of all members. You can see how many jobs, candidates, or applications are assigned to each person. For more detail, go to Applications or Candidates page and look at the 'Assigned To' column to see who's handling what.",
    tags: ["team", "activity", "assignments"],
  },

  // ==================== DASHBOARD ====================
  {
    id: "faq-060",
    category: "Dashboard",
    question: "What information is on the Dashboard?",
    answer:
      "The Dashboard (home page) shows you an overview of your recruitment activity: total applications, approval rate, charts showing applications over time and by source (direct apply, manual, email automation), recent activity, and quick stats. It's your at-a-glance summary of everything happening.",
    tags: ["dashboard", "overview", "analytics"],
  },
  {
    id: "faq-061",
    category: "Dashboard",
    question: "What does the chart on the Dashboard show?",
    answer:
      "The main chart shows applications received over time, broken down by source (direct apply in blue, manual in orange, email automation in green). You can change the time range using the dropdown at the top of the chart (7 days, 30 days, 90 days, etc.).",
    tags: ["dashboard", "chart", "analytics"],
  },
  {
    id: "faq-062",
    category: "Dashboard",
    question: "Can I export Dashboard data?",
    answer:
      "Currently, the Dashboard is view-only. Data export features (CSV/Excel) are planned for future updates. If you need specific reports now, contact support and they can help generate them for you.",
    tags: ["dashboard", "export", "reports"],
  },

  // ==================== SEARCH ====================
  {
    id: "faq-070",
    category: "Search",
    question: "How do I use the global search?",
    answer:
      "Click 'Search' in the left sidebar or press Cmd+K (Mac) / Ctrl+K (Windows) from anywhere. Type what you're looking for - it searches across jobs, candidates, clients, applications, and team members. Results appear as you type, organized by category.",
    tags: ["search", "find", "global"],
  },
  {
    id: "faq-071",
    category: "Search",
    question: "Can I search for candidates with specific skills?",
    answer:
      "Yes! Use the Search page and type the skill name (like 'React', 'Marketing', 'Sales'). The search looks through candidate profiles, resumes, and tags. You can also go to the Candidates page and use the search box there for candidate-specific searches.",
    tags: ["search", "candidates", "skills"],
  },
  {
    id: "faq-072",
    category: "Search",
    question: "Does search remember my recent searches?",
    answer:
      "Yes! Your last 5 searches are saved automatically. You'll see them as quick access buttons at the top of the Search page. Click any recent search to run it again, or click 'Clear' to remove them all.",
    tags: ["search", "history", "recent"],
  },

  // ==================== SETTINGS ====================
  {
    id: "faq-080",
    category: "Settings",
    question: "Where do I find Settings?",
    answer:
      "Click 'Settings' in the left sidebar at the bottom. You'll see different sections: General (company info), Email Automation (resume monitoring), Email Templates (message templates), Pipeline Stages (customize interview stages), Tags & Categories (organize candidates), and User Settings (your personal preferences).",
    tags: ["settings", "configuration", "preferences"],
  },
  {
    id: "faq-081",
    category: "Settings",
    question: "What is Email Automation?",
    answer:
      "Email Automation lets you set up email accounts that automatically receive and process resumes. When someone sends a resume to your monitoring email, the system reads it, extracts information (name, skills, experience), and creates an application automatically. Go to Settings > Email Automation to set this up.",
    tags: ["settings", "email", "automation"],
  },
  {
    id: "faq-082",
    category: "Settings",
    question: "How do I pause email automation temporarily?",
    answer:
      "Go to Settings > Email Automation. You'll see a list of all your monitoring email accounts. Find the one you want to pause and click the pause button (two vertical bars icon) next to it. Click it again to resume. This is helpful when you're not actively hiring.",
    tags: ["settings", "email", "pause", "automation"],
  },
  {
    id: "faq-083",
    category: "Settings",
    question: "What are Email Templates?",
    answer:
      "Email Templates are pre-written email messages you can reuse. Go to Settings > Email Templates to create templates for common emails like interview invitations, rejection letters, offer letters, or follow-ups. You can use variables in two formats: {{candidateName}} or [Candidate Name], {{jobTitle}} or [Job Title], {{companyName}} or [Company Name], {{interviewDate}} or [Interview Date], etc. These variables get automatically replaced with real information when you send the email.",
    tags: ["settings", "email", "templates", "variables"],
  },
  {
    id: "faq-084",
    category: "Settings",
    question: "Can I customize the pipeline stages?",
    answer:
      "Yes! Go to Settings > Pipeline Stages. You can add, edit, or remove stages for your recruitment workflow. Common stages are Screening, Interview, Assessment, Offer, Hired, and Rejected. Changes apply to all new jobs, but existing jobs keep their current stages unless you update them.",
    tags: ["settings", "pipeline", "stages", "customize"],
  },
  {
    id: "faq-085",
    category: "Settings",
    question: "What are Tags and how do I manage them?",
    answer:
      "Tags are labels like 'JavaScript', 'Remote', 'Senior' that help organize candidates and jobs. Go to Settings > Tags to see all your tags, create new ones, edit names, or delete unused ones. Tags created here can be used throughout the system when tagging candidates or jobs.",
    tags: ["settings", "tags", "organize"],
  },
  {
    id: "faq-086",
    category: "Settings",
    question: "How do I change my personal information?",
    answer:
      "Click 'Settings' in the sidebar, then go to the 'User Settings' or 'Account' section. You can update your name, email, phone number, profile picture, password, and notification preferences. Changes to your profile are visible to other team members.",
    tags: ["settings", "account", "profile"],
  },

  // ==================== COMMON TASKS ====================
  {
    id: "faq-090",
    category: "Common Tasks",
    question: "How do I process a new application start to finish?",
    answer:
      "Step 1: Go to Applications page. Step 2: Click on an application to review their resume and details. Step 3: Click the green checkmark to Approve (or red X to Reject). Step 4: If approved, they automatically become a Candidate. Step 5: Go to Candidates page and move them through stages as you interview them. Step 6: When ready, change their stage to 'Offer' or 'Hired'.",
    tags: ["workflow", "process", "applications", "candidates"],
  },
  {
    id: "faq-091",
    category: "Common Tasks",
    question: "How do I post a new job and track applicants?",
    answer:
      "Step 1: Click 'Jobs' in sidebar. Step 2: Click blue 'Add Job' button. Step 3: Fill in job details and select the client. Step 4: Click 'Create Job'. Step 5: Applications will start appearing in your Applications page. Step 6: Click the job name in Jobs page to see the pipeline view of all candidates for that job.",
    tags: ["workflow", "jobs", "tracking"],
  },
  {
    id: "faq-092",
    category: "Common Tasks",
    question: "How do I move a candidate through the interview process?",
    answer:
      "Option 1: Go to Candidates page, find the candidate, click the stage dropdown in their row, and select the new stage. Option 2: Go to Jobs page, click the job, and drag the candidate's card between stage columns in the pipeline view. Both options update the candidate's status immediately.",
    tags: ["workflow", "candidates", "stages"],
  },
  {
    id: "faq-093",
    category: "Common Tasks",
    question: "How do I assign work to my team members?",
    answer:
      "For Applications: Go to Applications page and use the 'Assigned To' dropdown in each row. For Candidates: Go to Candidates page and use the 'Assigned To' field. The assigned person will see it in their list and can filter to see only their assignments.",
    tags: ["workflow", "team", "assignments"],
  },
  {
    id: "faq-094",
    category: "Common Tasks",
    question: "How do I find a specific candidate or application?",
    answer:
      "Quick search: Use the search box at the top of the Candidates or Applications page. Global search: Click 'Search' in the sidebar or press Cmd+K / Ctrl+K. Type the person's name, email, or any keyword. Results will show all matches across the system.",
    tags: ["workflow", "search", "finding"],
  },
  {
    id: "faq-095",
    category: "Common Tasks",
    question: "How do I check how many open positions I have?",
    answer:
      "Click 'Jobs' in the sidebar. At the top, you'll see a count of total jobs. To see only active (open) positions, look at the status column - jobs marked 'Active' are currently accepting applications. You can also see this summary on the Dashboard.",
    tags: ["workflow", "jobs", "counting"],
  },

  // ==================== TROUBLESHOOTING ====================
  {
    id: "faq-100",
    category: "Troubleshooting",
    question: "I don't see the 'Add Job' or 'Add Client' buttons. Why?",
    answer:
      "This is a permissions issue. Only users with Admin or Recruiter roles can create jobs and clients. If you're a Hiring Manager or Viewer, you can only view information, not create new items. Contact your system admin to adjust your permissions if needed.",
    tags: ["troubleshooting", "permissions", "access"],
  },
  {
    id: "faq-101",
    category: "Troubleshooting",
    question: "Why can't I move a candidate to a different stage?",
    answer:
      "Check these: 1) Make sure you have permission to edit candidates (Viewers can't edit). 2) The candidate must be assigned to a job before you can move them through stages. 3) Some stages may be locked depending on your workflow rules. If still stuck, contact your admin.",
    tags: ["troubleshooting", "candidates", "stages"],
  },
  {
    id: "faq-102",
    category: "Troubleshooting",
    question: "Email automation isn't working - no applications are coming in.",
    answer:
      "Check these: 1) Go to Settings > Email Automation and make sure the account is not paused (should show a pause icon, not a play icon). 2) Make sure 'Auto Process Resumes' is turned ON. 3) Verify people are actually sending emails to that address. 4) Check if there are errors shown next to the email account. Contact support if issues persist.",
    tags: ["troubleshooting", "email", "automation"],
  },
  {
    id: "faq-103",
    category: "Troubleshooting",
    question: "The application drawer is showing incomplete information.",
    answer:
      "This usually means the resume couldn't be fully parsed (converted to text). For email automation applications, try asking the sender to send a cleaner resume format (PDF or DOCX). For manual applications, you may need to fill in missing fields manually by editing the candidate profile after approval.",
    tags: ["troubleshooting", "applications", "parsing"],
  },
  {
    id: "faq-104",
    category: "Troubleshooting",
    question: "I approved an application but can't find the candidate.",
    answer:
      "When you approve an application, it becomes a candidate. Go to the 'Candidates' page (not Applications page) and search for their name. They should be there, assigned to the job they applied for, in the first stage of the pipeline.",
    tags: ["troubleshooting", "candidates", "applications"],
  },
  {
    id: "faq-105",
    category: "Troubleshooting",
    question: "Why are some text fields or names cut off in tables?",
    answer:
      "Long names, emails, or job titles are automatically shortened to fit in the table. Hover over any truncated text to see the full content in a tooltip. You can also click the row to open detailed view where all information is shown in full.",
    tags: ["troubleshooting", "display", "ui"],
  },

  // ==================== REAL-TIME & MESSAGING ====================
  {
    id: "faq-106",
    category: "Communication",
    question: "How do I send messages to my team members?",
    answer:
      "Click 'Messages' in the left sidebar to access the internal chat system. Select a team member from the list to start a conversation. All messages are real-time - your teammate will see them immediately without refreshing. You can send text messages and the system shows read receipts and typing indicators.",
    tags: ["messages", "chat", "communication", "team"],
  },
  {
    id: "faq-107",
    category: "Communication",
    question: "Are updates in the system real-time?",
    answer:
      "Yes! The system uses Firestore real-time technology. When someone approves an application, moves a candidate, or makes any change, everyone sees it immediately without refreshing the page. This prevents duplicate work and keeps everyone synchronized.",
    tags: ["realtime", "firestore", "updates", "synchronization"],
  },
  {
    id: "faq-108",
    category: "Notifications",
    question: "How do notifications work?",
    answer:
      "Click the bell icon in the top navigation to see your notifications. You'll be notified when: someone assigns you work, a candidate moves to a new stage, new applications arrive, team members message you, or important system events occur. You can mark notifications as read or delete them (admins only can delete).",
    tags: ["notifications", "alerts", "bell"],
  },
  {
    id: "faq-109",
    category: "Dashboard",
    question: "What is the Activities timeline?",
    answer:
      "The Activities section (visible on Dashboard and Team pages) shows a real-time log of all actions in the system: who created jobs, approved applications, moved candidates, scheduled interviews, etc. Each activity shows the user, action, timestamp, and affected resource. It's useful for tracking team productivity and auditing changes.",
    tags: ["activities", "timeline", "audit", "tracking"],
  },

  // ==================== BEST PRACTICES ====================
  {
    id: "faq-110",
    category: "Best Practices",
    question: "How often should I review new applications?",
    answer:
      "Check applications at least once daily if you're actively hiring. Quick response times (within 24-48 hours) improve candidate experience and increase acceptance rates. Set up email notifications in Settings so you're alerted when new applications arrive.",
    tags: ["best-practices", "applications", "workflow"],
  },
  {
    id: "faq-111",
    category: "Best Practices",
    question: "Should I use tags for candidates?",
    answer:
      "Yes! Tags make searching and organizing much easier. Create tags for: skills (JavaScript, Marketing), levels (Junior, Senior), preferences (Remote, Relocation), and specialties (Frontend, B2B Sales). Tag candidates as you review them - it takes 5 seconds but saves hours of searching later.",
    tags: ["best-practices", "tags", "organization"],
  },
  {
    id: "faq-112",
    category: "Best Practices",
    question: "What's the best way to organize jobs?",
    answer:
      "Use clear, specific job titles (like 'Senior React Developer - Remote' not just 'Developer'). Add detailed descriptions and requirements. Set realistic pipeline stages. Close jobs when filled - don't leave old jobs as 'Active' because it confuses tracking and analytics.",
    tags: ["best-practices", "jobs", "organization"],
  },
  {
    id: "faq-113",
    category: "Best Practices",
    question: "How should I use client notes?",
    answer:
      "Record important details: preferred communication methods, hiring preferences, feedback from past placements, interview style, decision timeline, and any quirks or requirements. This information helps you and your team provide better service and avoid repeating questions.",
    tags: ["best-practices", "clients", "notes"],
  },
  {
    id: "faq-114",
    category: "Best Practices",
    question: "What's the most efficient workflow for my team?",
    answer:
      "1) Assign applications to specific reviewers to avoid duplicate work. 2) Use tags and notes consistently. 3) Move candidates through stages promptly - don't leave them stuck. 4) Review the Dashboard weekly to spot bottlenecks. 5) Use email templates to save time on common communications. 6) Close or archive old jobs regularly.",
    tags: ["best-practices", "workflow", "efficiency", "team"],
  },
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFAQs, setExpandedFAQs] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("help-recent-searches");
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  // Save search to recent searches
  useEffect(() => {
    if (searchQuery.trim() && searchQuery.length > 2) {
      const timer = setTimeout(() => {
        setRecentSearches((prev) => {
          const updated = [
            searchQuery,
            ...prev.filter((s) => s !== searchQuery),
          ].slice(0, 5);
          localStorage.setItem("help-recent-searches", JSON.stringify(updated));
          return updated;
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [searchQuery]);

  const categories = useMemo(
    () => ["all", ...Array.from(new Set(faqData.map((faq) => faq.category)))],
    []
  );

  const filteredFAQs = useMemo(() => {
    return faqData.filter((faq) => {
      const matchesSearch =
        searchQuery === "" ||
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesCategory =
        selectedCategory === "all" || faq.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const getCategoryCount = (category: string) => {
    if (category === "all") return faqData.length;
    return faqData.filter((faq) => faq.category === category).length;
  };

  const toggleFAQ = (id: string) => {
    setExpandedFAQs((prev) =>
      prev.includes(id) ? prev.filter((faqId) => faqId !== id) : [...prev, id]
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Getting Started":
        return <BookOpen className="h-4 w-4" />;
      case "Candidates":
        return <Users className="h-4 w-4" />;
      case "Clients":
        return <Briefcase className="h-4 w-4" />;
      case "Team & Permissions":
        return <Shield className="h-4 w-4" />;
      case "Communication":
        return <MessageCircle className="h-4 w-4" />;
      case "Dashboard":
        return <FileText className="h-4 w-4" />;
      case "Search":
        return <Search className="h-4 w-4" />;
      case "Notifications":
        return <Mail className="h-4 w-4" />;
      case "Common Tasks":
        return <FileText className="h-4 w-4" />;
      case "Troubleshooting":
        return <HelpCircle className="h-4 w-4" />;
      case "Best Practices":
        return <BookOpen className="h-4 w-4" />;
      case "Settings":
        return <Shield className="h-4 w-4" />;
      case "Applications":
        return <FileText className="h-4 w-4" />;
      case "Jobs":
        return <Briefcase className="h-4 w-4" />;
      case "Team":
        return <Users className="h-4 w-4" />;
      case "Security":
        return <Shield className="h-4 w-4" />;
      default:
        return <HelpCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-3 py-3 md:gap-4 md:py-4">
          <div className="px-3 lg:px-4">
            <div className="mb-4 md:mb-6">
              <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                <div className="rounded-lg bg-primary/10 p-1.5 md:p-2 shrink-0">
                  <HelpCircle className="h-4 w-4 md:h-6 md:w-6 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg md:text-2xl font-bold text-foreground">
                    Help Center
                  </h2>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Find answers to common questions and get support
                  </p>
                </div>
              </div>

              <div className="relative max-w-2xl mb-4 md:mb-6">
                <Search className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                <Input
                  placeholder="Search for help..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 md:pl-12 pr-16 md:pr-24 h-10 md:h-12 text-sm md:text-base"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 md:right-2 top-1/2 transform -translate-y-1/2 h-8 md:h-9 text-xs md:text-sm"
                    onClick={() => setSearchQuery("")}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>

            {/* Recent Searches */}
            {recentSearches.length > 0 && searchQuery === "" && (
              <Card className="mb-4 md:mb-6 bg-accent/50">
                <CardHeader className="p-3 md:p-6">
                  <div className="flex items-center gap-1.5 md:gap-2">
                    <Clock className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                    <CardTitle className="text-sm md:text-lg">
                      Recent Searches
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-3 md:p-6 pt-0">
                  <div className="flex flex-wrap gap-1.5 md:gap-2">
                    {recentSearches.map((search, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        size="sm"
                        onClick={() => setSearchQuery(search)}
                        className="gap-1.5 md:gap-2 h-7 md:h-8 text-xs md:text-sm"
                      >
                        <Search className="h-2.5 w-2.5 md:h-3 md:w-3" />
                        {search}
                      </Button>
                    ))}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setRecentSearches([]);
                        localStorage.removeItem("help-recent-searches");
                        toast.success("Recent searches cleared");
                      }}
                      className="text-muted-foreground h-7 md:h-8 text-xs md:text-sm"
                    >
                      Clear
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex items-center gap-1.5 md:gap-2 mb-3 md:mb-4 flex-wrap">
              <span className="text-xs md:text-sm font-medium text-muted-foreground">
                Category:
              </span>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={
                    selectedCategory === category ? "primary" : "outline"
                  }
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={`gap-1 md:gap-2 transition-colors h-7 md:h-8 text-xs md:text-sm ${
                    selectedCategory === category
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  {category !== "all" && getCategoryIcon(category)}
                  <span className="hidden sm:inline">
                    {category === "all" ? "All" : category}
                  </span>
                  <span className="sm:hidden">
                    {category === "all" ? "All" : category.split(" ")[0]}
                  </span>
                  <Badge
                    variant={
                      selectedCategory === category ? "secondary" : "outline"
                    }
                    className="ml-0.5 md:ml-1 text-[10px] md:text-xs"
                  >
                    {getCategoryCount(category)}
                  </Badge>
                </Button>
              ))}
            </div>

            <Card>
              <CardHeader className="p-3 md:p-6">
                <div className="flex items-start md:items-center justify-between gap-2 flex-col md:flex-row">
                  <div>
                    <CardTitle className="text-base md:text-lg">
                      Frequently Asked Questions
                    </CardTitle>
                    <CardDescription className="text-xs md:text-sm">
                      {filteredFAQs.length} question
                      {filteredFAQs.length !== 1 ? "s" : ""} found
                    </CardDescription>
                  </div>
                  {filteredFAQs.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (expandedFAQs.length === filteredFAQs.length) {
                          setExpandedFAQs([]);
                        } else {
                          setExpandedFAQs(filteredFAQs.map((faq) => faq.id));
                        }
                      }}
                      className="w-full md:w-auto h-8 md:h-9 text-xs md:text-sm"
                    >
                      {expandedFAQs.length === filteredFAQs.length
                        ? "Collapse All"
                        : "Expand All"}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-2 p-3 md:p-6 pt-0">
                {filteredFAQs.length === 0 ? (
                  <div className="py-8 md:py-12 text-center text-muted-foreground">
                    <HelpCircle className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-2 md:mb-3 opacity-50" />
                    <p className="text-xs md:text-sm px-4">
                      No FAQs found matching your search
                    </p>
                  </div>
                ) : (
                  filteredFAQs.map((faq, index) => (
                    <div key={faq.id}>
                      <div
                        className={`p-3 md:p-4 rounded-lg hover:bg-accent cursor-pointer transition-all group ${
                          expandedFAQs.includes(faq.id)
                            ? "bg-accent/50 border-2 border-primary/30"
                            : "border-2 border-transparent"
                        }`}
                        onClick={() => toggleFAQ(faq.id)}
                      >
                        <div className="flex items-start justify-between gap-2 md:gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 md:gap-2 mb-1.5 md:mb-2">
                              {getCategoryIcon(faq.category)}
                              <Badge
                                variant="secondary"
                                className="text-[10px] md:text-xs"
                              >
                                {faq.category}
                              </Badge>
                            </div>
                            <h4 className="font-semibold text-foreground mb-1.5 md:mb-2 group-hover:text-primary transition-colors text-sm md:text-base">
                              {faq.question}
                            </h4>
                            {expandedFAQs.includes(faq.id) && (
                              <>
                                <Separator className="my-2 md:my-3" />
                                <p className="text-xs md:text-sm text-muted-foreground mb-2 md:mb-3 leading-relaxed">
                                  {faq.answer}
                                </p>
                                <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
                                  {faq.tags.map((tag) => (
                                    <Badge
                                      key={tag}
                                      variant="outline"
                                      className="text-[10px] md:text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSearchQuery(tag);
                                      }}
                                    >
                                      #{tag}
                                    </Badge>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`h-7 w-7 md:h-8 md:w-8 p-0 shrink-0 ${
                              expandedFAQs.includes(faq.id)
                                ? "bg-primary text-primary-foreground"
                                : ""
                            }`}
                          >
                            {expandedFAQs.includes(faq.id) ? (
                              <ChevronUp className="h-3 w-3 md:h-4 md:w-4" />
                            ) : (
                              <ChevronDown className="h-3 w-3 md:h-4 md:w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      {index < filteredFAQs.length - 1 && (
                        <Separator className="my-1.5 md:my-2" />
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="mt-4 md:mt-6 bg-primary/5 border-primary/20">
              <CardContent className="pt-4 md:pt-6 p-3 md:p-6">
                <div className="flex items-start gap-2 md:gap-3">
                  <div className="rounded-lg bg-primary p-1.5 md:p-2 shrink-0">
                    <Mail className="h-4 w-4 md:h-5 md:w-5 text-primary-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground mb-1 text-sm md:text-lg">
                      Need Technical Support?
                    </p>
                    <p className="text-xs md:text-sm text-muted-foreground mb-2 md:mb-3">
                      Contact the developer for assistance, bug reports, or
                      feature requests.
                    </p>
                    <div className="space-y-1.5 md:space-y-2 mb-3 md:mb-4">
                      <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-foreground p-1.5 md:p-2 rounded-lg">
                        <Mail className="h-3 w-3 md:h-4 md:w-4 text-primary shrink-0" />
                        <a
                          href="mailto:mislam.tauhidul@gmail.com"
                          className="hover:underline font-medium hover:text-primary break-all"
                        >
                          mislam.tauhidul@gmail.com
                        </a>
                      </div>
                      <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-foreground p-1.5 md:p-2 rounded-lg">
                        <Mail className="h-3 w-3 md:h-4 md:w-4 text-primary shrink-0" />
                        <a
                          href="mailto:mislam@aristagroups.com"
                          className="hover:underline font-medium hover:text-primary break-all"
                        >
                          mislam@aristagroups.com
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
