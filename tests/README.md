# Testing Guide

This project uses **Vitest** for unit and integration testing, along with **React Testing Library** for component testing.

## Quick Start

```bash
# Run tests in watch mode (recommended for development)
pnpm test

# Run tests once
pnpm test:run

# Run tests with UI
pnpm test:ui

# Generate coverage report
pnpm test:coverage
```

## Test Structure

```
tests/
├── setup.ts              # Test configuration and mocks
├── lib/
│   ├── schemas/          # Schema validation tests
│   ├── utils/            # Utility function tests
│   └── db/               # Database query tests
└── components/           # React component tests
```

## Writing Tests

### Schema Validation Tests

```typescript
import { describe, it, expect } from "vitest";
import { createClientSchema } from "@/lib/schemas/client";

describe("createClientSchema", () => {
  it("should validate valid data", () => {
    const result = createClientSchema.safeParse({
      name: "John Doe",
      gender: "male",
    });
    expect(result.success).toBe(true);
  });
});
```

### Component Tests

```typescript
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MyComponent } from "@/components/MyComponent";

describe("MyComponent", () => {
  it("should render correctly", () => {
    render(<MyComponent />);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });
});
```

## Test Utilities

- `validateSchema()` - Throws on validation failure
- `safeValidateSchema()` - Returns result object
- `validationErrorResponse()` - Creates error response for API routes

## Mocking

### Next.js Router
Automatically mocked in `tests/setup.ts`:
- `useRouter()`
- `usePathname()`
- `useSearchParams()`

### Clerk Authentication
Automatically mocked in `tests/setup.ts`:
- `auth()`
- `currentUser()`
- `clerkClient()`

### Environment Variables
Test environment variables are set in `tests/setup.ts`. Override in individual tests if needed.

## Coverage

Coverage reports are generated in `coverage/` directory. Open `coverage/index.html` to view detailed reports.

## Best Practices

1. **Test behavior, not implementation** - Focus on what the code does, not how
2. **Use descriptive test names** - "should validate valid client data" not "test1"
3. **One assertion per test** - Keep tests focused and easy to debug
4. **Mock external dependencies** - Don't hit real APIs or databases in unit tests
5. **Test edge cases** - Invalid inputs, null values, boundary conditions

## Running Specific Tests

```bash
# Run tests matching a pattern
pnpm test client

# Run tests in a specific file
pnpm test tests/lib/schemas/client.test.ts
```

## CI/CD Integration

Tests run automatically in CI/CD pipelines. Ensure all tests pass before merging:

```bash
pnpm test:run
```

