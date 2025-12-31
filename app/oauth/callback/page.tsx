"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { handleOAuthCallback } from "@/lib/oauth";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

function OAuthCallbackContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Processing authentication...");

  useEffect(() => {
    const processCallback = async () => {
      try {
        const code = searchParams.get("code");
        const state = searchParams.get("state");
        const platform = sessionStorage.getItem("oauth_platform") as
          | "twitter"
          | "discord"
          | "github";

        if (!code || !state || !platform) {
          throw new Error("Invalid OAuth callback parameters");
        }

        // Handle OAuth callback
        const connection = await handleOAuthCallback(code, state, platform);

        setStatus("success");
        setMessage(
          `Successfully connected to ${platform}! Username: @${connection.username}`
        );

        // Close popup after 2 seconds
        setTimeout(() => {
          window.close();
        }, 2000);
      } catch (error: any) {
        console.error("OAuth callback error:", error);
        setStatus("error");
        setMessage(error.message || "Authentication failed. Please try again.");

        // Close popup after 3 seconds
        setTimeout(() => {
          window.close();
        }, 3000);
      }
    };

    processCallback();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="bg-[#0A0A0A] border border-[#22222299] rounded-2xl p-8 max-w-md w-full text-center">
        {status === "loading" && (
          <>
            <Loader2 className="animate-spin mx-auto mb-4" size={48} />
            <p className="text-white text-lg">{message}</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="mx-auto mb-4 text-green-500" size={48} />
            <p className="text-white text-lg mb-2">Success!</p>
            <p className="text-gray-400 text-sm">{message}</p>
            <p className="text-gray-500 text-xs mt-4">
              This window will close automatically...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="mx-auto mb-4 text-red-500" size={48} />
            <p className="text-white text-lg mb-2">Error</p>
            <p className="text-gray-400 text-sm">{message}</p>
            <p className="text-gray-500 text-xs mt-4">
              This window will close automatically...
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default function OAuthCallback() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
          <div className="bg-[#0A0A0A] border border-[#22222299] rounded-2xl p-8 max-w-md w-full text-center">
            <Loader2 className="animate-spin mx-auto mb-4" size={48} />
            <p className="text-white text-lg">Loading...</p>
          </div>
        </div>
      }
    >
      <OAuthCallbackContent />
    </Suspense>
  );
}
