import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/user/profile/route";
import { getCurrentUserId } from "@/lib/clerk";
import { getUserByClerkId } from "@/lib/db/queries/users";
import { getSubscriptionByUserId } from "@/lib/db/queries/subscriptions";

// Mock dependencies
vi.mock("@/lib/clerk");
vi.mock("@/lib/db/queries/users");
vi.mock("@/lib/db/queries/subscriptions");

describe("GET /api/user/profile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return user profile with subscription from subscription table", async () => {
    const mockUser = {
      id: "user-123",
      clerk_user_id: "clerk-123",
      email: "test@example.com",
      name: "Test User",
      subscription_plan: "free" as const,
      subscription_status: "active" as const,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    };

    const mockSubscription = {
      id: "sub-123",
      user_id: "user-123",
      plan_type: "pro" as const,
      status: "active" as const,
    };

    vi.mocked(getCurrentUserId).mockResolvedValue("clerk-123");
    vi.mocked(getUserByClerkId).mockResolvedValue(mockUser);
    vi.mocked(getSubscriptionByUserId).mockResolvedValue(mockSubscription);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.subscription_plan).toBe("pro");
    expect(data.subscription_status).toBe("active");
    expect(data.email).toBe("test@example.com");
  });

  it("should return user profile with subscription from user table when subscription table is empty", async () => {
    const mockUser = {
      id: "user-123",
      clerk_user_id: "clerk-123",
      email: "test@example.com",
      name: "Test User",
      subscription_plan: "pro" as const,
      subscription_status: "active" as const,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    };

    vi.mocked(getCurrentUserId).mockResolvedValue("clerk-123");
    vi.mocked(getUserByClerkId).mockResolvedValue(mockUser);
    vi.mocked(getSubscriptionByUserId).mockResolvedValue(null);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.subscription_plan).toBe("pro");
    expect(data.subscription_status).toBe("active");
  });

  it("should return default free plan when subscription data is missing", async () => {
    const mockUser = {
      id: "user-123",
      clerk_user_id: "clerk-123",
      email: "test@example.com",
      name: "Test User",
      subscription_plan: null,
      subscription_status: null,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    };

    vi.mocked(getCurrentUserId).mockResolvedValue("clerk-123");
    vi.mocked(getUserByClerkId).mockResolvedValue(mockUser as any);
    vi.mocked(getSubscriptionByUserId).mockResolvedValue(null);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.subscription_plan).toBe("free");
    expect(data.subscription_status).toBe("active");
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
    expect(data.error).toBe("Failed to fetch user profile");
  });
});

