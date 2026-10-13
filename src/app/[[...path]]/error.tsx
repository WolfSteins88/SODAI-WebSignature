"use client";
import Link from "next/link";
export default function PublicError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="error-page" role="alert">
      <span className="eyebrow">Temporarily unavailable</span>
      <h1>A moment to pause.</h1>
      <p>
        The published villa information could not be loaded. Please try again
        shortly.
      </p>
      <button className="button" onClick={reset}>
        Try again
      </button>
      <Link className="text-link" href="/">
        Return home
      </Link>
    </main>
  );
}
