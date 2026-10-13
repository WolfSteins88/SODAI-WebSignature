"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="error-page">
      <span className="eyebrow">A moment, please</span>
      <h1>
        Something interrupted
        <br />
        your visit.
      </h1>
      <p>Please try again or return to the homepage.</p>
      <button className="button" onClick={reset}>
        Try again
      </button>
      <a className="text-link" href="/">
        Return home ↗
      </a>
    </main>
  );
}
