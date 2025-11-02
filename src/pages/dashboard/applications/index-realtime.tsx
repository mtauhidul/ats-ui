import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/config/firebase";
import { DataTable } from "@/components/data-table";
import { Loader } from "@/components/ui/loader";
import type { Application } from "@/types/application";
import type { Job } from "@/types/job";
import type { Client } from "@/types/client";

/**
 * Applications Page - Real-Time Version
 * Uses Firestore subscriptions directly - no API calls, no caching
 * Data updates automatically when changes occur
 */
export default function ApplicationsPageRealtime() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("🔥 Setting up real-time subscriptions for applications page");

    // Subscribe to applications
    const unsubApplications = onSnapshot(
      query(collection(db, "applications"), orderBy("createdAt", "desc")),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Application[];
        console.log("🔥 Applications updated:", data.length);
        setApplications(data);
        setLoading(false);
      }
    );

    // Subscribe to jobs
    const unsubJobs = onSnapshot(
      query(collection(db, "jobs"), orderBy("createdAt", "desc")),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Job[];
        console.log("🔥 Jobs updated:", data.length);
        setJobs(data);
      }
    );

    // Subscribe to clients
    const unsubClients = onSnapshot(
      query(collection(db, "clients"), orderBy("createdAt", "desc")),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Client[];
        console.log("🔥 Clients updated:", data.length);
        setClients(data);
      }
    );

    // Cleanup all subscriptions on unmount
    return () => {
      console.log("🧹 Cleaning up applications page subscriptions");
      unsubApplications();
      unsubJobs();
      unsubClients();
    };
  }, []); // Empty deps - subscriptions run once

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Applications</h1>
          <p className="text-muted-foreground">
            Manage candidate applications ({applications.length} total)
          </p>
        </div>
      </div>

      <DataTable
        data={applications}
        jobs={jobs}
        clients={clients}
        type="applications"
      />
    </div>
  );
}
