"use client";
import { useEffect } from "react";
import { Droplet, ExternalLink } from "lucide-react";

export default function Faucet() {
  useEffect(() => {
    window.location.href = "https://faucet.demos.sh/";
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-20">
      <Droplet size={64} className="text-blue-400 mb-4 animate-bounce" />
      <h2 className="text-2xl font-bold mb-2">Redirecting to Faucet...</h2>
      <p className="text-gray-400 mb-6">Taking you to the Demos Network Faucet</p>
      <a
        href="https://faucet.demos.sh/"
        className="btn-primary flex items-center gap-2"
        target="_blank"
        rel="noopener noreferrer"
      >
        <ExternalLink size={18} />
        Open Faucet
      </a>
    </div>
  );
}
