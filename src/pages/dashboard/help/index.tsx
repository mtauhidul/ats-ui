import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  HelpCircle,
  Search,
  BookOpen,
  MessageCircle,
  Video,
  FileText,
  Shield,
  Users,
  Briefcase,
  Mail,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  tags: string[];
}

const faqData: FAQItem[] = [
  {
    id: "faq-001",
    category: "Getting Started",
    question: "How do I add a new job posting?",
    answer: "Navigate to the Jobs page from the sidebar, click the 'Add Job' button, fill in the job details including title, description, requirements, and client information, then click 'Create Job'. The job will be published immediately.",
    tags: ["jobs", "posting", "create"]
  },
  {
    id: "faq-002",
    category: "Getting Started",
    question: "How do I review applications?",
    answer: "Go to the Applications page to see all pending applications. Click on any application to view the candidate's details, resume, and video introduction. Use the 'Approve' button to move them to the Candidates pipeline, or 'Reject' to decline the application.",
    tags: ["applications", "review", "approve"]
  },
  {
    id: "faq-003",
    category: "Candidates",
    question: "How do I track a candidate's interview history?",
    answer: "Open the candidate's profile from the Candidates page. Scroll to the 'Interview History' section to see all past interviews, their outcomes, ratings, and feedback. This helps prevent re-submitting candidates to the same clients.",
    tags: ["candidates", "interviews", "history"]
  },
  {
    id: "faq-004",
    category: "Candidates",
    question: "Can I move candidates between pipeline stages?",
    answer: "Yes! In the Job Pipeline view, you can drag and drop candidates between different stages (Screening, Interview, Assessment, Offer, etc.). This provides a visual Kanban-style workflow for managing the recruitment process.",
    tags: ["candidates", "pipeline", "stages"]
  },
  {
    id: "faq-005",
    category: "Clients",
    question: "How do I manage client information?",
    answer: "Go to the Clients page to view all clients. Click 'Add Client' to add new ones, or click on an existing client to view/edit details, add contacts, manage notes, and create jobs for that client.",
    tags: ["clients", "management", "contacts"]
  },
  {
    id: "faq-006",
    category: "Clients",
    question: "How do I add multiple contacts for a client?",
    answer: "Open the client's profile, go to the Contacts tab, and click 'Add Contact'. You can add multiple contacts and designate one as the primary contact. Each contact can have their own email, phone, and role information.",
    tags: ["clients", "contacts", "multiple"]
  },
  {
    id: "faq-007",
    category: "Team & Permissions",
    question: "What are the different user roles?",
    answer: "Admin: Full system access. Recruiter: Can manage clients, jobs, applications, and candidates. Hiring Manager: Can manage jobs and candidates, limited client access. Viewer: Read-only access to analytics and reports.",
    tags: ["roles", "permissions", "access"]
  },
  {
    id: "faq-008",
    category: "Team & Permissions",
    question: "How do I change user permissions?",
    answer: "Only Admins can modify user permissions. Go to the Team page, click on a team member, and edit their role or specific permissions. Changes take effect immediately.",
    tags: ["permissions", "roles", "team"]
  },
  {
    id: "faq-009",
    category: "Communication",
    question: "How do I send messages to team members?",
    answer: "Go to the Messages page to view all conversations. Click 'New Message' to start a conversation, select the recipient, add a subject and message, and optionally link it to a job, candidate, or client for context.",
    tags: ["messages", "communication", "team"]
  },
  {
    id: "faq-010",
    category: "Communication",
    question: "Can I use email templates?",
    answer: "Yes! Go to Settings > Email Templates to create and manage reusable templates for common emails like interview invitations, rejections, offers, and follow-ups. Templates support variables for personalization.",
    tags: ["email", "templates", "communication"]
  },
  {
    id: "faq-011",
    category: "Analytics",
    question: "What metrics can I track?",
    answer: "The Analytics page shows key metrics including total applications, approval rates, time-to-hire, applications over time, status distribution, top performing jobs, application sources, client activity, and recruitment funnel conversion.",
    tags: ["analytics", "metrics", "reports"]
  },
  {
    id: "faq-012",
    category: "Analytics",
    question: "How do I export analytics data?",
    answer: "Currently, you can view all analytics on the dashboard. Data export functionality (CSV/Excel) is planned for a future update. Contact support if you need specific reports.",
    tags: ["analytics", "export", "data"]
  },
  {
    id: "faq-013",
    category: "Search",
    question: "How does global search work?",
    answer: "Use the Search page or the search bar in the navigation to find anything across the system. You can search for jobs by title, candidates by name/skills, clients by company name, applications, and team members. Results are filtered based on your permissions.",
    tags: ["search", "find", "global"]
  },
  {
    id: "faq-014",
    category: "Notifications",
    question: "How do I manage notification preferences?",
    answer: "Go to Account > Notifications tab to customize which notifications you receive. You can enable/disable email notifications, application alerts, job alerts, weekly reports, candidate updates, and system updates.",
    tags: ["notifications", "alerts", "preferences"]
  },
  {
    id: "faq-015",
    category: "Security",
    question: "How do I change my password?",
    answer: "Go to Account > Security tab, enter your current password, then your new password twice to confirm. Passwords must be at least 8 characters long. You can also enable Two-Factor Authentication for additional security.",
    tags: ["password", "security", "account"]
  },
  {
    id: "faq-016",
    category: "Jobs",
    question: "How do I view and manage job pipelines?",
    answer: "Go to the Jobs page and click on any job to view its pipeline. You can see all candidates in different stages (Screening, Interview, Assessment, Offer, Hired, Rejected). Drag and drop candidates between stages to update their status in real-time.",
    tags: ["jobs", "pipeline", "kanban"]
  },
  {
    id: "faq-017",
    category: "Jobs",
    question: "Can I close or archive old jobs?",
    answer: "Yes! In the Jobs page, you can update a job's status to 'Closed' or 'On Hold'. Closed jobs won't accept new applications but you can still access historical data and candidate information.",
    tags: ["jobs", "close", "archive"]
  },
  {
    id: "faq-018",
    category: "Candidates",
    question: "How do I add tags to candidates?",
    answer: "Open a candidate's profile and click on the tags section. You can add existing tags or create new ones. Tags help organize and filter candidates by skills, experience level, or any custom criteria. Manage all tags from the Tags page in settings.",
    tags: ["candidates", "tags", "organize"]
  },
  {
    id: "faq-019",
    category: "Applications",
    question: "What happens when I approve an application?",
    answer: "When you approve an application, the candidate is automatically added to the Candidates database and linked to the job they applied for. They'll appear in the job's pipeline in the 'Screening' stage, ready for further evaluation.",
    tags: ["applications", "approve", "workflow"]
  },
  {
    id: "faq-020",
    category: "Applications",
    question: "Can I assign applications to specific team members?",
    answer: "Yes! In the Applications table, you can assign reviewers to specific applications. This helps distribute the workload and track who is responsible for reviewing each application.",
    tags: ["applications", "assign", "team"]
  },
  {
    id: "faq-021",
    category: "Team & Permissions",
    question: "How do I add a new team member?",
    answer: "Go to the Team page and click 'Add Member'. Enter their details including name, email, role, department, and job title. Set their permissions based on their role. You can also upload a profile photo or their initials will be used as a placeholder.",
    tags: ["team", "add", "members"]
  },
  {
    id: "faq-022",
    category: "Communication",
    question: "How do I send emails to candidates?",
    answer: "Open a candidate's profile and go to the Communication tab. You can send emails using pre-built templates or compose custom messages. All email history is tracked and logged for reference.",
    tags: ["email", "candidates", "communication"]
  },
  {
    id: "faq-023",
    category: "Analytics",
    question: "How can I identify bottlenecks in my recruitment process?",
    answer: "The Analytics page includes a Bottleneck Identification section that highlights issues like high pending applications, slow interview scheduling, or low approval rates. Each bottleneck comes with recommended actions to improve your process.",
    tags: ["analytics", "bottlenecks", "optimization"]
  },
  {
    id: "faq-024",
    category: "Notifications",
    question: "Can admins send notifications to all users?",
    answer: "Yes! Admins have access to an Admin Panel in the Notifications page where they can create and broadcast notifications to all users. This is useful for system announcements, policy updates, or important notices.",
    tags: ["notifications", "admin", "broadcast"]
  },
  {
    id: "faq-025",
    category: "Search",
    question: "What keyboard shortcuts are available?",
    answer: "Press Cmd+K (Mac) or Ctrl+K (Windows/Linux) to quickly focus the global search bar from anywhere in the application. Your recent searches are saved for quick access.",
    tags: ["search", "shortcuts", "keyboard"]
  },
  {
    id: "faq-026",
    category: "Jobs",
    question: "How do I edit job details after posting?",
    answer: "Go to the Jobs page, click on the job you want to edit, and click the 'Edit Job' button. You can modify the title, description, requirements, salary range, location, and other details. Changes are saved immediately.",
    tags: ["jobs", "edit", "update"]
  },
  {
    id: "faq-027",
    category: "Applications",
    question: "How do I filter applications by status or source?",
    answer: "On the Applications page, use the filter buttons at the top of the table to filter by status (Pending, Approved, Rejected) or use the search bar to find applications by name, email, or job title. You can also use the column filters for more specific searches.",
    tags: ["applications", "filter", "search"]
  },
  {
    id: "faq-028",
    category: "Getting Started",
    question: "What is the difference between Applications and Candidates?",
    answer: "Applications are initial submissions from job seekers that need to be reviewed. Once you approve an application, the person becomes a Candidate in your database and enters your recruitment pipeline. Candidates can be tracked across multiple jobs and stages.",
    tags: ["applications", "candidates", "difference"]
  },
  {
    id: "faq-029",
    category: "Clients",
    question: "How do I track client activity and performance?",
    answer: "Go to the Analytics page to view client-specific metrics including number of active jobs, total applications received, hired candidates, and average time-to-fill. You can also view client details to see all jobs and candidates associated with each client.",
    tags: ["clients", "analytics", "tracking"]
  },
  {
    id: "faq-030",
    category: "Communication",
    question: "How do I create and use email templates?",
    answer: "Go to Settings > Email Templates to create reusable templates. You can add variables like {candidateName}, {jobTitle}, {companyName} that will be automatically replaced when sending emails. Templates can be used for interview invitations, rejections, offers, and follow-ups.",
    tags: ["email", "templates", "variables"]
  }
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFAQs, setExpandedFAQs] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = ["all", ...Array.from(new Set(faqData.map(faq => faq.category)))];

  const filteredFAQs = faqData.filter(faq => {
    const matchesSearch = searchQuery === "" || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const toggleFAQ = (id: string) => {
    setExpandedFAQs(prev =>
      prev.includes(id) ? prev.filter(faqId => faqId !== id) : [...prev, id]
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
      case "Analytics":
        return <FileText className="h-4 w-4" />;
      case "Search":
        return <Search className="h-4 w-4" />;
      case "Notifications":
        return <Mail className="h-4 w-4" />;
      case "Security":
        return <Shield className="h-4 w-4" />;
      default:
        return <HelpCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-lg bg-primary/10 p-2">
                  <HelpCircle className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Help Center</h2>
                  <p className="text-muted-foreground">
                    Find answers to common questions and get support
                  </p>
                </div>
              </div>

              <div className="relative max-w-2xl mb-6">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search for help..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <BookOpen className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-lg">Documentation</CardTitle>
                  <CardDescription className="text-sm">
                    Comprehensive guides and user manuals
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <Video className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-lg">Video Tutorials</CardTitle>
                  <CardDescription className="text-sm">
                    Step-by-step video walkthroughs
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <Mail className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-lg">Contact Developer</CardTitle>
                  <CardDescription className="text-sm">
                    Reach out for technical support
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className="text-sm font-medium text-muted-foreground">Category:</span>
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="gap-2"
                >
                  {category !== "all" && getCategoryIcon(category)}
                  {category === "all" ? "All" : category}
                </Button>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>
                  {filteredFAQs.length} question{filteredFAQs.length !== 1 ? "s" : ""} found
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {filteredFAQs.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground">
                    <HelpCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No FAQs found matching your search</p>
                  </div>
                ) : (
                  filteredFAQs.map((faq, index) => (
                    <div key={faq.id}>
                      <div
                        className="p-4 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                        onClick={() => toggleFAQ(faq.id)}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {getCategoryIcon(faq.category)}
                              <Badge variant="secondary" className="text-xs">
                                {faq.category}
                              </Badge>
                            </div>
                            <h4 className="font-semibold text-foreground mb-2">
                              {faq.question}
                            </h4>
                            {expandedFAQs.includes(faq.id) && (
                              <>
                                <p className="text-sm text-muted-foreground mb-3">
                                  {faq.answer}
                                </p>
                                <div className="flex items-center gap-2 flex-wrap">
                                  {faq.tags.map(tag => (
                                    <Badge key={tag} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            {expandedFAQs.includes(faq.id) ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      {index < filteredFAQs.length - 1 && <Separator />}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="mt-6 border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-blue-900 mb-1">Need Technical Support?</p>
                    <p className="text-sm text-blue-700 mb-3">
                      Contact the developer for assistance, bug reports, or feature requests.
                    </p>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-blue-800">
                        <Mail className="h-4 w-4" />
                        <a href="mailto:mislam.tauhidul@gmail.com" className="hover:underline font-medium">
                          mislam.tauhidul@gmail.com
                        </a>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-blue-800">
                        <Mail className="h-4 w-4" />
                        <a href="mailto:mislam@aristagroups.com" className="hover:underline font-medium">
                          mislam@aristagroups.com
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => window.location.href = "mailto:mislam.tauhidul@gmail.com"}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Send Email
                      </Button>
                      <Button variant="outline" size="sm">
                        <BookOpen className="h-4 w-4 mr-2" />
                        View Documentation
                      </Button>
                      <Button variant="outline" size="sm">
                        <Video className="h-4 w-4 mr-2" />
                        Watch Tutorials
                      </Button>
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
