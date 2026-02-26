import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ReactQueryProvider from "@/lib/react-query-provider";
import { Header } from "@/components/layout/Header";
import { TaskModals } from "@/components/tasks/TaskModals";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TaskFlow | Manage Your Work",
  description: "A premium task management application built with Next.js, GraphQL and Firebase.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased bg-background text-foreground`}>
        <ReactQueryProvider>
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 container mx-auto py-8 px-4">
              {children}
            </main>
          </div>
          <TaskModals />
        </ReactQueryProvider>
      </body>
    </html>
  );
}
