"use client";

import { useState } from "react";
import { createExerciseSchema } from "@/lib/schemas/workout";
import type { CreateExerciseInput } from "@/lib/types/workout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, X } from "lucide-react";

interface ExerciseFormProps {
  onSubmit: (data: CreateExerciseInput) => void;
  onCancel?: () => void;
  initialData?: Partial<CreateExerciseInput>;
}

/**
 * ExerciseForm Component
 * 
 * Form for adding or editing an exercise.
 * Fields: Exercise name, Sets, Reps (optional), Weight (optional)
 */
export function ExerciseForm({ onSubmit, onCancel, initialData }: ExerciseFormProps) {
  const [formData, setFormData] = useState<Omit<CreateExerciseInput, "workout_id" | "order_index">>({
    exercise_name: initialData?.exercise_name || "",
    sets: initialData?.sets || 1,
    reps: initialData?.reps ?? null,
    weight: initialData?.weight ?? null,
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "sets" || name === "reps" || name === "weight"
          ? value === "" ? (name === "sets" ? 1 : null) : parseFloat(value) || 0
          : value,
    }));
    // Clear field error when user types
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    // Validate form data (excluding workout_id and order_index which are added by parent)
    // Check required fields manually
    if (!formData.exercise_name.trim()) {
      setFieldErrors({ exercise_name: "Exercise name is required" });
      return;
    }

    if (!formData.sets || formData.sets < 1) {
      setFieldErrors({ sets: "Sets must be at least 1" });
      return;
    }

    // Validate reps if provided
    if (formData.reps !== null && formData.reps !== undefined && formData.reps < 1) {
      setFieldErrors({ reps: "Reps must be at least 1 if provided" });
      return;
    }

    // Validate weight if provided
    if (formData.weight !== null && formData.weight !== undefined && formData.weight <= 0) {
      setFieldErrors({ weight: "Weight must be greater than 0 if provided" });
      return;
    }

    // Submit with data (workout_id and order_index will be set by parent)
    onSubmit({
      workout_id: "", // Will be set by parent
      order_index: 0, // Will be set by parent
      exercise_name: formData.exercise_name.trim(),
      sets: formData.sets,
      reps: formData.reps,
      weight: formData.weight,
    } as CreateExerciseInput);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-card">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">Add Exercise</h3>
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onCancel}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {Object.keys(fieldErrors).length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please fix the errors below
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2 md:col-span-2">
          <label htmlFor="exercise_name" className="text-sm font-medium">
            Exercise Name <span className="text-destructive">*</span>
          </label>
          <Input
            id="exercise_name"
            name="exercise_name"
            value={formData.exercise_name}
            onChange={handleChange}
            placeholder="e.g., Bench Press"
            aria-invalid={fieldErrors.exercise_name ? "true" : "false"}
            required
          />
          {fieldErrors.exercise_name && (
            <p className="text-sm text-destructive">{fieldErrors.exercise_name}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="sets" className="text-sm font-medium">
            Sets <span className="text-destructive">*</span>
          </label>
          <Input
            id="sets"
            name="sets"
            type="number"
            min="1"
            value={formData.sets}
            onChange={handleChange}
            placeholder="3"
            aria-invalid={fieldErrors.sets ? "true" : "false"}
            required
          />
          {fieldErrors.sets && (
            <p className="text-sm text-destructive">{fieldErrors.sets}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="reps" className="text-sm font-medium">
            Reps (optional)
          </label>
          <Input
            id="reps"
            name="reps"
            type="number"
            min="1"
            value={formData.reps || ""}
            onChange={handleChange}
            placeholder="10"
            aria-invalid={fieldErrors.reps ? "true" : "false"}
          />
          {fieldErrors.reps && (
            <p className="text-sm text-destructive">{fieldErrors.reps}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="weight" className="text-sm font-medium">
            Weight (optional)
          </label>
          <Input
            id="weight"
            name="weight"
            type="number"
            min="0"
            step="0.5"
            value={formData.weight || ""}
            onChange={handleChange}
            placeholder="100"
            aria-invalid={fieldErrors.weight ? "true" : "false"}
          />
          {fieldErrors.weight && (
            <p className="text-sm text-destructive">{fieldErrors.weight}</p>
          )}
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit">Add Exercise</Button>
      </div>
    </form>
  );
}

