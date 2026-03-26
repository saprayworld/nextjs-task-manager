import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function ProfileLoading() {
  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2.5">
          <Skeleton className="h-8 w-48 sm:w-64" />
          <Skeleton className="h-4 w-64 sm:w-[400px] text-muted-foreground" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-10 relative items-start">
        {/* Left Side: Navigation Skeleton */}
        <aside className="md:col-span-4 lg:col-span-3 space-y-6 md:sticky top-6">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-11 w-full rounded-md bg-muted/60" />
            <Skeleton className="h-11 w-full rounded-md bg-muted/40" />
            <Skeleton className="h-11 w-full rounded-md bg-muted/40" />
          </div>
          
          <Card className="border-border/40 shadow-sm hidden md:block border-dashed bg-transparent">
            <CardHeader className="pb-3">
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-3 w-full mb-2" />
              <Skeleton className="h-3 w-5/6 mb-2" />
              <Skeleton className="h-3 w-4/6" />
            </CardContent>
          </Card>
        </aside>

        {/* Right Side: Form Content Skeleton */}
        <div className="md:col-span-8 lg:col-span-9 space-y-6">
          <Card className="shadow-sm border-border/40 overflow-hidden bg-card/60">
            {/* Top decorative gradient placeholder */}
            <div className="h-1.5 w-full bg-muted animate-pulse"></div>
            
            <CardHeader className="pb-6 pt-8">
              <Skeleton className="h-7 w-48 mb-3" />
              <Skeleton className="h-4 w-64 sm:w-[350px]" />
            </CardHeader>

            <Separator className="bg-border/30" />

            <CardContent className="space-y-8 pt-8">
              
              {/* Profile Image Top Area Skeleton */}
              <div className="flex flex-col sm:flex-row items-center gap-6 p-5 rounded-2xl bg-muted/10 border border-muted/30">
                <Skeleton className="w-24 h-24 sm:w-28 sm:h-28 rounded-full shrink-0" />
                <div className="space-y-3 w-full text-center sm:text-left">
                  <Skeleton className="h-5 w-40 mx-auto sm:mx-0" />
                  <Skeleton className="h-3 w-full max-w-[280px] mx-auto sm:mx-0" />
                  <Skeleton className="h-3 w-full max-w-[220px] mx-auto sm:mx-0" />
                </div>
              </div>

              {/* Form Fields Skeleton */}
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-11 w-full rounded-lg" />
                </div>

                <div className="space-y-3">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-11 w-full rounded-lg" />
                </div>

                <div className="space-y-3 sm:col-span-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-11 w-full rounded-lg" />
                  <Skeleton className="h-3 w-64 mt-2" />
                </div>
              </div>

            </CardContent>

            {/* Footer Buttons Skeleton */}
            <div className="bg-muted/5 px-6 py-5 border-t border-border/30 flex items-center justify-end gap-3">
              <Skeleton className="h-10 w-24 rounded-lg bg-muted/50" />
              <Skeleton className="h-10 w-36 rounded-lg bg-primary/20" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
