'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { DashboardLayout } from '@/components/DashboardLayout';
import { getAllReports, Report } from '@/lib/reports';
import { Skeleton } from '@/components/ui/skeleton';

// Dynamic import to avoid SSR issues with Leaflet
const ReportsMap = dynamic(
  () => import('@/components/ReportsMap').then((mod) => mod.ReportsMap),
  { 
    ssr: false,
    loading: () => <Skeleton className="h-[600px] w-full" />
  }
);

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadReports = async () => {
    setIsLoading(true);
    try {
      const data = await getAllReports();
      setReports(data);
    } catch (error) {
      console.error('Failed to load reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  return (
    <DashboardLayout role="admin">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">All Reports</h1>
          <p className="text-muted-foreground mt-1">
            View all reports with their locations on the map
          </p>
        </div>

        {isLoading ? (
          <Skeleton className="h-[600px] w-full" />
        ) : (
          <ReportsMap reports={reports} />
        )}
      </div>
    </DashboardLayout>
  );
}