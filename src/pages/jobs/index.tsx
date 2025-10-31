import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Job } from "@/types/job";
import {
  Award,
  Briefcase,
  Building2,
  Calendar,
  Clock,
  DollarSign,
  Home,
  Laptop,
  MapPin,
  Search,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5001/api";

// Extended type to handle locationType field from API
type JobWithLocationType = Job & { locationType?: string };

// Helper function to normalize job data from backend (handle _id to id conversion)
const normalizeJob = (job: any): JobWithLocationType => {
  return {
    ...job,
    id: job.id || job._id, // Handle both id and _id fields
  };
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobWithLocationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [workModeFilter, setWorkModeFilter] = useState<string>("all");

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      // Public endpoint - no authentication needed
      const response = await fetch(`${API_BASE_URL}/jobs`);

      if (!response.ok) {
        console.error("Failed to fetch jobs:", response.status);
        setLoading(false);
        return;
      }

      const result = await response.json();
      const jobsData = result.data?.jobs || result.data || result;

      // Ensure jobsData is an array before filtering and normalizing
      if (Array.isArray(jobsData)) {
        const normalizedJobs = jobsData
          .filter((job: Job) => job.status === "open")
          .map(normalizeJob);
        setJobs(normalizedJobs);
      } else {
        console.error("Jobs data is not an array:", jobsData);
        setJobs([]);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setJobs([]);
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || job.type === typeFilter;
    const matchesWorkMode =
      workModeFilter === "all" || job.workMode === workModeFilter;

    return matchesSearch && matchesType && matchesWorkMode;
  });

  const formatSalary = (salary?: {
    min: number;
    max: number;
    currency: string;
    period?: string;
  }) => {
    if (!salary) return "Competitive";
    const format = (num: number) => new Intl.NumberFormat("en-US").format(num);
    const period = salary.period || "year";
    return `${salary.currency} ${format(salary.min)} - ${format(
      salary.max
    )} / ${period}`;
  };

  if (loading) {
    return (
      <div className="relative min-h-[calc(100vh-73px)] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 [--cell-border-color:hsl(var(--primary)/0.3)] [--cell-fill-color:hsl(var(--primary)/0.15)] [--cell-shadow-color:hsl(var(--primary)/0.4)]">
          <BackgroundRippleEffect rows={10} cols={30} cellSize={48} />
        </div>
        <div className="relative z-10 text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Loading opportunities...</p>
        </div>
      </div>
    );
  }

  const getWorkModeIcon = (mode: string) => {
    switch (mode?.toLowerCase()) {
      case "remote":
        return <Laptop className="h-4 w-4" />;
      case "onsite":
        return <Building2 className="h-4 w-4" />;
      case "hybrid":
        return <Home className="h-4 w-4" />;
      default:
        return <Briefcase className="h-4 w-4" />;
    }
  };

  const getExperienceIcon = (level: string) => {
    switch (level?.toLowerCase()) {
      case "entry":
      case "junior":
        return <TrendingUp className="h-4 w-4" />;
      case "senior":
      case "lead":
        return <Award className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-73px)] overflow-hidden">
      {/* Background Ripple Effect */}
      <div className="absolute inset-0 [--cell-border-color:hsl(var(--primary)/0.3)] [--cell-fill-color:hsl(var(--primary)/0.15)] [--cell-shadow-color:hsl(var(--primary)/0.4)]">
        <BackgroundRippleEffect rows={10} cols={30} cellSize={48} />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-12 md:px-8 lg:px-12">
        {/* Header */}
        <div className="max-w-6xl mx-auto mb-12">
          <div className="text-center space-y-4 mb-10">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              Find Your Next <span className="text-primary">Opportunity</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover amazing career opportunities from top companies
            </p>
          </div>

          {/* Filters */}
          <div className="bg-background/50 backdrop-blur-md rounded-lg border border-border/50 p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="md:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search jobs, skills, or keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Job Type Filter */}
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Job Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="full_time">Full Time</SelectItem>
                  <SelectItem value="part_time">Part Time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="freelance">Freelance</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                </SelectContent>
              </Select>

              {/* Work Mode Filter */}
              <Select value={workModeFilter} onValueChange={setWorkModeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Work Mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Modes</SelectItem>
                  <SelectItem value="remote">Remote</SelectItem>
                  <SelectItem value="onsite">On-site</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Job Count */}
        <div className="max-w-6xl mx-auto mb-6">
          <p className="text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-semibold text-foreground">
              {filteredJobs.length}
            </span>{" "}
            opportunities
          </p>
        </div>

        {/* Jobs List */}
        <div className="max-w-6xl mx-auto space-y-6">
          {filteredJobs.length === 0 ? (
            <div className="bg-background/50 backdrop-blur-md rounded-lg border border-border/50 p-12 text-center">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No jobs found
              </h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            filteredJobs.map((job) => (
              <div
                key={job.id}
                className="group bg-background/10 backdrop-blur-sm border border-border/30 rounded-xl hover:bg-background/20 hover:border-primary/50 transition-all duration-300 overflow-hidden"
              >
                {/* Color accent bar */}
                <div className="h-1 bg-gradient-to-r from-primary via-primary/70 to-primary/40" />

                <div className="p-6">
                  {/* Header Section */}
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-5">
                    <div className="flex-1 min-w-0">
                      <Link to={`/jobs/${job.id}`}>
                        <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors mb-2 line-clamp-1">
                          {job.title}
                        </h3>
                      </Link>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {job.description}
                      </p>
                    </div>
                    <Button asChild size="lg" className="shrink-0 lg:ml-4">
                      <Link to={`/jobs/${job.id}`}>
                        Apply Now
                        <TrendingUp className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>

                  {/* Info Grid with Icons */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-5">
                    {/* Location */}
                    {job.location?.city && job.location?.country && (
                      <div className="flex items-center gap-2">
                        <div className="rounded-lg bg-primary/10 p-2 group-hover:bg-primary/20 transition-colors">
                          <MapPin className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">
                            Location
                          </p>
                          <p className="text-sm font-medium truncate">
                            {job.location.city}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Job Type */}
                    {job.type && (
                      <div className="flex items-center gap-2">
                        <div className="rounded-lg bg-blue-500/10 p-2 group-hover:bg-blue-500/20 transition-colors">
                          <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">Type</p>
                          <p className="text-sm font-medium capitalize truncate">
                            {job.type.replace(/_/g, " ")}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Work Mode */}
                    {(job.workMode || job.locationType) && (
                      <div className="flex items-center gap-2">
                        <div className="rounded-lg bg-green-500/10 p-2 group-hover:bg-green-500/20 transition-colors">
                          {getWorkModeIcon(
                            job.workMode || job.locationType || ""
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">Mode</p>
                          <p className="text-sm font-medium capitalize truncate">
                            {(job.workMode || job.locationType)?.replace(
                              /_/g,
                              " "
                            )}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Experience Level */}
                    {job.experienceLevel && (
                      <div className="flex items-center gap-2">
                        <div className="rounded-lg bg-purple-500/10 p-2 group-hover:bg-purple-500/20 transition-colors">
                          {getExperienceIcon(job.experienceLevel)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">Level</p>
                          <p className="text-sm font-medium capitalize truncate">
                            {job.experienceLevel}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Salary */}
                    {job.salaryRange && (
                      <div className="flex items-center gap-2">
                        <div className="rounded-lg bg-amber-500/10 p-2 group-hover:bg-amber-500/20 transition-colors shrink-0">
                          <DollarSign className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-muted-foreground">
                            Salary
                          </p>
                          <p className="text-sm font-medium break-words">
                            {formatSalary(job.salaryRange)}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Openings */}
                    {job.openings && (
                      <div className="flex items-center gap-2">
                        <div className="rounded-lg bg-rose-500/10 p-2 group-hover:bg-rose-500/20 transition-colors">
                          <Users className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">
                            Openings
                          </p>
                          <p className="text-sm font-medium">{job.openings}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Skills & Tags Section */}
                  <div className="flex flex-wrap items-center gap-2 pt-4 border-t">
                    {job.requirements?.skills?.required
                      ?.slice(0, 5)
                      .map((skill) => (
                        <Badge
                          key={skill}
                          variant="secondary"
                          className="text-xs bg-secondary/50 hover:bg-secondary"
                        >
                          {skill}
                        </Badge>
                      ))}
                    {job.requirements?.skills?.required &&
                      job.requirements.skills.required.length > 5 && (
                        <Badge variant="outline" className="text-xs">
                          +{job.requirements.skills.required.length - 5} more
                          skills
                        </Badge>
                      )}
                    <div className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Posted recently</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
