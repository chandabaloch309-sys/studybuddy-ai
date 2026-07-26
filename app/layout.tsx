import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Image from "next/image";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "StudyBuddy AI",
  description: "Your smart AI-powered study planner",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex min-h-screen bg-gray-50">
          
          {/* SIDEBAR */}
          <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <Link href="/" className="flex items-center gap-3">
                <Image
                  src="/studybuddy.png"
                  alt="StudyBuddy AI"
                  width={48}
                  height={48}
                  className="rounded-xl"
                />
                <span className="text-xl font-bold text-indigo-700">
                  StudyBuddy AI
                </span>
              </Link>
            </div>

            <nav className="flex-1 p-4 space-y-2">
              <Link
                href="/"
                className="block px-4 py-2 rounded-lg hover:bg-indigo-50 text-gray-700 hover:text-indigo-700 transition"
              >
                Home
              </Link>
              <Link
                href="/logo"
                className="block px-4 py-2 rounded-lg hover:bg-indigo-50 text-gray-700 hover:text-indigo-700 transition"
              >
                
              </Link>
            </nav>
          </aside>

          {/* MAIN CONTENT */}
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}