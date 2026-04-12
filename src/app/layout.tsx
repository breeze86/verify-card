import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "STG & Astra - Card Grading",
  description: "Professional trading card grading and authentication services for Pokémon, Yu-Gi-Oh!, Magic: The Gathering, and sports cards",
  icons: {
    icon: "/stg-logo.png",
    shortcut: "/stg-logo.png",
    apple: "/stg-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
