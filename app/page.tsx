"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Launchpad from "@/components/Launchpad";
import Trading from "@/components/Trading";
import TokenTransfer from "@/components/TokenTransfer";
import DemosFeatures from "@/components/DemosFeatures";
import Dashboard from "@/components/Dashboard";
import Faucet from "@/components/Faucet";

export default function Home() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard": return <Dashboard />;
      case "trading": return <Trading />;
      case "launchpad": return <Launchpad />;
      case "transfer": return <TokenTransfer />;
      case "faucet": return <Faucet />;
      case "features": return <DemosFeatures />;
      default: return <Dashboard />;
    }
  };

  const handleNavigate = (tab: string) => {
    setActiveTab(tab);
  };

  const handleHomeClick = () => {
    setActiveTab("dashboard");
  };

  return (
    <>
      <Header onNavigate={handleNavigate} onHomeClick={handleHomeClick} />
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
