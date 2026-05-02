import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: "Contract Deadline Tracker | Never miss another contract renewal deadline",
  description:
    "Upload contracts, extract critical dates with AI, and get proactive reminders before renewals, cancellations, and payment deadlines.",
  openGraph: {
    title: "Contract Deadline Tracker",
    description:
      "Never miss another contract renewal deadline. AI-powered contract date extraction and smart reminders.",
    type: "website",
    url: appUrl
  },
  twitter: {
    card: "summary_large_image",
    title: "Contract Deadline Tracker",
    description:
      "AI-powered contract date extraction and reminder scheduling for renewals, cancellations, and payments."
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className="bg-[#0d1117] text-slate-100 antialiased">{children}</body>
    </html>
  );
}
