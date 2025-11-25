"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Package } from "lucide-react";
import type { Client } from "@/lib/types/client";

interface ClientCardProps {
  client: Client;
  activePackage?: {
    remaining_sessions: number;
    total_sessions: number;
  } | null;
}

/**
 * ClientCard Component
 * 
 * Displays a client card with basic information and active package status.
 * Clickable to navigate to client detail page.
 */
export function ClientCard({ client, activePackage }: ClientCardProps) {
  const hasActivePackage = activePackage && activePackage.remaining_sessions > 0;
  const genderIcon = client.gender === "male" ? "♂" : client.gender === "female" ? "♀" : "";

  return (
    <Link href={`/clients/${client.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-5 w-5 text-muted-foreground shrink-0" />
                <h3 className="font-semibold text-lg truncate">
                  {client.name}
                </h3>
                {genderIcon && (
                  <span className="text-muted-foreground text-sm">{genderIcon}</span>
                )}
              </div>

              {client.notes && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {client.notes}
                </p>
              )}

              {hasActivePackage ? (
                <div className="flex items-center gap-2 mt-3">
                  <Package className="h-4 w-4 text-primary shrink-0" />
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="default" className="text-xs">
                      {activePackage.remaining_sessions} / {activePackage.total_sessions} sessions
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {Math.round((activePackage.remaining_sessions / activePackage.total_sessions) * 100)}% remaining
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 mt-3">
                  <Package className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-xs text-muted-foreground">No active package</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

