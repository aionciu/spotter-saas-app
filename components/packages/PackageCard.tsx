"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Calendar } from "lucide-react";
import type { Package as PackageType } from "@/lib/types/package";
import { cn } from "@/lib/utils";

interface PackageCardProps {
  package: PackageType;
  showClientName?: boolean;
}

/**
 * PackageCard Component
 * 
 * Displays package information with visual progress indicator.
 * Shows total sessions, remaining sessions, expiration date, and status.
 */
export function PackageCard({ package: pkg, showClientName = false }: PackageCardProps) {
  const isActive = pkg.is_active && pkg.remaining_sessions > 0;
  const isExpired = pkg.expiration_date && new Date(pkg.expiration_date) < new Date();
  const progressPercentage = (pkg.remaining_sessions / pkg.total_sessions) * 100;
  const isLowSessions = pkg.remaining_sessions <= 3 && pkg.remaining_sessions > 0;

  return (
    <Card className={cn(
      "transition-shadow",
      !isActive && "opacity-60"
    )}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Package className="h-5 w-5" />
            Package
          </CardTitle>
          <div className="flex gap-2">
            {isActive && !isExpired && (
              <Badge variant="default">Active</Badge>
            )}
            {!isActive && (
              <Badge variant="secondary">Inactive</Badge>
            )}
            {isExpired && (
              <Badge variant="destructive">Expired</Badge>
            )}
            {isLowSessions && (
              <Badge variant="destructive">Low</Badge>
            )}
          </div>
        </div>
        {showClientName && (
          <CardDescription>
            Created {pkg.created_at ? new Date(pkg.created_at).toLocaleDateString() : "N/A"}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sessions Info */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              Sessions
            </span>
            <span className="text-sm font-semibold">
              {pkg.remaining_sessions} / {pkg.total_sessions}
            </span>
          </div>
          {/* Progress Bar */}
          <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full transition-all duration-300",
                isLowSessions ? "bg-destructive" : "bg-primary"
              )}
              style={{ width: `${Math.max(0, Math.min(100, progressPercentage))}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {Math.round(progressPercentage)}% remaining
          </p>
        </div>

        {/* Expiration Date */}
        {pkg.expiration_date && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              {isExpired ? "Expired: " : "Expires: "}
              {new Date(pkg.expiration_date).toLocaleDateString()}
            </span>
          </div>
        )}

        {/* Used Sessions */}
        <div className="text-sm text-muted-foreground">
          {pkg.total_sessions - pkg.remaining_sessions} session{pkg.total_sessions - pkg.remaining_sessions !== 1 ? "s" : ""} used
        </div>
      </CardContent>
    </Card>
  );
}

