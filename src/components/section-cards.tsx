import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardHeading,
  CardTitle,
  CardToolbar,
} from "@/components/ui/card";
import { useApplications } from "@/store/hooks/useApplications";
import { useCandidates } from "@/store/hooks/useCandidates";
import { useClients } from "@/store/hooks/useClients";
import { useJobs } from "@/store/hooks/useJobs";
import type { Application } from "@/types/application";
import type { Candidate } from "@/types/candidate";
import type { Client } from "@/types/client";
import type { Job } from "@/types/job";
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";

export function SectionCards() {
  const { jobs } = useJobs();
  const { candidates } = useCandidates();
  const { applications } = useApplications();
  const { clients } = useClients();

  // Calculate real statistics from Redux data
  const openJobs = jobs.filter((job: Job) => job.status === "open").length;
  const totalJobs = jobs.length;

  const totalCandidates = candidates.length;
  const activeCandidates = candidates.filter((c: Candidate) =>
    c.jobApplications?.some(
      (app) =>
        app.status !== "hired" &&
        app.status !== "rejected" &&
        app.status !== "withdrawn"
    )
  ).length;

  const pendingApplications = applications.filter(
    (app: Application) => app.status === "pending"
  ).length;

  const activeClients = clients.filter(
    (client: Client) => client.status === "active"
  ).length;
  const totalClients = clients.length;

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader className="flex-row items-start justify-between gap-4 border-b-0">
          <CardHeading>
            <CardDescription>Open Positions</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-green-600 dark:text-green-400">
              {openJobs}
            </CardTitle>
          </CardHeading>
          <CardToolbar>
            <Badge
              variant="outline"
              className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800"
            >
              <IconTrendingUp className="mr-1" />
              {totalJobs} total
            </Badge>
          </CardToolbar>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm pt-0 pb-4 border-t-0">
          <div className="line-clamp-1 flex gap-2 font-medium leading-none">
            Active job openings <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground leading-relaxed">
            Positions waiting to be filled
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader className="flex-row items-start justify-between gap-4 border-b-0">
          <CardHeading>
            <CardDescription>Active Candidates</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-blue-600 dark:text-blue-400">
              {activeCandidates}
            </CardTitle>
          </CardHeading>
          <CardToolbar>
            <Badge
              variant="outline"
              className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800"
            >
              <IconTrendingUp className="mr-1" />
              {totalCandidates} total
            </Badge>
          </CardToolbar>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm pt-0 pb-4 border-t-0">
          <div className="line-clamp-1 flex gap-2 font-medium leading-none">
            In recruitment pipeline <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground leading-relaxed">
            Candidates under review
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader className="flex-row items-start justify-between gap-4 border-b-0">
          <CardHeading>
            <CardDescription>Pending Applications</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-orange-600 dark:text-orange-400">
              {pendingApplications}
            </CardTitle>
          </CardHeading>
          <CardToolbar>
            <Badge
              variant="outline"
              className="bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-800"
            >
              <IconTrendingDown className="mr-1" />
              Needs review
            </Badge>
          </CardToolbar>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm pt-0 pb-4 border-t-0">
          <div className="line-clamp-1 flex gap-2 font-medium leading-none">
            Awaiting approval <IconTrendingDown className="size-4" />
          </div>
          <div className="text-muted-foreground leading-relaxed">
            Applications to review
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader className="flex-row items-start justify-between gap-4 border-b-0">
          <CardHeading>
            <CardDescription>Active Clients</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-purple-600 dark:text-purple-400">
              {activeClients}
            </CardTitle>
          </CardHeading>
          <CardToolbar>
            <Badge
              variant="outline"
              className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-800"
            >
              <IconTrendingUp className="mr-1" />
              {totalClients} total
            </Badge>
          </CardToolbar>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm pt-0 pb-4 border-t-0">
          <div className="line-clamp-1 flex gap-2 font-medium leading-none">
            Engaged partnerships <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground leading-relaxed">
            Companies hiring through us
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
