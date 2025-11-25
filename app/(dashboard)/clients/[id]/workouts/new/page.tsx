"use client";

import { useParams, useRouter } from "next/navigation";
import { WorkoutBuilder } from "@/components/workouts/WorkoutBuilder";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

/**
 * New Workout Page
 * 
 * Page for creating a new workout for a client.
 * Uses WorkoutBuilder component.
 */
export default function NewWorkoutPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;

  const handleSuccess = (workoutId: string) => {
    // Navigate back to client detail page or to workout detail
    router.push(`/clients/${clientId}`);
  };

  const handleCancel = () => {
    router.push(`/clients/${clientId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCancel}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">New Workout</h1>
          <p className="text-muted-foreground mt-1">
            Create a workout template for this client
          </p>
        </div>
      </div>

      <WorkoutBuilder
        clientId={clientId}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
}

