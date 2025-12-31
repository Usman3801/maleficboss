import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Demos Network DApp",
  description: "Complete DeFi platform for Demos Network",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <main className="flex-1">{children}</main>
            <footer className="border-t border-border py-6 text-center text-sm text-gray-400">
              <p>© 2025 Demos Network. Powered by Kynesys Labs.</p>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
