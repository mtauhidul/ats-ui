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
  {
    id: "faq-001",
    category: "Getting Started",
    question: "How do I add a new job posting?",
    answer:
      "Navigate to the Jobs page from the sidebar, click the 'Add Job' button, fill in the job details including title, description, requirements, and client information, then click 'Create Job'. The job will be published immediately.",
    tags: ["jobs", "posting", "create"],
  },
  {
    id: "faq-002",
    category: "Getting Started",
    question: "How do I review applications?",
    answer:
      "Go to the Applications page to see all pending applications. Click on any application to view the candidate's details, resume, and video introduction. Use the 'Approve' button to move them to the Candidates pipeline, or 'Reject' to decline the application.",
    tags: ["applications", "review", "approve"],
  },
  {
    id: "faq-003",
    category: "Candidates",
    question: "How do I track a candidate's interview history?",
    answer:
      "Open the candidate's profile from the Candidates page. Scroll to the 'Interview History' section to see all past interviews, their outcomes, ratings, and feedback. This helps prevent re-submitting candidates to the same clients.",
    tags: ["candidates", "interviews", "history"],
  },
  {
    id: "faq-004",
    category: "Candidates",
    question: "Can I move candidates between pipeline stages?",
    answer:
      "Yes! In the Job Pipeline view, you can drag and drop candidates between different stages (Screening, Interview, Assessment, Offer, etc.). This provides a visual Kanban-style workflow for managing the recruitment process.",
    tags: ["candidates", "pipeline", "stages"],
  },
  {
    id: "faq-005",
    category: "Clients",
    question: "How do I manage client information?",
    answer:
      "Go to the Clients page to view all clients. Click 'Add Client' to add new ones, or click on an existing client to view/edit details, add contacts, manage notes, and create jobs for that client.",
    tags: ["clients", "management", "contacts"],
  },
  {
    id: "faq-006",
    category: "Clients",
    question: "How do I add multiple contacts for a client?",
    answer:
      "Open the client's profile, go to the Contacts tab, and click 'Add Contact'. You can add multiple contacts and designate one as the primary contact. Each contact can have their own email, phone, and role information.",
    tags: ["clients", "contacts", "multiple"],
  },
  {
    id: "faq-007",
    category: "Team & Permissions",
    question: "What are the different user roles?",
    answer:
      "Admin: Full system access. Recruiter: Can manage clients, jobs, applications, and candidates. Hiring Manager: Can manage jobs and candidates, limited client access. Viewer: Read-only access to analytics and reports.",
    tags: ["roles", "permissions", "access"],
  },
  {
    id: "faq-008",
    category: "Team & Permissions",
    question: "How do I change user permissions?",
    answer:
      "Only Admins can modify user permissions. Go to the Team page, click on a team member, and edit their role or specific permissions. Changes take effect immediately.",
    tags: ["permissions", "roles", "team"],
  },
  {
    id: "faq-009",
    category: "Communication",
    question: "How do I send messages to team members?",
    answer:
      "Go to the Messages page to view all conversations. Click 'New Message' to start a conversation, select the recipient, add a subject and message, and optionally link it to a job, candidate, or client for context.",
    tags: ["messages", "communication", "team"],
  },
  {
    id: "faq-010",
    category: "Communication",
    question: "Can I use email templates?",
    answer:
      "Yes! Go to Settings > Email Templates to create and manage reusable templates for common emails like interview invitations, rejections, offers, and follow-ups. Templates support variables for personalization.",
    tags: ["email", "templates", "communication"],
  },
  {
    id: "faq-011",
    category: "Analytics",
    question: "What metrics can I track?",
    answer:
      "The Analytics page shows key metrics including total applications, approval rates, time-to-hire, applications over time, status distribution, top performing jobs, application sources, client activity, and recruitment funnel conversion.",
    tags: ["analytics", "metrics", "reports"],
  },
  {
    id: "faq-012",
    category: "Analytics",
    question: "How do I export analytics data?",
    answer:
      "Currently, you can view all analytics on the dashboard. Data export functionality (CSV/Excel) is planned for a future update. Contact support if you need specific reports.",
    tags: ["analytics", "export", "data"],
  },
  {
    id: "faq-013",
    category: "Search",
    question: "How does global search work?",
    answer:
      "Use the Search page or the search bar in the navigation to find anything across the system. You can search for jobs by title, candidates by name/skills, clients by company name, applications, and team members. Results are filtered based on your permissions.",
    tags: ["search", "find", "global"],
  },
  {
    id: "faq-014",
    category: "Notifications",
    question: "How do I manage notification preferences?",
    answer:
      "Go to Account > Notifications tab to customize which notifications you receive. You can enable/disable email notifications, application alerts, job alerts, weekly reports, candidate updates, and system updates.",
    tags: ["notifications", "alerts", "preferences"],
  },
  {
    id: "faq-015",
    category: "Security",
    question: "How do I change my password?",
    answer:
      "Go to Account > Security tab, enter your current password, then your new password twice to confirm. Passwords must be at least 8 characters long. You can also enable Two-Factor Authentication for additional security.",
    tags: ["password", "security", "account"],
  },
  {
    id: "faq-016",
    category: "Jobs",
    question: "How do I view and manage job pipelines?",
    answer:
      "Go to the Jobs page and click on any job to view its pipeline. You can see all candidates in different stages (Screening, Interview, Assessment, Offer, Hired, Rejected). Drag and drop candidates between stages to update their status in real-time.",
    tags: ["jobs", "pipeline", "kanban"],
  },
  {
    id: "faq-017",
    category: "Jobs",
    question: "Can I close or archive old jobs?",
    answer:
      "Yes! In the Jobs page, you can update a job's status to 'Closed' or 'On Hold'. Closed jobs won't accept new applications but you can still access historical data and candidate information.",
    tags: ["jobs", "close", "archive"],
  },
  {
    id: "faq-018",
    category: "Candidates",
    question: "How do I add tags to candidates?",
    answer:
      "Open a candidate's profile and click on the tags section. You can add existing tags or create new ones. Tags help organize and filter candidates by skills, experience level, or any custom criteria. Manage all tags from the Tags page in settings.",
    tags: ["candidates", "tags", "organize"],
  },
  {
    id: "faq-019",
    category: "Applications",
    question: "What happens when I approve an application?",
    answer:
      "When you approve an application, the candidate is automatically added to the Candidates database and linked to the job they applied for. They'll appear in the job's pipeline in the 'Screening' stage, ready for further evaluation.",
    tags: ["applications", "approve", "workflow"],
  },
  {
    id: "faq-020",
    category: "Applications",
    question: "Can I assign applications to specific team members?",
    answer:
      "Yes! In the Applications table, you can assign reviewers to specific applications. This helps distribute the workload and track who is responsible for reviewing each application.",
    tags: ["applications", "assign", "team"],
  },
  {
    id: "faq-021",
    category: "Team & Permissions",
    question: "How do I add a new team member?",
    answer:
      "Go to the Team page and click 'Add Member'. Enter their details including name, email, role, department, and job title. Set their permissions based on their role. You can also upload a profile photo or their initials will be used as a placeholder.",
    tags: ["team", "add", "members"],
  },
  {
    id: "faq-022",
    category: "Communication",
    question: "How do I send emails to candidates?",
    answer:
      "Open a candidate's profile and go to the Communication tab. You can send emails using pre-built templates or compose custom messages. All email history is tracked and logged for reference.",
    tags: ["email", "candidates", "communication"],
  },
  {
    id: "faq-023",
    category: "Analytics",
    question: "How can I identify bottlenecks in my recruitment process?",
    answer:
      "The Analytics page includes a Bottleneck Identification section that highlights issues like high pending applications, slow interview scheduling, or low approval rates. Each bottleneck comes with recommended actions to improve your process.",
    tags: ["analytics", "bottlenecks", "optimization"],
  },
  {
    id: "faq-024",
    category: "Notifications",
    question: "Can admins send notifications to all users?",
    answer:
      "Yes! Admins have access to an Admin Panel in the Notifications page where they can create and broadcast notifications to all users. This is useful for system announcements, policy updates, or important notices.",
    tags: ["notifications", "admin", "broadcast"],
  },
  {
    id: "faq-025",
    category: "Search",
    question: "What keyboard shortcuts are available?",
    answer:
      "Press Cmd+K (Mac) or Ctrl+K (Windows/Linux) to quickly focus the global search bar from anywhere in the application. Your recent searches are saved for quick access.",
    tags: ["search", "shortcuts", "keyboard"],
  },
  {
    id: "faq-026",
    category: "Jobs",
    question: "How do I edit job details after posting?",
    answer:
      "Go to the Jobs page, click on the job you want to edit, and click the 'Edit Job' button. You can modify the title, description, requirements, salary range, location, and other details. Changes are saved immediately.",
    tags: ["jobs", "edit", "update"],
  },
  {
    id: "faq-027",
    category: "Applications",
    question: "How do I filter applications by status or source?",
    answer:
      "On the Applications page, use the filter buttons at the top of the table to filter by status (Pending, Approved, Rejected) or use the search bar to find applications by name, email, or job title. You can also use the column filters for more specific searches.",
    tags: ["applications", "filter", "search"],
  },
  {
    id: "faq-028",
    category: "Getting Started",
    question: "What is the difference between Applications and Candidates?",
    answer:
      "Applications are initial submissions from job seekers that need to be reviewed. Once you approve an application, the person becomes a Candidate in your database and enters your recruitment pipeline. Candidates can be tracked across multiple jobs and stages.",
    tags: ["applications", "candidates", "difference"],
  },
  {
    id: "faq-029",
    category: "Clients",
    question: "How do I track client activity and performance?",
    answer:
      "Go to the Analytics page to view client-specific metrics including number of active jobs, total applications received, hired candidates, and average time-to-fill. You can also view client details to see all jobs and candidates associated with each client.",
    tags: ["clients", "analytics", "tracking"],
  },
  {
    id: "faq-030",
    category: "Communication",
    question: "How do I create and use email templates?",
    answer:
      "Go to Settings > Email Templates to create reusable templates. You can add variables like {candidateName}, {jobTitle}, {companyName} that will be automatically replaced when sending emails. Templates can be used for interview invitations, rejections, offers, and follow-ups.",
    tags: ["email", "templates", "variables"],
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
