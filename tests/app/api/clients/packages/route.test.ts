import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "@/app/api/clients/[clientId]/packages/route";
import { getCurrentUserId } from "@/lib/clerk";
import { getUserByClerkId } from "@/lib/db/queries/users";
import { getClientById } from "@/lib/db/queries/clients";
import { getPackagesByClientId, createPackage } from "@/lib/db/queries/packages";
import { enforcePackageLimit } from "@/lib/subscriptions/enforce-limits";

// Mock dependencies
vi.mock("@/lib/clerk");
vi.mock("@/lib/db/queries/users");
vi.mock("@/lib/db/queries/clients");
vi.mock("@/lib/db/queries/packages");
vi.mock("@/lib/subscriptions/enforce-limits");

describe("GET /api/clients/[clientId]/packages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return packages for client", async () => {
    const mockUser = {
      id: "user-123",
      clerk_user_id: "clerk-123",
      email: "test@example.com",
    };

    const mockClient = {
      id: "client-123",
      trainer_id: "user-123",
      name: "Test Client",
    };

    const mockPackages = [
      { id: "pkg-1", client_id: "client-123", total_sessions: 10 },
      { id: "pkg-2", client_id: "client-123", total_sessions: 20 },
    ];

    vi.mocked(getCurrentUserId).mockResolvedValue("clerk-123");
    vi.mocked(getUserByClerkId).mockResolvedValue(mockUser);
    vi.mocked(getClientById).mockResolvedValue(mockClient);
    vi.mocked(getPackagesByClientId).mockResolvedValue(mockPackages);

    const response = await GET(
      new Request("http://localhost"),
      { params: { clientId: "client-123" } }
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.packages).toEqual(mockPackages);
  });

  it("should return 403 when client does not belong to user", async () => {
    const mockUser = {
      id: "user-123",
      clerk_user_id: "clerk-123",
      email: "test@example.com",
    };

    const mockClient = {
      id: "client-123",
      trainer_id: "other-user",
      name: "Test Client",
    };

    vi.mocked(getCurrentUserId).mockResolvedValue("clerk-123");
    vi.mocked(getUserByClerkId).mockResolvedValue(mockUser);
    vi.mocked(getClientById).mockResolvedValue(mockClient);

    const response = await GET(
      new Request("http://localhost"),
      { params: { clientId: "client-123" } }
    );
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toContain("does not belong to you");
  });
});

describe("POST /api/clients/[clientId]/packages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create package successfully", async () => {
    const mockUser = {
      id: "user-123",
      clerk_user_id: "clerk-123",
      email: "test@example.com",
    };

    const mockPackage = {
      id: "pkg-123",
      client_id: "client-123",
      total_sessions: 10,
      remaining_sessions: 10,
    };

    const requestBody = {
      total_sessions: 10,
    };

    vi.mocked(getCurrentUserId).mockResolvedValue("clerk-123");
    vi.mocked(enforcePackageLimit).mockResolvedValue();
    vi.mocked(createPackage).mockResolvedValue(mockPackage);

    const request = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request, {
      params: { clientId: "client-123" },
    });
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.package).toEqual(mockPackage);
    expect(enforcePackageLimit).toHaveBeenCalledWith("client-123");
  });

  it("should return 403 when limit exceeded", async () => {
    vi.mocked(getCurrentUserId).mockResolvedValue("clerk-123");
    vi.mocked(enforcePackageLimit).mockRejectedValue(
      new Error("You've reached the limit of 3 packages")
    );

    const request = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({ total_sessions: 10 }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request, {
      params: { clientId: "client-123" },
    });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toContain("limit");
  });
});

