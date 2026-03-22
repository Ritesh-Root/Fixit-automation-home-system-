import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FixIt — Say it. We fix it.",
  description:
    "AI agent that books home services through natural conversation. AC repair, plumbing, electrician, and more — booked in seconds, not hours.",
  keywords: [
    "home services",
    "AI booking",
    "AC repair",
    "plumbing",
    "electrician",
    "smart booking",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com" rel="preconnect" />
        <link crossOrigin="" href="https://fonts.gstatic.com" rel="preconnect" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Manrope:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
