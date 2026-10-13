import Link from "next/link";
export default function NotFound() {
  return (
    <main className="error-page">
      <span className="eyebrow">404 · A little off the path</span>
      <h1>
        Let’s find your
        <br />
        <em>way back.</em>
      </h1>
      <p>This page may have moved, or this villa is no longer available.</p>
      <Link className="button" href="/">
        Return home ↗
      </Link>
    </main>
  );
}
