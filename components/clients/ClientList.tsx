"use client";

import { useClients } from "@/hooks/useClients";
import { usePackages } from "@/hooks/usePackages";
import { ClientCard } from "./ClientCard";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { Client } from "@/lib/types/client";

interface ClientListProps {
  onAddClient?: () => void;
}

/**
 * ClientList Component
 * 
 * Displays a list of clients with their active package information.
 * Shows loading and empty states.
 */
export function ClientList({ onAddClient }: ClientListProps) {
  const { data, isLoading, error } = useClients();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12">
          <LoadingSpinner text="Loading clients..." />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>
            Failed to load clients. Please try again.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">
            {error instanceof Error ? error.message : "Unknown error"}
          </p>
        </CardContent>
      </Card>
    );
  }

  const clients = data?.clients ?? [];

  if (clients.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Clients</CardTitle>
          <CardDescription>
            You haven't added any clients yet. Get started by adding your first client.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground mb-4">
              No clients found
            </p>
            <Button onClick={onAddClient}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Client
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {clients.map((client) => (
        <ClientWithPackage key={client.id} client={client} />
      ))}
    </div>
  );
}

/**
 * Component that fetches package info for a single client
 */
function ClientWithPackage({ client }: { client: Client }) {
  const { data: packagesData } = usePackages(client.id);
  const packages = packagesData?.packages ?? [];
  const activePackage = packages.find(
    (pkg) => pkg.is_active && pkg.remaining_sessions > 0
  );

  return (
    <ClientCard
      client={client}
      activePackage={activePackage ? {
        remaining_sessions: activePackage.remaining_sessions,
        total_sessions: activePackage.total_sessions,
      } : null}
    />
  );
}

