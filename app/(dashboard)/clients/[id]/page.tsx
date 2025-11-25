"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { NotFound } from "@/components/errors/NotFound";
import { EditClientDialog } from "@/components/clients/EditClientDialog";
import { useDeleteClient } from "@/hooks/useClients";
import { usePackages } from "@/hooks/usePackages";
import { ArrowLeft, Edit, Trash2, Package, Calendar, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Client } from "@/lib/types/client";

/**
 * Client Detail Page
 * 
 * Displays comprehensive client information including:
 * - Client details (name, gender, notes)
 * - Active package with remaining sessions
 * - Quick actions (Create Package, Start Workout, View History)
 */
export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Fetch client data
  const { data: clientData, isLoading: isLoadingClient, error: clientError } = useQuery<{ client: Client }>({
    queryKey: ["client", clientId],
    queryFn: async () => {
      const response = await fetch(`/api/clients/${clientId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch client");
      }
      return response.json();
    },
    enabled: !!clientId,
  });

  // Fetch packages
  const { data: packagesData, isLoading: isLoadingPackages } = usePackages(clientId);
  const packages = packagesData?.packages ?? [];
  const activePackage = packages.find(
    (pkg) => pkg.is_active && pkg.remaining_sessions > 0
  );

  const deleteClient = useDeleteClient();

  const handleDelete = async () => {
    if (!clientData?.client) return;
    
    if (!confirm(`Are you sure you want to delete ${clientData.client.name}? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteClient.mutateAsync(clientData.client.id);
      router.push("/clients");
    } catch (error) {
      console.error("Failed to delete client:", error);
      alert("Failed to delete client. Please try again.");
    }
  };

  if (isLoadingClient) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner text="Loading client..." />
      </div>
    );
  }

  if (clientError || !clientData?.client) {
    return <NotFound title="Client Not Found" description="The client you're looking for doesn't exist." />;
  }

  const client = clientData.client;
  const genderIcon = client.gender === "male" ? "♂" : client.gender === "female" ? "♀" : "";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/clients")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              {client.name}
              {genderIcon && <span className="text-muted-foreground">{genderIcon}</span>}
            </h1>
            <p className="text-muted-foreground mt-1">
              Client profile and information
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsEditDialogOpen(true)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteClient.isPending}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Client Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Client Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Name</label>
            <p className="text-base mt-1">{client.name}</p>
          </div>
          {client.gender && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Gender</label>
              <p className="text-base mt-1 capitalize">{client.gender}</p>
            </div>
          )}
          {client.notes && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Notes</label>
              <p className="text-base mt-1 whitespace-pre-wrap">{client.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Package */}
      {isLoadingPackages ? (
        <Card>
          <CardContent className="py-8">
            <LoadingSpinner size="sm" />
          </CardContent>
        </Card>
      ) : activePackage ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Active Package
            </CardTitle>
            <CardDescription>
              Current package with remaining sessions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Remaining Sessions</p>
                <p className="text-2xl font-bold">
                  {activePackage.remaining_sessions} / {activePackage.total_sessions}
                </p>
              </div>
              <Badge variant="default">
                {Math.round((activePackage.remaining_sessions / activePackage.total_sessions) * 100)}% remaining
              </Badge>
            </div>
            {activePackage.expiration_date && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  Expires: {new Date(activePackage.expiration_date).toLocaleDateString()}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Active Package
            </CardTitle>
            <CardDescription>
              No active package for this client
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => {/* TODO: Navigate to create package */}}>
              <Package className="mr-2 h-4 w-4" />
              Create Package
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common actions for this client
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => {/* TODO: Navigate to create package */}}>
              <Package className="mr-2 h-4 w-4" />
              Create Package
            </Button>
            <Button variant="outline" onClick={() => {/* TODO: Navigate to start workout */}}>
              <Calendar className="mr-2 h-4 w-4" />
              Start Workout
            </Button>
            <Button variant="outline" onClick={() => {/* TODO: Navigate to history */}}>
              <Calendar className="mr-2 h-4 w-4" />
              View History
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <EditClientDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        client={client}
      />
    </div>
  );
}

