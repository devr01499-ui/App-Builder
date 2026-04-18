import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI App Generator | Powered by Together AI",
  description: "Generate and run rich React web apps in real-time using Kimi K2.5 and Sandpack.",
  openGraph: {
    title: "AI App Generator",
    description: "Build React apps in seconds with Together AI and Sandpack.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark antialiased">
      <body className={`${inter.className} bg-slate-950 text-slate-50 min-h-screen flex flex-col`}>
        {children}
      </body>
    </html>
  );
}
