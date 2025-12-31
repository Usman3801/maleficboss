"use client";
import { useEffect } from "react";
import { ExternalLink, Link as LinkIcon } from "lucide-react";

export default function DemosFeatures() {
  useEffect(() => {
    window.location.href = "https://linktr.ee/demos_network";
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-20">
      <LinkIcon size={64} className="text-white mb-4 animate-pulse" />
      <h2 className="text-2xl font-bold mb-2">Redirecting to Demos Network...</h2>
      <p className="text-gray-400 mb-6">Taking you to our Linktree</p>
      <a
        href="https://linktr.ee/demos_network"
        className="btn-primary flex items-center gap-2"
        target="_blank"
        rel="noopener noreferrer"
      >
        <ExternalLink size={18} />
        Open Linktree
      </a>
    </div>
  );
}
