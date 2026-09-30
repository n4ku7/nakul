import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nakul Ojha — CS Undergraduate · AI/ML · Full-Stack",
  description: "Portfolio of Nakul Ojha, a Computer Science undergraduate at KL University working across AI/ML, full-stack development and Linux systems.",
  metadataBase: new URL("https://example.com")
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
