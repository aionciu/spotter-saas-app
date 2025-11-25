import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "@/app/api/clients/route";
import { getCurrentUserId } from "@/lib/clerk";
import { getUserByClerkId } from "@/lib/db/queries/users";
import { getClientsByTrainerId, createClient } from "@/lib/db/queries/clients";
import { enforceClientLimit } from "@/lib/subscriptions/enforce-limits";

// Mock dependencies
vi.mock("@/lib/clerk");
vi.mock("@/lib/db/queries/users");
vi.mock("@/lib/db/queries/clients");
vi.mock("@/lib/subscriptions/enforce-limits");

describe("GET /api/clients", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return clients for authenticated user", async () => {
    const mockUser = {
      id: "user-123",
      clerk_user_id: "clerk-123",
      email: "test@example.com",
    };

    const mockClients = [
      { id: "client-1", trainer_id: "user-123", name: "Client 1" },
      { id: "client-2", trainer_id: "user-123", name: "Client 2" },
    ];

    vi.mocked(getCurrentUserId).mockResolvedValue("clerk-123");
    vi.mocked(getUserByClerkId).mockResolvedValue(mockUser);
    vi.mocked(getClientsByTrainerId).mockResolvedValue(mockClients);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.clients).toEqual(mockClients);
  });

  it("should return 401 when not authenticated", async () => {
    vi.mocked(getCurrentUserId).mockResolvedValue(null);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("should return 500 on error", async () => {
    vi.mocked(getCurrentUserId).mockResolvedValue("clerk-123");
    vi.mocked(getUserByClerkId).mockRejectedValue(
      new Error("Database error")
    );

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Failed to fetch clients");
  });
});

describe("POST /api/clients", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create client successfully", async () => {
    const mockUser = {
      id: "user-123",
      clerk_user_id: "clerk-123",
      email: "test@example.com",
    };

    const mockClient = {
      id: "client-123",
      trainer_id: "user-123",
      name: "New Client",
      gender: "male",
    };

    const requestBody = {
      name: "New Client",
      gender: "male",
    };

    vi.mocked(getCurrentUserId).mockResolvedValue("clerk-123");
    vi.mocked(getUserByClerkId).mockResolvedValue(mockUser);
    vi.mocked(enforceClientLimit).mockResolvedValue();
    vi.mocked(createClient).mockResolvedValue(mockClient);

    const request = new Request("http://localhost/api/clients", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.client).toEqual(mockClient);
    expect(enforceClientLimit).toHaveBeenCalled();
  });

  it("should return 401 when not authenticated", async () => {
    vi.mocked(getCurrentUserId).mockResolvedValue(null);

    const request = new Request("http://localhost/api/clients", {
      method: "POST",
      body: JSON.stringify({ name: "New Client" }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("should return 403 when limit exceeded", async () => {
    const mockUser = {
      id: "user-123",
      clerk_user_id: "clerk-123",
      email: "test@example.com",
    };

    vi.mocked(getCurrentUserId).mockResolvedValue("clerk-123");
    vi.mocked(getUserByClerkId).mockResolvedValue(mockUser);
    vi.mocked(enforceClientLimit).mockRejectedValue(
      new Error("You've reached the limit of 5 clients")
    );

    const request = new Request("http://localhost/api/clients", {
      method: "POST",
      body: JSON.stringify({ name: "New Client" }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toContain("limit");
  });

  it("should return 400 on validation error", async () => {
    const mockUser = {
      id: "user-123",
      clerk_user_id: "clerk-123",
      email: "test@example.com",
    };

    vi.mocked(getCurrentUserId).mockResolvedValue("clerk-123");
    vi.mocked(getUserByClerkId).mockResolvedValue(mockUser);
    vi.mocked(enforceClientLimit).mockResolvedValue();

    const request = new Request("http://localhost/api/clients", {
      method: "POST",
      body: JSON.stringify({ name: "" }), // Invalid: empty name
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Validation error");
  });
});

