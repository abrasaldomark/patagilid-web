import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

// We use the Inter font, a modern and clean typeface perfect for admin dashboards.
// It is loaded efficiently by Next.js font optimization.
const inter = Inter({
  subsets: ["latin"],
  display: "swap", // Ensures text remains visible during webfont load
});

// Metadata is used for SEO and browser tab titles.
export const metadata: Metadata = {
  title: "PataGilid Admin",
  description: "Administrative dashboard for the PataGilid mountaineering app",
};

// RootLayout is the outermost component that wraps every page in our app.
// It defines the HTML structure, includes global styles, and applies fonts.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // We apply the font class to the HTML tag so it cascades down to all elements.
    <html lang="en" className={inter.className}>
      <body>
        {/* We wrap the entire application in our AuthProvider so auth state is globally accessible */}
        <AuthProvider>
          {/* 'children' represents the specific page component being rendered */}
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
