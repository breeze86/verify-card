import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "STG & Astra - Card Grading",
  description: "Professional trading card grading and authentication services for Pokémon, Yu-Gi-Oh!, Magic: The Gathering, and sports cards",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
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
