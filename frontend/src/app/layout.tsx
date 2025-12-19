// src/app/layout.tsx
import "./globals.css";
import { Inter } from "next/font/google"; // 1. Import the font

// 2. Initialize the font
const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        // 3. Now 'inter' is defined and can be used here
        className={`${inter.className} bg-gray-50 text-gray-900 antialiased`}
        suppressHydrationWarning={true}
      >
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}