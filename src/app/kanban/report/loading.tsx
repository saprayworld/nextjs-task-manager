import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingReportPage() {
  return (
    <div className="flex flex-col h-full container mx-auto p-4 md:p-6 lg:max-w-7xl animate-in fade-in zoom-in-95 duration-500 overflow-y-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <Skeleton className="h-9 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="flex items-center gap-2 bg-muted/50 px-4 py-2 rounded-lg border border-border/50">
          <Skeleton className="w-4 h-4 rounded" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="bg-card rounded-xl border border-border/50 shadow-sm p-6 flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="w-9 h-9 rounded-lg" />
            </div>
            <div className="flex flex-col justify-end">
              <Skeleton className="h-9 w-16 mb-2" />
              <Skeleton className="h-3 w-32" />
              {idx === 1 && (
                <Skeleton className="w-full h-1.5 mt-3 rounded-full" />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Task Time Detail List Skeleton */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-border/50 flex items-center justify-between bg-muted/10">
            <div className="w-full">
              <div className="flex items-center gap-2 mb-2">
                <Skeleton className="w-5 h-5 rounded" />
                <Skeleton className="h-6 w-64" />
              </div>
              <Skeleton className="h-4 w-80" />
            </div>
          </div>
          <div className="divide-y divide-border/50 flex-1 overflow-y-auto" style={{ maxHeight: '450px' }}>
            {Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="p-4 flex items-center justify-between">
                <div className="flex items-start gap-3 w-full">
                  <div className="mt-1">
                    <Skeleton className="w-5 h-5 rounded-full" />
                  </div>
                  <div className="w-full flex-1">
                    <Skeleton className="h-5 w-3/4 mb-1.5" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
                <div className="text-right pl-4">
                  <Skeleton className="h-8 w-20 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Visual Chart Placeholder Area Skeleton */}
        <div className="bg-card rounded-xl border border-border/50 shadow-sm p-6 flex flex-col">
          <Skeleton className="h-6 w-40 mx-auto mb-2" />
          <Skeleton className="h-4 w-48 mx-auto mb-6" />

          <div className="flex-1 flex flex-col items-center justify-center -mt-4">
            {/* Fake Donut Chart Skeleton */}
            <div className="relative flex items-center justify-center h-48 w-48">
              <Skeleton className="w-48 h-48 rounded-full" />
              <div className="absolute inset-4 bg-card rounded-full flex items-center justify-center">
                <div className="text-center w-full px-4 flex flex-col items-center gap-1">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-3 w-12 mt-1" />
                </div>
              </div>
            </div>

            <div className="w-full space-y-4 mt-8 px-2">
              <div className="flex items-center justify-between text-sm p-2.5 rounded-lg bg-muted/30 border border-border/50">
                <div className="flex items-center gap-2">
                  <Skeleton className="w-3 h-3 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>

              <div className="flex items-center justify-between text-sm p-2.5 rounded-lg bg-muted/30 border border-border/50">
                <div className="flex items-center gap-2">
                  <Skeleton className="w-3 h-3 rounded-full" />
                  <Skeleton className="h-4 w-28" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
