"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
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

export const description = "An interactive area chart for application tracking";

// Generate realistic ATS data for last 90 days
const chartData = [
  { date: "2024-04-01", directSubmissions: 8, emailApplications: 12 },
  { date: "2024-04-02", directSubmissions: 5, emailApplications: 9 },
  { date: "2024-04-03", directSubmissions: 7, emailApplications: 8 },
  { date: "2024-04-04", directSubmissions: 10, emailApplications: 15 },
  { date: "2024-04-05", directSubmissions: 12, emailApplications: 18 },
  { date: "2024-04-06", directSubmissions: 9, emailApplications: 14 },
  { date: "2024-04-07", directSubmissions: 6, emailApplications: 10 },
  { date: "2024-04-08", directSubmissions: 11, emailApplications: 16 },
  { date: "2024-04-09", directSubmissions: 4, emailApplications: 7 },
  { date: "2024-04-10", directSubmissions: 8, emailApplications: 11 },
  { date: "2024-04-11", directSubmissions: 10, emailApplications: 17 },
  { date: "2024-04-12", directSubmissions: 9, emailApplications: 13 },
  { date: "2024-04-13", directSubmissions: 11, emailApplications: 19 },
  { date: "2024-04-14", directSubmissions: 6, emailApplications: 12 },
  { date: "2024-04-15", directSubmissions: 5, emailApplications: 9 },
  { date: "2024-04-16", directSubmissions: 7, emailApplications: 10 },
  { date: "2024-04-17", directSubmissions: 13, emailApplications: 20 },
  { date: "2024-04-18", directSubmissions: 12, emailApplications: 18 },
  { date: "2024-04-19", directSubmissions: 8, emailApplications: 11 },
  { date: "2024-04-20", directSubmissions: 4, emailApplications: 8 },
  { date: "2024-04-21", directSubmissions: 6, emailApplications: 10 },
  { date: "2024-04-22", directSubmissions: 9, emailApplications: 11 },
  { date: "2024-04-23", directSubmissions: 7, emailApplications: 13 },
  { date: "2024-04-24", directSubmissions: 11, emailApplications: 16 },
  { date: "2024-04-25", directSubmissions: 8, emailApplications: 14 },
  { date: "2024-04-26", directSubmissions: 3, emailApplications: 7 },
  { date: "2024-04-27", directSubmissions: 12, emailApplications: 19 },
  { date: "2024-04-28", directSubmissions: 5, emailApplications: 9 },
  { date: "2024-04-29", directSubmissions: 10, emailApplications: 15 },
  { date: "2024-04-30", directSubmissions: 13, emailApplications: 21 },
  { date: "2024-05-01", directSubmissions: 7, emailApplications: 12 },
  { date: "2024-05-02", directSubmissions: 9, emailApplications: 16 },
  { date: "2024-05-03", directSubmissions: 8, emailApplications: 11 },
  { date: "2024-05-04", directSubmissions: 12, emailApplications: 19 },
  { date: "2024-05-05", directSubmissions: 14, emailApplications: 22 },
  { date: "2024-05-06", directSubmissions: 15, emailApplications: 24 },
  { date: "2024-05-07", directSubmissions: 11, emailApplications: 17 },
  { date: "2024-05-08", directSubmissions: 6, emailApplications: 10 },
  { date: "2024-05-09", directSubmissions: 8, emailApplications: 11 },
  { date: "2024-05-10", directSubmissions: 10, emailApplications: 18 },
  { date: "2024-05-11", directSubmissions: 11, emailApplications: 16 },
  { date: "2024-05-12", directSubmissions: 7, emailApplications: 13 },
  { date: "2024-05-13", directSubmissions: 6, emailApplications: 9 },
  { date: "2024-05-14", directSubmissions: 13, emailApplications: 23 },
  { date: "2024-05-15", directSubmissions: 14, emailApplications: 20 },
  { date: "2024-05-16", directSubmissions: 10, emailApplications: 19 },
  { date: "2024-05-17", directSubmissions: 15, emailApplications: 24 },
  { date: "2024-05-18", directSubmissions: 9, emailApplications: 17 },
  { date: "2024-05-19", directSubmissions: 8, emailApplications: 11 },
  { date: "2024-05-20", directSubmissions: 6, emailApplications: 12 },
  { date: "2024-05-21", directSubmissions: 4, emailApplications: 8 },
  { date: "2024-05-22", directSubmissions: 3, emailApplications: 7 },
  { date: "2024-05-23", directSubmissions: 9, emailApplications: 15 },
  { date: "2024-05-24", directSubmissions: 10, emailApplications: 13 },
  { date: "2024-05-25", directSubmissions: 7, emailApplications: 14 },
  { date: "2024-05-26", directSubmissions: 8, emailApplications: 10 },
  { date: "2024-05-27", directSubmissions: 12, emailApplications: 21 },
  { date: "2024-05-28", directSubmissions: 8, emailApplications: 11 },
  { date: "2024-05-29", directSubmissions: 3, emailApplications: 7 },
  { date: "2024-05-30", directSubmissions: 11, emailApplications: 16 },
  { date: "2024-05-31", directSubmissions: 6, emailApplications: 12 },
  { date: "2024-06-01", directSubmissions: 7, emailApplications: 11 },
  { date: "2024-06-02", directSubmissions: 14, emailApplications: 19 },
  { date: "2024-06-03", directSubmissions: 5, emailApplications: 9 },
  { date: "2024-06-04", directSubmissions: 13, emailApplications: 18 },
  { date: "2024-06-05", directSubmissions: 4, emailApplications: 8 },
  { date: "2024-06-06", directSubmissions: 9, emailApplications: 14 },
  { date: "2024-06-07", directSubmissions: 10, emailApplications: 17 },
  { date: "2024-06-08", directSubmissions: 12, emailApplications: 16 },
  { date: "2024-06-09", directSubmissions: 13, emailApplications: 22 },
  { date: "2024-06-10", directSubmissions: 6, emailApplications: 11 },
  { date: "2024-06-11", directSubmissions: 4, emailApplications: 8 },
  { date: "2024-06-12", directSubmissions: 15, emailApplications: 20 },
  { date: "2024-06-13", directSubmissions: 3, emailApplications: 7 },
  { date: "2024-06-14", directSubmissions: 13, emailApplications: 18 },
  { date: "2024-06-15", directSubmissions: 10, emailApplications: 17 },
  { date: "2024-06-16", directSubmissions: 11, emailApplications: 16 },
  { date: "2024-06-17", directSubmissions: 14, emailApplications: 24 },
  { date: "2024-06-18", directSubmissions: 5, emailApplications: 9 },
  { date: "2024-06-19", directSubmissions: 11, emailApplications: 15 },
  { date: "2024-06-20", directSubmissions: 12, emailApplications: 21 },
  { date: "2024-06-21", directSubmissions: 6, emailApplications: 11 },
  { date: "2024-06-22", directSubmissions: 10, emailApplications: 14 },
  { date: "2024-06-23", directSubmissions: 14, emailApplications: 25 },
  { date: "2024-06-24", directSubmissions: 5, emailApplications: 10 },
  { date: "2024-06-25", directSubmissions: 6, emailApplications: 11 },
  { date: "2024-06-26", directSubmissions: 13, emailApplications: 18 },
  { date: "2024-06-27", directSubmissions: 13, emailApplications: 23 },
  { date: "2024-06-28", directSubmissions: 6, emailApplications: 11 },
  { date: "2024-06-29", directSubmissions: 4, emailApplications: 9 },
  { date: "2024-06-30", directSubmissions: 13, emailApplications: 19 },
];

const chartConfig = {
  applications: {
    label: "Applications",
  },
  directSubmissions: {
    label: "Direct Submissions",
    color: "var(--primary)",
  },
  emailApplications: {
    label: "Email Applications",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

export function ChartAreaInteractive() {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("90d");

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d");
    }
  }, [isMobile]);

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date);
    const referenceDate = new Date("2024-06-30");
    let daysToSubtract = 90;
    if (timeRange === "30d") {
      daysToSubtract = 30;
    } else if (timeRange === "7d") {
      daysToSubtract = 7;
    }
    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    return date >= startDate;
  });

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Applications Received</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Track direct submissions and email applications
          </span>
          <span className="@[540px]/card:hidden">Application tracking</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
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
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillDirectSubmissions" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-directSubmissions)"
                  stopOpacity={1.0}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-directSubmissions)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillEmailApplications" x1="0" y1="0" x2="0" y2="1">
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
              dataKey="directSubmissions"
              type="natural"
              fill="url(#fillDirectSubmissions)"
              stroke="var(--color-directSubmissions)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
