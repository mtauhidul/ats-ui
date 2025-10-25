import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useJobs } from "@/store/hooks/useJobs";
import { useCandidates } from "@/store/hooks/useCandidates";
import { useApplications } from "@/store/hooks/useApplications";
import { useClients } from "@/store/hooks/useClients";
import type { Job } from "@/types/job";
import type { Candidate } from "@/types/candidate";
import type { Application } from "@/types/application";
import type { Client } from "@/types/client";

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
    c.jobApplications?.some((app) =>
      app.status !== "hired" && app.status !== "rejected" && app.status !== "withdrawn"
    )
  ).length;

  const pendingApplications = applications.filter((app: Application) => app.status === "pending").length;

  const activeClients = clients.filter((client: Client) => client.status === "active").length;
  const totalClients = clients.length;

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Open Positions</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {openJobs}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              {totalJobs} total
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Active job openings <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Positions waiting to be filled
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Active Candidates</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {activeCandidates}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              {totalCandidates} total
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            In recruitment pipeline <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Candidates under review
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Pending Applications</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {pendingApplications}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingDown />
              Needs review
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Awaiting approval <IconTrendingDown className="size-4" />
          </div>
          <div className="text-muted-foreground">Applications to review</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Active Clients</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {activeClients}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              {totalClients} total
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Engaged partnerships <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Companies hiring through us</div>
        </CardFooter>
      </Card>
    </div>
  );
}
