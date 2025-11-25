"use client";

import { useState } from "react";
import { createWorkoutSchema } from "@/lib/schemas/workout";
import type { CreateWorkoutInput, CreateExerciseInput, Exercise } from "@/lib/types/workout";
import { useCreateWorkout, useAddExercise } from "@/hooks/useWorkouts";
import { ExerciseForm } from "./ExerciseForm";
import { ExerciseList } from "./ExerciseList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Plus, Save } from "lucide-react";
import { Spinner } from "@/components/ui/loading-spinner";

interface WorkoutBuilderProps {
  clientId: string;
  onSuccess?: (workoutId: string) => void;
  onCancel?: () => void;
}

/**
 * WorkoutBuilder Component
 * 
 * Form for creating workout templates with exercises.
 * Allows adding, removing, and reordering exercises.
 */
export function WorkoutBuilder({ clientId, onSuccess, onCancel }: WorkoutBuilderProps) {
  const [workoutName, setWorkoutName] = useState("");
  const [exercises, setExercises] = useState<Omit<Exercise, "id" | "workout_id" | "created_at" | "order_index">[]>([]);
  const [showExerciseForm, setShowExerciseForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [workoutId, setWorkoutId] = useState<string | null>(null);

  const createWorkout = useCreateWorkout();
  const addExercise = useAddExercise();

  const handleAddExercise = (exerciseData: CreateExerciseInput) => {
    setExercises((prev) => [
      ...prev,
      {
        exercise_name: exerciseData.exercise_name,
        sets: exerciseData.sets,
        reps: exerciseData.reps ?? null,
        weight: exerciseData.weight ?? null,
      },
    ]);
    setShowExerciseForm(false);
  };

  const handleDeleteExercise = (index: number) => {
    setExercises((prev) => prev.filter((_, i) => i !== index));
  };

  const handleReorderExercise = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === exercises.length - 1)
    ) {
      return;
    }

    const newExercises = [...exercises];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    [newExercises[index], newExercises[targetIndex]] = [
      newExercises[targetIndex],
      newExercises[index],
    ];
    setExercises(newExercises);
  };

  const handleSaveWorkout = async () => {
    setError(null);

    // Validate workout name
    const workoutResult = createWorkoutSchema.safeParse({
      client_id: clientId,
      name: workoutName,
      status: "planned",
    });

    if (!workoutResult.success) {
      setError("Workout name is required");
      return;
    }

    if (exercises.length === 0) {
      setError("Please add at least one exercise to the workout");
      return;
    }

    try {
      // Create workout first
      const workoutResponse = await createWorkout.mutateAsync({
        clientId,
        data: {
          client_id: clientId,
          name: workoutName,
          status: "planned",
        },
      });

      const newWorkoutId = workoutResponse.workout.id;
      setWorkoutId(newWorkoutId);

      // Add all exercises
      for (let i = 0; i < exercises.length; i++) {
        const exercise = exercises[i];
        await addExercise.mutateAsync({
          workout_id: newWorkoutId,
          exercise_name: exercise.exercise_name,
          sets: exercise.sets,
          reps: exercise.reps ?? null,
          weight: exercise.weight ?? null,
          order_index: i,
        });
      }

      onSuccess?.(newWorkoutId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create workout";
      setError(errorMessage);
    }
  };

  const isSaving = createWorkout.isPending || addExercise.isPending;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Workout Details</CardTitle>
          <CardDescription>
            Create a new workout template for this client
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="workout_name" className="text-sm font-medium">
              Workout Name <span className="text-destructive">*</span>
            </label>
            <Input
              id="workout_name"
              value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
              placeholder="e.g., Upper Body Strength"
              disabled={isSaving}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Exercises</CardTitle>
              <CardDescription>
                {exercises.length} exercise{exercises.length !== 1 ? "s" : ""} added
              </CardDescription>
            </div>
            {!showExerciseForm && (
              <Button
                onClick={() => setShowExerciseForm(true)}
                disabled={isSaving}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Exercise
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {showExerciseForm && (
            <ExerciseForm
              onSubmit={(data) => {
                handleAddExercise(data);
              }}
              onCancel={() => setShowExerciseForm(false)}
            />
          )}

          <ExerciseList
            exercises={exercises.map((ex, index) => ({
              id: `temp-${index}`,
              workout_id: workoutId || "",
              exercise_name: ex.exercise_name,
              sets: ex.sets,
              reps: ex.reps,
              weight: ex.weight,
              order_index: index,
              created_at: null,
            }))}
            onDelete={(id) => {
              const index = parseInt(id.replace("temp-", ""));
              handleDeleteExercise(index);
            }}
            onReorder={(id, direction) => {
              const index = parseInt(id.replace("temp-", ""));
              handleReorderExercise(index, direction);
            }}
            showActions={!isSaving}
          />
        </CardContent>
      </Card>

      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isSaving}
          >
            Cancel
          </Button>
        )}
        <Button
          onClick={handleSaveWorkout}
          disabled={isSaving || !workoutName.trim() || exercises.length === 0}
        >
          {isSaving ? (
            <>
              <Spinner size="sm" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Workout
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

