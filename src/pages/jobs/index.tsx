import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
  Search,
  MapPin,
  Briefcase,
  DollarSign,
  Clock,
  Building2,
} from "lucide-react";
import type { Job } from "@/types/job";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

// Extended type to handle locationType field from API
type JobWithLocationType = Job & { locationType?: string };

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
        console.error('Failed to fetch jobs:', response.status);
        setLoading(false);
        return;
      }
      
      const result = await response.json();
      const jobsData = result.data?.jobs || result.data || result;
      
      // Ensure jobsData is an array before filtering
      if (Array.isArray(jobsData)) {
        setJobs(jobsData.filter((job: Job) => job.status === "open"));
      } else {
        console.error('Jobs data is not an array:', jobsData);
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

  const formatSalary = (salary?: { min: number; max: number; currency: string; period?: string }) => {
    if (!salary) return "Competitive";
    const format = (num: number) => new Intl.NumberFormat("en-US").format(num);
    const period = salary.period || "year";
    return `${salary.currency} ${format(salary.min)} - ${format(salary.max)} / ${period}`;
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-73px)] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Loading opportunities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-73px)] bg-gradient-to-br from-background via-background to-accent/5">
      <div className="container mx-auto px-6 py-12 md:px-8 lg:px-12">
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
          <Card className="border-border/50 shadow-lg">
            <CardContent className="p-6">
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
            </CardContent>
          </Card>
        </div>

        {/* Job Count */}
        <div className="max-w-6xl mx-auto mb-6">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{filteredJobs.length}</span> opportunities
          </p>
        </div>

        {/* Jobs List */}
        <div className="max-w-6xl mx-auto space-y-4">
          {filteredJobs.length === 0 ? (
            <Card className="border-border/50">
              <CardContent className="p-12 text-center">
                <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No jobs found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filters</p>
              </CardContent>
            </Card>
          ) : (
            filteredJobs.map((job) => (
              <Card
                key={job.id}
                className="border bg-card shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4">
                    {/* Header Section */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <Link to={`/jobs/${job.id}`}>
                          <h3 className="text-lg font-semibold text-foreground hover:text-primary transition-colors mb-1">
                            {job.title}
                          </h3>
                        </Link>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {job.description}
                        </p>
                      </div>
                      <Button asChild size="sm" className="shrink-0">
                        <Link to={`/jobs/${job.id}`}>Apply Now</Link>
                      </Button>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {job.location?.city && job.location?.country && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="rounded-md bg-muted p-1.5">
                            <MapPin className="h-3.5 w-3.5" />
                          </div>
                          <span className="truncate">{job.location.city}, {job.location.country}</span>
                        </div>
                      )}
                      
                      {job.type && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="rounded-md bg-muted p-1.5">
                            <Clock className="h-3.5 w-3.5" />
                          </div>
                          <span className="capitalize truncate">{job.type.replace(/_/g, " ")}</span>
                        </div>
                      )}
                      
                      {(job.workMode || job.locationType) && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="rounded-md bg-muted p-1.5">
                            <Briefcase className="h-3.5 w-3.5" />
                          </div>
                          <span className="capitalize truncate">{(job.workMode || job.locationType)?.replace(/_/g, " ")}</span>
                        </div>
                      )}
                      
                      {job.salaryRange && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="rounded-md bg-muted p-1.5">
                            <DollarSign className="h-3.5 w-3.5" />
                          </div>
                          <span className="truncate">{formatSalary(job.salaryRange)}</span>
                        </div>
                      )}
                    </div>

                    {/* Tags Section */}
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
                      {job.experienceLevel && (
                        <Badge variant="secondary" className="text-xs">
                          {job.experienceLevel}
                        </Badge>
                      )}
                      {job.requirements?.skills?.required?.slice(0, 3).map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {job.requirements?.skills?.required && job.requirements.skills.required.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{job.requirements.skills.required.length - 3} more
                        </Badge>
                      )}
                      {job.openings && (
                        <span className="ml-auto text-xs text-muted-foreground">
                          {job.openings} {job.openings === 1 ? 'opening' : 'openings'}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}