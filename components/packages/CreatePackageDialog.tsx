"use client";

import { useState } from "react";
import { createPackageSchema } from "@/lib/schemas/package";
import type { CreatePackageInput } from "@/lib/types/package";
import { useCreatePackage } from "@/hooks/usePackages";
import { useSubscriptionLimits } from "@/hooks/useSubscription";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/loading-spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface CreatePackageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  clientName?: string;
}

/**
 * CreatePackageDialog Component
 * 
 * Modal form for creating a new package for a client.
 * Includes subscription limit checking and upgrade prompts.
 */
export function CreatePackageDialog({
  open,
  onOpenChange,
  clientId,
  clientName,
}: CreatePackageDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreatePackageInput>({
    client_id: clientId,
    total_sessions: 1,
    expiration_date: null,
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const createPackage = useCreatePackage();
  const { plan } = useSubscriptionLimits();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "total_sessions" ? (value === "" ? 1 : parseInt(value, 10) || 1) : value,
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

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      expiration_date: value ? new Date(value).toISOString() : null,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    // Validate with Zod
    const result = createPackageSchema.safeParse(formData);
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path[0] as string;
        errors[path] = issue.message;
      });
      setFieldErrors(errors);
      return;
    }

    try {
      await createPackage.mutateAsync({
        clientId,
        data: {
          client_id: clientId,
          total_sessions: result.data.total_sessions,
          expiration_date: result.data.expiration_date ?? null,
        },
      });
      // Reset form
      setFormData({
        client_id: clientId,
        total_sessions: 1,
        expiration_date: null,
      });
      onOpenChange(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create package";
      setError(errorMessage);
      
      // If it's a limit error, show upgrade prompt
      if (errorMessage.toLowerCase().includes("limit")) {
        setError(`${errorMessage}. Consider upgrading to ${plan === "free" ? "Pro" : "Ultra"} plan.`);
      }
    }
  };

  const handleClose = () => {
    setFormData({
      client_id: clientId,
      total_sessions: 1,
      expiration_date: null,
    });
    setError(null);
    setFieldErrors({});
    onOpenChange(false);
  };

  // Get max date for expiration (1 year from now)
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);
  const maxDateString = maxDate.toISOString().split("T")[0];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Package</DialogTitle>
          <DialogDescription>
            {clientName
              ? `Create a new package for ${clientName}`
              : "Create a new package for this client"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <label htmlFor="total_sessions" className="text-sm font-medium">
              Total Sessions <span className="text-destructive">*</span>
            </label>
            <Input
              id="total_sessions"
              name="total_sessions"
              type="number"
              min="1"
              value={formData.total_sessions}
              onChange={handleChange}
              placeholder="10"
              aria-invalid={fieldErrors.total_sessions ? "true" : "false"}
            />
            {fieldErrors.total_sessions && (
              <p className="text-sm text-destructive">{fieldErrors.total_sessions}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Number of sessions included in this package
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="expiration_date" className="text-sm font-medium">
              Expiration Date (optional)
            </label>
            <Input
              id="expiration_date"
              name="expiration_date"
              type="date"
              min={new Date().toISOString().split("T")[0]}
              max={maxDateString}
              onChange={handleDateChange}
              value={
                formData.expiration_date
                  ? new Date(formData.expiration_date).toISOString().split("T")[0]
                  : ""
              }
            />
            <p className="text-xs text-muted-foreground">
              Leave empty for no expiration date
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createPackage.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createPackage.isPending}>
              {createPackage.isPending ? (
                <>
                  <Spinner size="sm" />
                  Creating...
                </>
              ) : (
                "Create Package"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

