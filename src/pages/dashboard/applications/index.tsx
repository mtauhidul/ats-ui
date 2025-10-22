import { DataTable } from "@/components/data-table";
import data from "../data.json";

export default function ApplicationsPage() {
  const transformedData = data.map((item) => ({
    ...item,
    target: Number(item.target),
    limit: Number(item.limit),
  }));

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">Applications</h2>
              <p className="text-muted-foreground">Track and manage job applications and their status</p>
            </div>
          </div>
          <DataTable data={transformedData} />
        </div>
      </div>
    </div>
  );
}