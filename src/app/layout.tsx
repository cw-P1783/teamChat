import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Team Chat Lab",
  description: "A shared workshop chat for learning Git, GitHub, and collaboration.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
