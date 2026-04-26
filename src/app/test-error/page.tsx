import { notFound } from "next/navigation";

// Test fixture: throws on render so Playwright can verify error.tsx renders.
// 404s in production so it's safe to ship.
export default function TestError() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }
  throw new Error("Forced error for testing the error boundary.");
}
