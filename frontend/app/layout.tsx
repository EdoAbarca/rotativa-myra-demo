import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rotativa Myra Demo",
  description: "A modern full-stack application built with Next.js, NestJS, and MongoDB",
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
