import { notFound } from "next/navigation";
import Loading from "@/app/notes/[id]/loading";

// Test fixture: renders the loading.tsx component directly so Playwright
// can verify its structure without depending on streaming timing.
// 404s in production so it's safe to ship.
export default function TestLoading() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }
  return <Loading />;
}
