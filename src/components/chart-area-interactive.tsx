"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardHeading,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useIsMobile } from "@/hooks/use-mobile";
import { authenticatedFetch } from "@/lib/authenticated-fetch";

export const description = "An interactive area chart for application tracking";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api";

interface ChartDataPoint {
  date: string;
  applications: number;
  directSubmissions: number;
  manualImports: number;
  emailApplications: number;
}

const chartConfig = {
  applications: {
    label: "Total Applications",
    color: "var(--chart-1)",
  },
  directSubmissions: {
    label: "Direct Submissions",
    color: "var(--chart-2)",
  },
  manualImports: {
    label: "Manual Imports",
    color: "var(--chart-5)",
  },
  emailApplications: {
    label: "Email Applications",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

export function ChartAreaInteractive() {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("90d");
  const [chartData, setChartData] = React.useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d");
    }
  }, [isMobile]);

  React.useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        const days = timeRange === "90d" ? 90 : timeRange === "30d" ? 30 : 7;
        const response = await authenticatedFetch(
          `${API_BASE_URL}/candidates/analytics/dashboard?days=${days}`
        );

        if (response.ok) {
          const result = await response.json();
          console.log("[Dashboard Analytics] Raw data:", result.data);
          // Ensure all fields have default values of 0
          const normalizedData = (result.data || []).map(
            (item: ChartDataPoint) => ({
              ...item,
              directSubmissions: item.directSubmissions || 0,
              manualImports: item.manualImports || 0,
              emailApplications: item.emailApplications || 0,
              applications: item.applications || 0,
            })
          );
          console.log("[Dashboard Analytics] Normalized data:", normalizedData);
          setChartData(normalizedData);
        } else {
          console.error(
            "[Dashboard Analytics] API error:",
            response.status,
            response.statusText
          );
        }
      } catch (error) {
        console.error(
          "[Dashboard Analytics] Failed to fetch analytics:",
          error
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange]);

  // Calculate summary statistics
  const totalApplications = chartData.reduce(
    (sum, item) => sum + item.applications,
    0
  );
  const totalDirect = chartData.reduce(
    (sum, item) => sum + item.directSubmissions,
    0
  );
  const totalManual = chartData.reduce(
    (sum, item) => sum + item.manualImports,
    0
  );
  const totalEmail = chartData.reduce(
    (sum, item) => sum + item.emailApplications,
    0
  );
  const avgPerDay =
    chartData.length > 0 ? Math.round(totalApplications / chartData.length) : 0;

  return (
    <Card className="@container/card">
      <CardHeader className="flex-row items-start justify-between gap-4">
        <CardHeading>
          <CardTitle>Applications Received</CardTitle>
          <CardDescription>
            <span className="hidden @[540px]/card:block">
              Track direct submissions and email applications
            </span>
            <span className="@[540px]/card:hidden">Application tracking</span>
          </CardDescription>
        </CardHeading>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:px-4! @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-[250px]">
            <p className="text-muted-foreground">Loading chart data...</p>
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center h-[250px]">
            <p className="text-muted-foreground">
              No data available for this period
            </p>
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <AreaChart data={chartData}>
              <defs>
                <linearGradient
                  id="fillDirectSubmissions"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="var(--color-directSubmissions)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-directSubmissions)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient
                  id="fillManualImports"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="var(--color-manualImports)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-manualImports)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient
                  id="fillEmailApplications"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="var(--color-emailApplications)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-emailApplications)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                }}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      return new Date(value as string).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                        }
                      );
                    }}
                    indicator="dot"
                  />
                }
              />
              <Area
                dataKey="emailApplications"
                type="natural"
                fill="url(#fillEmailApplications)"
                stroke="var(--color-emailApplications)"
                stackId="a"
              />
              <Area
                dataKey="manualImports"
                type="natural"
                fill="url(#fillManualImports)"
                stroke="var(--color-manualImports)"
                stackId="a"
              />
              <Area
                dataKey="directSubmissions"
                type="natural"
                fill="url(#fillDirectSubmissions)"
                stroke="var(--color-directSubmissions)"
                stackId="a"
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
      {!isLoading && chartData.length > 0 && (
        <CardFooter className="flex-col items-start gap-2 text-sm border-t-0 pt-0 pb-6">
          <div className="grid grid-cols-2 gap-4 w-full @[540px]/card:grid-cols-4">
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground text-xs font-medium">
                Total Applications
              </span>
              <span className="text-2xl font-bold text-foreground">
                {totalApplications}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground text-xs font-medium">
                Direct Submissions
              </span>
              <span
                className="text-2xl font-bold"
                style={{ color: "var(--chart-2)" }}
              >
                {totalDirect}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground text-xs font-medium">
                Manual Imports
              </span>
              <span
                className="text-2xl font-bold"
                style={{ color: "var(--chart-5)" }}
              >
                {totalManual}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground text-xs font-medium">
                Email Applications
              </span>
              <span
                className="text-2xl font-bold"
                style={{ color: "var(--chart-4)" }}
              >
                {totalEmail}
              </span>
            </div>
          </div>
          <div className="flex gap-3 font-medium leading-none text-xs text-muted-foreground mt-2 flex-wrap">
            <span className="inline-flex items-center gap-1">
              <span
                className="inline-block w-2 h-2 rounded-full"
                style={{ backgroundColor: "var(--chart-2)" }}
              ></span>
              Direct:{" "}
              {totalDirect > 0
                ? ((totalDirect / totalApplications) * 100).toFixed(0)
                : 0}
              %
            </span>
            <span className="inline-flex items-center gap-1">
              <span
                className="inline-block w-2 h-2 rounded-full"
                style={{ backgroundColor: "var(--chart-5)" }}
              ></span>
              Manual:{" "}
              {totalManual > 0
                ? ((totalManual / totalApplications) * 100).toFixed(0)
                : 0}
              %
            </span>
            <span className="inline-flex items-center gap-1">
              <span
                className="inline-block w-2 h-2 rounded-full"
                style={{ backgroundColor: "var(--chart-4)" }}
              ></span>
              Email:{" "}
              {totalEmail > 0
                ? ((totalEmail / totalApplications) * 100).toFixed(0)
                : 0}
              %
            </span>
            <span className="inline-flex items-center gap-1 ml-auto">
              <span className="font-semibold text-foreground">{avgPerDay}</span>{" "}
              avg/day
            </span>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
