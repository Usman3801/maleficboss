"use client";
import { useEffect, useState } from "react";
import { Droplet } from "lucide-react";

export default function Faucet() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Redirect to official Demos faucet after a short delay
    const timer = setTimeout(() => {
      if (typeof window !== "undefined") {
        window.location.href = "https://faucet.demos.sh/";
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center py-20">
      <Droplet size={64} className="text-white mb-6 animate-pulse" />
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mb-4"></div>
      <h2 className="text-2xl font-bold mb-2">Redirecting to Demos Faucet...</h2>
      <p className="text-gray-400 mb-4">You'll be redirected to the official faucet page</p>
      <a
        href="https://faucet.demos.sh/"
        className="mt-4 text-white hover:underline btn-primary px-6 py-3"
      >
        Click here if not redirected automatically →
      </a>
    </div>
  );
}
