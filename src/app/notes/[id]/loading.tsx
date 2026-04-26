import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-12">
      <header className="mb-6">
        <Skeleton className="h-4 w-20" />
      </header>
      <div className="flex flex-col gap-10">
        <article className="flex flex-col gap-6">
          <Skeleton className="h-8 w-2/3" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/5" />
          </div>
          <div className="flex gap-3 border-t border-border pt-4">
            <Skeleton className="h-8 w-44" />
            <Skeleton className="h-8 w-28" />
          </div>
        </article>

        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-20" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              <Skeleton className="h-8 max-w-[60%] self-end rounded-2xl" />
              <Skeleton className="h-12 max-w-[80%] self-start rounded-2xl" />
              <Skeleton className="h-8 max-w-[40%] self-end rounded-2xl" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
