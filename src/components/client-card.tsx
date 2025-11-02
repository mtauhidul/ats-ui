import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Client } from "@/types/client";
import {
  BadgeCheck,
  Building2,
  Mail,
  MapPin,
  Phone,
  TrendingUp,
  User,
  Users,
} from "lucide-react";

interface ClientCardProps {
  client: Client;
  onClick?: () => void;
}

const statusColors = {
  active:
    "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  inactive:
    "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20",
  pending:
    "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
  on_hold:
    "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20",
} as const;

export function ClientCard({ client, onClick }: ClientCardProps) {
  const primaryContact = (() => {
    type Contact = { isPrimary?: boolean; email?: string; phone?: string };
    const contacts = client.contacts ?? [];
    if (Array.isArray(contacts))
      return (contacts as Contact[]).find((c) => c?.isPrimary);
    if (contacts && typeof contacts === "object")
      return Object.values(contacts as Record<string, Contact>).find(
        (c) => c?.isPrimary
      );
    return undefined;
  })();

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md hover:border-primary/30",
        "max-w-md"
      )}
      onClick={onClick}
    >
      <CardHeader className="flex-row items-center gap-3 space-y-0">
        <Avatar className="ring-ring ring-2 h-12 w-12 rounded-lg">
          <AvatarImage src={client.logo} alt={client.companyName} />
          <AvatarFallback className="rounded-lg">
            <Building2 className="h-6 w-6" />
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-0.5">
          <CardTitle className="flex items-center gap-1 text-sm">
            {client.companyName}
            {client.status === "active" && (
              <BadgeCheck className="size-4 fill-sky-600 stroke-white dark:fill-sky-400" />
            )}
          </CardTitle>
          <CardDescription className="line-clamp-1 capitalize">
            {client.industry ? client.industry.replace("_", " ") : "N/A"}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 text-sm">
        <div className="flex flex-wrap gap-2">
          {client.status && (
            <Badge variant="outline" className={statusColors[client.status]}>
              {client.status.replace("_", " ")}
            </Badge>
          )}
          {client.companySize && (
            <Badge variant="outline">
              <Users className="h-3 w-3 mr-1" />
              {client.companySize}
            </Badge>
          )}
        </div>

        {client.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {client.description}
          </p>
        )}

        <div className="space-y-2">
          {primaryContact && (
            <>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4 shrink-0" />
                <span className="truncate text-xs">{primaryContact.email}</span>
              </div>
              {primaryContact.phone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4 shrink-0" />
                  <span className="truncate text-xs">
                    {primaryContact.phone}
                  </span>
                </div>
              )}
            </>
          )}
          {client.address && (client.address.city || client.address.country) && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0" />
              <span className="truncate text-xs">
                {[client.address.city, client.address.country].filter(Boolean).join(", ")}
              </span>
            </div>
          )}
          {client.assignedToName && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-4 w-4 shrink-0" />
              <span className="truncate text-xs">{client.assignedToName}</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between pt-4 pb-4 border-t">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex flex-col">
            <span className="text-base font-semibold">
              {client.statistics?.totalJobs || 0}
            </span>
            <span className="text-xs text-muted-foreground">Jobs</span>
          </div>
          <div className="flex flex-col">
            <span className="text-base font-semibold">
              {client.statistics?.totalCandidates || 0}
            </span>
            <span className="text-xs text-muted-foreground">Candidates</span>
          </div>
          <div className="flex flex-col">
            <span className="text-base font-semibold text-green-600 dark:text-green-500">
              {client.statistics?.hiredCandidates || 0}
            </span>
            <span className="text-xs text-muted-foreground">Hired</span>
          </div>
        </div>
        {client.statistics?.successRate !== undefined &&
          client.statistics.successRate > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5 text-green-600 dark:text-green-500" />
              <span>{client.statistics.successRate}%</span>
            </div>
          )}
      </CardFooter>
    </Card>
  );
}
