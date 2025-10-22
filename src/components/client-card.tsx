import { Building2, Mail, MapPin, Phone, TrendingUp, Users, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Client } from "@/types/client";
import { cn } from "@/lib/utils";

interface ClientCardProps {
  client: Client;
  onClick?: () => void;
}

const statusColors = {
  active: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  inactive: "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20",
  pending: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
  on_hold: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20",
} as const;

const industryColors = {
  technology: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  healthcare: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  finance: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
  education: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  retail: "bg-pink-500/10 text-pink-700 dark:text-pink-400 border-pink-500/20",
  manufacturing: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20",
  consulting: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/20",
  real_estate: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  hospitality: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20",
  other: "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20",
} as const;

export function ClientCard({ client, onClick }: ClientCardProps) {
  const primaryContact = client.contacts.find((c) => c.isPrimary);

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md hover:border-primary/30",
        "group"
      )}
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12 rounded-lg">
            <AvatarImage src={client.logo} alt={client.companyName} />
            <AvatarFallback className="rounded-lg">
              <Building2 className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg mb-1 line-clamp-1">
              {client.companyName}
            </CardTitle>
            <CardDescription className="line-clamp-2">
              {client.description || "No description available"}
            </CardDescription>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          <Badge variant="outline" className={statusColors[client.status]}>
            {client.status.replace("_", " ")}
          </Badge>
          <Badge variant="outline" className={industryColors[client.industry]}>
            {client.industry}
          </Badge>
          <Badge variant="outline">
            <Users className="h-3 w-3" />
            {client.companySize}
          </Badge>
        </div>

        <div className="grid grid-cols-1 gap-2 mt-4 text-sm text-muted-foreground">
          {primaryContact && (
            <>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" />
                <span className="truncate">{primaryContact.email}</span>
              </div>
              {primaryContact.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 shrink-0" />
                  <span className="truncate">{primaryContact.phone}</span>
                </div>
              )}
            </>
          )}
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="truncate">
              {client.address.city}, {client.address.country}
            </span>
          </div>
          {client.assignedToName && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 shrink-0" />
              <span className="truncate text-xs">
                <span className="text-muted-foreground/70">Managed by:</span> {client.assignedToName}
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Jobs</div>
            <div className="text-base font-semibold text-foreground">
              {client.statistics.totalJobs}
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5">
              {client.statistics.activeJobs}A / {client.statistics.closedJobs}C / {client.statistics.draftJobs}D
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Candidates</div>
            <div className="text-base font-semibold text-foreground">
              {client.statistics.totalCandidates}
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5">
              {client.statistics.activeCandidates} active
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Hired</div>
            <div className="text-base font-semibold text-green-600 dark:text-green-500">
              {client.statistics.hiredCandidates}
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5">
              {client.statistics.successRate}% rate
            </div>
          </div>
        </div>

        {client.statistics.successRate !== undefined && client.statistics.successRate > 0 && (
          <div className="flex items-center justify-between mt-3 pt-3 border-t text-xs">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5 text-green-600 dark:text-green-500" />
              <span>{client.statistics.successRate}% success</span>
            </div>
            {client.statistics.averageTimeToHire !== undefined && client.statistics.averageTimeToHire > 0 && (
              <div className="text-muted-foreground">
                ~{client.statistics.averageTimeToHire}d to hire
              </div>
            )}
          </div>
        )}
      </CardHeader>
    </Card>
  );
}
