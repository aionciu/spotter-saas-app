"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Workout, Exercise } from "@/lib/types/workout";
import type { CreateWorkoutInput, CreateExerciseInput, UpdateExerciseInput } from "@/lib/types/workout";

/**
 * Response type for workouts API
 */
interface WorkoutsResponse {
  workouts: Workout[];
}

/**
 * Response type for single workout API
 */
interface WorkoutResponse {
  workout: Workout;
}

/**
 * Response type for exercises API
 */
interface ExercisesResponse {
  exercises: Exercise[];
}

/**
 * Response type for single exercise API
 */
interface ExerciseResponse {
  exercise: Exercise;
}

/**
 * Hook for fetching workouts for a client
 */
export function useWorkouts(clientId: string) {
  return useQuery<WorkoutsResponse>({
    queryKey: ["workouts", clientId],
    queryFn: async () => {
      const response = await fetch(`/api/clients/${clientId}/workouts`);
      if (!response.ok) {
        throw new Error("Failed to fetch workouts");
      }
      return response.json();
    },
    enabled: !!clientId,
  });
}

/**
 * Hook for fetching a single workout
 */
export function useWorkout(workoutId: string) {
  return useQuery<WorkoutResponse>({
    queryKey: ["workout", workoutId],
    queryFn: async () => {
      const response = await fetch(`/api/workouts/${workoutId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch workout");
      }
      return response.json();
    },
    enabled: !!workoutId,
  });
}

/**
 * Hook for fetching exercises for a workout
 */
export function useExercises(workoutId: string) {
  return useQuery<ExercisesResponse>({
    queryKey: ["exercises", workoutId],
    queryFn: async () => {
      const response = await fetch(`/api/workouts/${workoutId}/exercises`);
      if (!response.ok) {
        throw new Error("Failed to fetch exercises");
      }
      return response.json();
    },
    enabled: !!workoutId,
  });
}

/**
 * Hook for creating a new workout
 */
export function useCreateWorkout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      clientId,
      data,
    }: {
      clientId: string;
      data: CreateWorkoutInput;
    }) => {
      const response = await fetch(`/api/clients/${clientId}/workouts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create workout");
      }

      return response.json() as Promise<WorkoutResponse>;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["workouts", variables.clientId] });
    },
  });
}

/**
 * Hook for updating a workout
 */
export function useUpdateWorkout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      workoutId,
      clientId,
      data,
    }: {
      workoutId: string;
      clientId: string;
      data: Partial<CreateWorkoutInput>;
    }) => {
      // TODO: Implement API endpoint /api/workouts/[id]
      throw new Error("Workout update not yet implemented");
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["workouts", variables.clientId] });
      queryClient.invalidateQueries({ queryKey: ["workout", variables.workoutId] });
    },
  });
}

/**
 * Hook for adding an exercise to a workout
 */
export function useAddExercise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateExerciseInput) => {
      const response = await fetch(`/api/workouts/${data.workout_id}/exercises`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add exercise");
      }

      return response.json() as Promise<ExerciseResponse>;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["exercises", variables.workout_id] });
      queryClient.invalidateQueries({ queryKey: ["workout", variables.workout_id] });
    },
  });
}

/**
 * Hook for updating an exercise
 */
export function useUpdateExercise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      exerciseId,
      workoutId,
      data,
    }: {
      exerciseId: string;
      workoutId: string;
      data: UpdateExerciseInput;
    }) => {
      // TODO: Implement API endpoint /api/exercises/[id]
      throw new Error("Exercise update not yet implemented");
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["exercises", variables.workoutId] });
      queryClient.invalidateQueries({ queryKey: ["workout", variables.workoutId] });
    },
  });
}

/**
 * Hook for deleting an exercise
 */
export function useDeleteExercise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      exerciseId,
      workoutId,
    }: {
      exerciseId: string;
      workoutId: string;
    }) => {
      // TODO: Implement API endpoint /api/exercises/[id]
      throw new Error("Exercise deletion not yet implemented");
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["exercises", variables.workoutId] });
      queryClient.invalidateQueries({ queryKey: ["workout", variables.workoutId] });
    },
  });
}

