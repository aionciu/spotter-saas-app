"use client";

import { useState } from "react";
import { ClientList } from "@/components/clients/ClientList";
import { AddClientDialog } from "@/components/clients/AddClientDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

/**
 * Clients Page
 * 
 * Displays list of clients and allows adding new ones.
 * Uses ClientList component for data fetching and display.
 */
export default function ClientsPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Clients</h1>
          <p className="text-muted-foreground mt-2">
            Manage your client list and their information.
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Client
        </Button>
      </div>

      <ClientList onAddClient={() => setIsAddDialogOpen(true)} />

      <AddClientDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />
    </div>
  );
}

