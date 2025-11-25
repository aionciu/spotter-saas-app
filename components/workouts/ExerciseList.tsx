"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, ChevronUp, ChevronDown, GripVertical } from "lucide-react";
import type { Exercise } from "@/lib/types/workout";

interface ExerciseListProps {
  exercises: Exercise[];
  onDelete?: (exerciseId: string) => void;
  onReorder?: (exerciseId: string, direction: "up" | "down") => void;
  showActions?: boolean;
}

/**
 * ExerciseList Component
 * 
 * Displays a list of exercises in a workout.
 * Shows exercise details (sets x reps @ weight) and allows editing/deletion.
 */
export function ExerciseList({
  exercises,
  onDelete,
  onReorder,
  showActions = true,
}: ExerciseListProps) {
  // Sort exercises by order_index
  const sortedExercises = [...exercises].sort(
    (a, b) => (a.order_index || 0) - (b.order_index || 0)
  );

  if (sortedExercises.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No exercises added yet. Add your first exercise to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sortedExercises.map((exercise, index) => {
        const canMoveUp = index > 0 && onReorder;
        const canMoveDown = index < sortedExercises.length - 1 && onReorder;

        return (
          <Card key={exercise.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {showActions && onReorder && (
                    <div className="flex flex-col gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => onReorder(exercise.id, "up")}
                        disabled={!canMoveUp}
                        aria-label="Move up"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => onReorder(exercise.id, "down")}
                        disabled={!canMoveDown}
                        aria-label="Move down"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold truncate">{exercise.exercise_name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {exercise.sets} set{exercise.sets !== 1 ? "s" : ""}
                      {exercise.reps && ` × ${exercise.reps} reps`}
                      {exercise.weight && ` @ ${exercise.weight}${exercise.weight % 1 === 0 ? "" : ".5"} kg`}
                    </p>
                  </div>
                </div>
                {showActions && onDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(exercise.id)}
                    aria-label="Delete exercise"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

