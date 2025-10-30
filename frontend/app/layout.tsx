import type { Metadata } from "next";
import "./globals.css";
import NotificationToast from "./components/NotificationToast";
import { DEFAULT_USER_ID } from "./lib/constants";

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
        <NotificationToast userId={DEFAULT_USER_ID} />
      </body>
    </html>
  );
}
