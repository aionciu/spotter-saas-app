import { describe, it, expect, vi, beforeEach } from "vitest";
import { createServerClient } from "@/lib/supabase/server";
import {
  getClientsByTrainerId,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
} from "@/lib/db/queries/clients";

// Mock Supabase client
vi.mock("@/lib/supabase/server", () => ({
  createServerClient: vi.fn(),
}));

describe("Client Query Functions", () => {
  const mockSupabase = {
    from: vi.fn(() => mockSupabase),
    select: vi.fn(() => mockSupabase),
    eq: vi.fn(() => mockSupabase),
    single: vi.fn(),
    insert: vi.fn(() => mockSupabase),
    update: vi.fn(() => mockSupabase),
    order: vi.fn(() => mockSupabase),
    delete: vi.fn(() => mockSupabase),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createServerClient).mockResolvedValue(mockSupabase as any);
  });

  describe("getClientsByTrainerId", () => {
    it("should return clients for trainer", async () => {
      const mockClients = [
        { id: "client-1", trainer_id: "trainer-1", name: "Client 1" },
        { id: "client-2", trainer_id: "trainer-1", name: "Client 2" },
      ];

      mockSupabase.order.mockResolvedValue({
        data: mockClients,
        error: null,
      });

      const result = await getClientsByTrainerId("trainer-1");

      expect(result).toEqual(mockClients);
      expect(mockSupabase.eq).toHaveBeenCalledWith("trainer_id", "trainer-1");
    });

    it("should throw error on query failure", async () => {
      mockSupabase.order.mockResolvedValue({
        data: null,
        error: { message: "Query failed" },
      });

      await expect(getClientsByTrainerId("trainer-1")).rejects.toThrow(
        "Failed to get clients"
      );
    });
  });

  describe("createClient", () => {
    it("should create client successfully", async () => {
      const clientData = {
        trainer_id: "trainer-1",
        name: "New Client",
        gender: "male" as const,
      };

      const mockCreatedClient = {
        id: "client-id",
        ...clientData,
      };

      mockSupabase.single.mockResolvedValue({
        data: mockCreatedClient,
        error: null,
      });

      const result = await createClient(clientData);

      expect(result).toEqual(mockCreatedClient);
      expect(mockSupabase.insert).toHaveBeenCalledWith(clientData);
    });
  });

  describe("deleteClient", () => {
    it("should delete client successfully", async () => {
      const deleteChain = {
        eq: vi.fn().mockResolvedValue({
          error: null,
        }),
      };
      mockSupabase.delete.mockReturnValue(deleteChain);

      await deleteClient("client-id");

      expect(deleteChain.eq).toHaveBeenCalledWith("id", "client-id");
    });

    it("should throw error on deletion failure", async () => {
      const deleteChain = {
        eq: vi.fn().mockResolvedValue({
          error: { message: "Delete failed" },
        }),
      };
      mockSupabase.delete.mockReturnValue(deleteChain);

      await expect(deleteClient("client-id")).rejects.toThrow("Failed to delete client");
    });
  });
});

