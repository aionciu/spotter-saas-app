import type { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "History | SPOTTER",
  description: "View workout history",
};

/**
 * History Page
 * 
 * Workout history placeholder. Will display past workouts and sessions.
 */
export default async function HistoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">History</h1>
        <p className="text-muted-foreground mt-2">
          View your workout history and completed sessions.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Workout History</CardTitle>
          <CardDescription>
            Your completed workouts will appear here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground">
              No workout history yet
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

