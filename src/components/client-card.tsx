import { Building2, Mail, MapPin, Phone, TrendingUp, Users, User, BadgeCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
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

export function ClientCard({ client, onClick }: ClientCardProps) {
  const primaryContact = client.contacts.find((c) => c.isPrimary);

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md hover:border-primary/30",
        "max-w-md"
      )}
      onClick={onClick}
    >
      <CardHeader className="px-5! py-4!">
        <div className="flex items-center gap-3 w-full">
          <Avatar className="ring-ring ring-2 h-12 w-12 rounded-lg">
            <AvatarImage src={client.logo} alt={client.companyName} />
            <AvatarFallback className="rounded-lg">
              <Building2 className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-0.5 flex-1 min-w-0">
            <CardTitle className="flex items-center gap-1 text-sm">
              {client.companyName}
              {client.status === 'active' && (
                <BadgeCheck className="size-4 fill-sky-600 stroke-white dark:fill-sky-400" />
              )}
            </CardTitle>
            <CardDescription className="line-clamp-1 capitalize">
              {client.industry.replace("_", " ")}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 text-sm px-5! py-4!">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className={statusColors[client.status]}>
            {client.status.replace("_", " ")}
          </Badge>
          <Badge variant="outline">
            <Users className="h-3 w-3 mr-1" />
            {client.companySize}
          </Badge>
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
                  <span className="truncate text-xs">{primaryContact.phone}</span>
                </div>
              )}
            </>
          )}
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="truncate text-xs">
              {client.address.city}, {client.address.country}
            </span>
          </div>
          {client.assignedToName && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-4 w-4 shrink-0" />
              <span className="truncate text-xs">
                {client.assignedToName}
              </span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between pt-4 border-t px-5! pb-4!">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex flex-col">
            <span className="text-base font-semibold">{client.statistics.totalJobs}</span>
            <span className="text-xs text-muted-foreground">Jobs</span>
          </div>
          <div className="flex flex-col">
            <span className="text-base font-semibold">{client.statistics.totalCandidates}</span>
            <span className="text-xs text-muted-foreground">Candidates</span>
          </div>
          <div className="flex flex-col">
            <span className="text-base font-semibold text-green-600 dark:text-green-500">
              {client.statistics.hiredCandidates}
            </span>
            <span className="text-xs text-muted-foreground">Hired</span>
          </div>
        </div>
        {client.statistics.successRate !== undefined && client.statistics.successRate > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <TrendingUp className="h-3.5 w-3.5 text-green-600 dark:text-green-500" />
            <span>{client.statistics.successRate}%</span>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
