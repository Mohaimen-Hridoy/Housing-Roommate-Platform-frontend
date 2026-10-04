"use client";

import { Button } from "@/components/ui/button";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/** Last-resort boundary for failures in the root layout itself. */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          background: "#f7f9fc",
          color: "#0f172a",
          padding: "2rem",
        }}
      >
        <div style={{ maxWidth: "32rem", textAlign: "center" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 600 }}>The application failed to start</h1>
          <p style={{ marginTop: "0.75rem", fontSize: "0.875rem", color: "#475569" }}>
            An unexpected error escaped the root layout. Reload the page to try again.
          </p>
          {error.digest ? (
            <p style={{ marginTop: "0.5rem", fontFamily: "monospace", fontSize: "0.75rem", color: "#64748b" }}>
              Reference: {error.digest}
            </p>
          ) : null}
          <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.5rem", justifyContent: "center" }}>
            <Button onClick={reset}>Reload</Button>
          </div>
        </div>
      </body>
    </html>
  );
}
