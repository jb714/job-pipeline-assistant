import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Job Pipeline Assistant",
  description: "Automate job sourcing, filtering, and application preparation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
