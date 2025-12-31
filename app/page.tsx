"use client";

import { useState } from "react";
import { Coins, Rocket, TrendingUp, Send, BarChart3, ExternalLink, User, Droplet } from "lucide-react";
import AssetCreation from "@/components/AssetCreation";
import Trading from "@/components/Trading";
import TokenTransfer from "@/components/TokenTransfer";
import ContributionTracker from "@/components/ContributionTracker";
import DemosFeatures from "@/components/DemosFeatures";
import DashboardNew from "@/components/DashboardNew";
import Profile from "@/components/ProfileImproved";
import Faucet from "@/components/Faucet";
import Header from "@/components/Header";

export default function Home() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "trading", label: "Trading", icon: TrendingUp },
    { id: "create-assets", label: "Create Assets", icon: Coins },
    { id: "transfer", label: "Transfer", icon: Send },
    { id: "faucet", label: "Faucet", icon: Droplet },
    { id: "profile", label: "Profile", icon: User },
    { id: "contributions", label: "Contributions", icon: Rocket },
    { id: "features", label: "Demos Features", icon: ExternalLink },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard": return <DashboardNew />;
      case "trading": return <Trading />;
      case "create-assets": return <AssetCreation />;
      case "transfer": return <TokenTransfer />;
      case "faucet": return <Faucet />;
      case "profile": return <Profile />;
      case "contributions": return <ContributionTracker />;
      case "features": return <DemosFeatures />;
      default: return <DashboardNew />;
    }
  };

  return (
    <>
      <Header onNavigate={setActiveTab} currentTab={activeTab} />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">Demos Network</h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            The Omniweb
          </p>
        </div>

        <div className="min-h-[600px]">{renderContent()}</div>
      </div>
    </>
  );
}
