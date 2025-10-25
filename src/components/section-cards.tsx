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
import jobsData from "@/lib/mock-data/jobs.json";
import candidatesData from "@/lib/mock-data/candidates.json";
import applicationsData from "@/lib/mock-data/applications.json";
import clientsData from "@/lib/mock-data/clients.json";

export function SectionCards() {
  // Calculate real statistics from mock data
  const openJobs = jobsData.filter((job: any) => job.status === "open").length;
  const totalJobs = jobsData.length;

  const totalCandidates = candidatesData.length;
  const activeCandidates = candidatesData.filter((c: any) =>
    c.jobApplications?.some((app: any) =>
      app.status !== "hired" && app.status !== "rejected" && app.status !== "withdrawn"
    )
  ).length;

  const pendingApplications = applicationsData.filter((app: any) => app.status === "pending").length;
  const totalApplications = applicationsData.length;

  const activeClients = clientsData.filter((client: any) => client.status === "active").length;
  const totalClients = clientsData.length;

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
