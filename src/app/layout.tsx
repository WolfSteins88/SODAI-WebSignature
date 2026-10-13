import type { Metadata } from "next";
import "./globals.css";
import { siteUrl, variant } from "@/lib/config";
import { SignatureMotionBoundary } from "@/components/signature/motion";
import { PerformanceReview } from "@/components/signature/performance-review";
import { homeIntroBootstrap, homeIntroInitialCSS } from "@/components/signature/home-intro-bootstrap";
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Villa website",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>{variant === "signature" && <><style>{homeIntroInitialCSS}</style><script dangerouslySetInnerHTML={{__html:homeIntroBootstrap}}/><noscript><style>{'.sg-home-intro{display:none!important}'}</style></noscript></>}</head>
      <body>
        {process.env.SIGNATURE_PERFORMANCE_REVIEW === "1" && process.env.CONTEXT === "local" && <PerformanceReview />}
        {variant === "signature" ? (
          <SignatureMotionBoundary>{children}</SignatureMotionBoundary>
        ) : (
          children
        )}
      </body>
    </html>
  );
}
