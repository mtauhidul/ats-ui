import { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Search,
  Briefcase,
  Users,
  UserCircle,
  FileText,
  Building,
  Clock,
  X,
  TrendingUp
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import jobsData from "@/lib/mock-data/jobs.json";
import candidatesData from "@/lib/mock-data/candidates.json";
import clientsData from "@/lib/mock-data/clients.json";
import applicationsData from "@/lib/mock-data/applications.json";
import teamData from "@/lib/mock-data/team.json";
import { hasPermission } from "@/lib/rbac";

type SearchResultType = "job" | "candidate" | "client" | "application" | "team";

interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle: string;
  description: string;
  avatar?: string;
  badges: string[];
  link: string;
  relevance: number;
}

// Simple fuzzy match scoring
const fuzzyMatch = (text: string | undefined | null, query: string): number => {
  if (!text || typeof text !== 'string') return 0;

  text = text.toLowerCase();
  query = query.toLowerCase();

  if (text === query) return 100;
  if (text.includes(query)) return 50;

  let score = 0;
  let queryIndex = 0;

  for (let i = 0; i < text.length && queryIndex < query.length; i++) {
    if (text[i] === query[queryIndex]) {
      score += 1;
      queryIndex++;
    }
  }

  return queryIndex === query.length ? score : 0;
};


export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | SearchResultType>("all");
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    const saved = localStorage.getItem("recentSearches");
    return saved ? JSON.parse(saved) : [];
  });
  const currentUser = teamData[0];

  // Add to recent searches
  useEffect(() => {
    if (searchQuery.trim() && searchQuery.length > 2) {
      const timer = setTimeout(() => {
        setRecentSearches(prev => {
          const updated = [searchQuery, ...prev.filter(q => q !== searchQuery)].slice(0, 5);
          localStorage.setItem("recentSearches", JSON.stringify(updated));
          return updated;
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [searchQuery]);

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('global-search-input')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    const results: SearchResult[] = [];

    if (hasPermission(currentUser, 'canManageJobs')) {
      jobsData.forEach((job: any) => {
        let relevance = 0;
        relevance += fuzzyMatch(job.title, query);
        relevance += fuzzyMatch(job.description || "", query) * 0.3;
        relevance += fuzzyMatch(job.type || "", query) * 0.5;
        relevance += fuzzyMatch(job.status || "", query) * 0.3;
        relevance += fuzzyMatch(job.experienceLevel || "", query) * 0.3;
        relevance += fuzzyMatch(job.location || "", query) * 0.4;

        const salaryStr = `${job.salaryMin}-${job.salaryMax}`;
        relevance += fuzzyMatch(salaryStr, query) * 0.2;

        if (relevance > 5) {
          const client = clientsData.find(c => c.id === job.clientId);
          results.push({
            id: job.id,
            type: "job",
            title: job.title,
            subtitle: `${client?.companyName || "Unknown Client"} • ${job.location || "Remote"}`,
            description: job.description || "No description available",
            badges: [job.type || "Full-time", job.status, job.experienceLevel, `$${job.salaryMin}-${job.salaryMax}`],
            link: `/dashboard/jobs/pipeline/${job.id}`,
            relevance
          });
        }
      });
    }

    if (hasPermission(currentUser, 'canManageCandidates')) {
      candidatesData.forEach(candidate => {
        let relevance = 0;
        const fullName = `${candidate.firstName} ${candidate.lastName}`;
        const location = candidate.address ? `${candidate.address.city}, ${candidate.address.country}` : "";

        relevance += fuzzyMatch(fullName, query) * 1.5;
        relevance += fuzzyMatch(candidate.email, query) * 1.2;
        relevance += fuzzyMatch(candidate.currentTitle || "", query);
        relevance += fuzzyMatch(location, query) * 0.4;

        candidate.skills?.forEach(skill => {
          relevance += fuzzyMatch(skill.name, query) * 0.3;
        });

        if (relevance > 5) {
          results.push({
            id: candidate.id,
            type: "candidate",
            title: fullName,
            subtitle: `${candidate.currentTitle || "Candidate"} • ${location || "No location"}`,
            description: `${candidate.email} • ${candidate.yearsOfExperience} years experience`,
            avatar: undefined,
            badges: candidate.skills?.slice(0, 3).map(s => s.name) || [],
            link: `/dashboard/candidates/${candidate.id}`,
            relevance
          });
        }
      });
    }

    if (hasPermission(currentUser, 'canManageClients')) {
      clientsData.forEach(client => {
        let relevance = 0;
        const location = client.address ? `${client.address.city}, ${client.address.country}` : "";

        relevance += fuzzyMatch(client.companyName, query) * 1.5;
        relevance += fuzzyMatch(client.industry, query);
        relevance += fuzzyMatch(client.email || "", query) * 0.8;
        relevance += fuzzyMatch(client.companySize, query) * 0.4;
        relevance += fuzzyMatch(client.status, query) * 0.3;
        relevance += fuzzyMatch(location, query) * 0.4;

        if (relevance > 5) {
          results.push({
            id: client.id,
            type: "client",
            title: client.companyName,
            subtitle: `${client.industry} • ${location || "No location"}`,
            description: `${client.email || ''} • ${client.companySize} • ${client.status}`,
            avatar: undefined,
            badges: [client.status, client.companySize],
            link: `/dashboard/clients`,
            relevance
          });
        }
      });
    }

    if (hasPermission(currentUser, 'canReviewApplications')) {
      applicationsData.forEach(app => {
        let relevance = 0;
        const fullName = `${app.firstName} ${app.lastName}`;
        relevance += fuzzyMatch(fullName, query) * 1.5;
        relevance += fuzzyMatch(app.email, query) * 1.2;
        relevance += fuzzyMatch(app.targetJobTitle || "", query);
        relevance += fuzzyMatch(app.status, query) * 0.5;
        relevance += fuzzyMatch(app.source, query) * 0.3;

        if (relevance > 5) {
          results.push({
            id: app.id,
            type: "application",
            title: fullName,
            subtitle: `${app.targetJobTitle || "Application"} • ${app.source}`,
            description: `${app.email} • Applied ${new Date(app.submittedAt).toLocaleDateString()} • ${app.status}`,
            avatar: undefined,
            badges: [app.status, app.source],
            link: `/dashboard/applications`,
            relevance
          });
        }
      });
    }

    if (hasPermission(currentUser, 'canManageTeam')) {
      teamData.forEach(member => {
        let relevance = 0;
        const fullName = `${member.firstName} ${member.lastName}`;
        relevance += fuzzyMatch(fullName, query) * 1.5;
        relevance += fuzzyMatch(member.email, query) * 1.2;
        relevance += fuzzyMatch(member.role, query);
        relevance += fuzzyMatch(member.title || "", query);
        relevance += fuzzyMatch(member.department, query) * 0.5;
        relevance += fuzzyMatch(member.status, query) * 0.3;

        if (relevance > 5) {
          results.push({
            id: member.id,
            type: "team",
            title: fullName,
            subtitle: `${member.title || member.role} • ${member.department}`,
            description: `${member.email} • ${member.status}`,
            avatar: undefined,
            badges: [member.role, member.status],
            link: `/dashboard/team`,
            relevance
          });
        }
      });
    }

    return results.sort((a, b) => b.relevance - a.relevance);
  }, [searchQuery, currentUser]);

  const filteredResults = filterType === "all" 
    ? searchResults 
    : searchResults.filter(r => r.type === filterType);

  const resultCounts = {
    all: searchResults.length,
    job: searchResults.filter(r => r.type === "job").length,
    candidate: searchResults.filter(r => r.type === "candidate").length,
    client: searchResults.filter(r => r.type === "client").length,
    application: searchResults.filter(r => r.type === "application").length,
    team: searchResults.filter(r => r.type === "team").length,
  };

  const getTypeIcon = (type: SearchResultType) => {
    switch (type) {
      case "job":
        return <Briefcase className="h-5 w-5 text-blue-600" />;
      case "candidate":
        return <UserCircle className="h-5 w-5 text-green-600" />;
      case "client":
        return <Building className="h-5 w-5 text-purple-600" />;
      case "application":
        return <FileText className="h-5 w-5 text-amber-600" />;
      case "team":
        return <Users className="h-5 w-5 text-indigo-600" />;
      default:
        return <Search className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTypeBadgeColor = (type: SearchResultType) => {
    switch (type) {
      case "job":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "candidate":
        return "bg-green-50 text-green-700 border-green-200";
      case "client":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "application":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "team":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-lg bg-blue-600/10 p-2">
                  <Search className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Global Search</h2>
                  <p className="text-muted-foreground">
                    Search across jobs, candidates, clients, applications, and team members
                  </p>
                </div>
              </div>

              <div className="relative max-w-3xl">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="global-search-input"
                  placeholder="Search for anything... (jobs, candidates, clients, applications, team)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-24 h-12 text-lg"
                  autoFocus
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                  <kbd className="hidden sm:inline-block px-2 py-1 text-xs font-semibold text-muted-foreground bg-muted border border-border rounded">
                    ⌘K
                  </kbd>
                </div>
              </div>

              {/* Recent Searches */}
              {!searchQuery && recentSearches.length > 0 && (
                <Card className="mt-4 max-w-3xl">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm font-medium">Recent Searches</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setRecentSearches([]);
                          localStorage.removeItem("recentSearches");
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((search, idx) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                          onClick={() => setSearchQuery(search)}
                        >
                          {search}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {searchQuery && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                  <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilterType("all")}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">All Results</p>
                          <p className="text-2xl font-bold">{resultCounts.all}</p>
                        </div>
                        <Search className="h-8 w-8 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilterType("job")}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Jobs</p>
                          <p className="text-2xl font-bold">{resultCounts.job}</p>
                        </div>
                        <Briefcase className="h-8 w-8 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilterType("candidate")}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Candidates</p>
                          <p className="text-2xl font-bold">{resultCounts.candidate}</p>
                        </div>
                        <UserCircle className="h-8 w-8 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilterType("client")}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Clients</p>
                          <p className="text-2xl font-bold">{resultCounts.client}</p>
                        </div>
                        <Building className="h-8 w-8 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilterType("application")}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Applications</p>
                          <p className="text-2xl font-bold">{resultCounts.application}</p>
                        </div>
                        <FileText className="h-8 w-8 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-3">
                  {filteredResults.length === 0 ? (
                    <Card>
                      <CardContent className="py-12">
                        <div className="text-center text-muted-foreground">
                          <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
                          <p className="text-lg font-medium mb-1">No results found</p>
                          <p className="text-sm">
                            Try searching with different keywords or check your filters
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    filteredResults.map((result) => (
                      <Link
                        to={result.link}
                        key={result.id}
                        state={{ highlightId: result.id, searchQuery }}
                      >
                        <Card className="hover:shadow-md transition-all cursor-pointer hover:border-primary/50">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                              {(result.type === "candidate" || result.type === "team") ? (
                                <Avatar className="h-12 w-12">
                                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                    {result.title.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                              ) : (
                                <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                                  {getTypeIcon(result.type)}
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold text-foreground">{result.title}</h4>
                                  <Badge
                                    variant="outline"
                                    className={`text-xs ${getTypeBadgeColor(result.type)}`}
                                  >
                                    {result.type}
                                  </Badge>
                                  <div className="flex items-center gap-1 ml-auto">
                                    <TrendingUp className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-xs text-muted-foreground">{Math.round(result.relevance)}% match</span>
                                  </div>
                                </div>
                                <p className="text-sm font-medium text-muted-foreground mb-2">
                                  {result.subtitle}
                                </p>
                                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                  {result.description}
                                </p>
                                <div className="flex items-center gap-2 flex-wrap">
                                  {result.badges.slice(0, 4).map((badge, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      {badge}
                                    </Badge>
                                  ))}
                                  {result.badges.length > 4 && (
                                    <Badge variant="secondary" className="text-xs">
                                      +{result.badges.length - 4} more
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))
                  )}
                </div>
              </>
            )}

            {!searchQuery && recentSearches.length === 0 && (
              <Card>
                <CardContent className="py-16">
                  <div className="text-center text-muted-foreground">
                    <Search className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">Start searching</p>
                    <p className="text-sm max-w-md mx-auto">
                      Type in the search box above to find jobs, candidates, clients, applications, or team members
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
