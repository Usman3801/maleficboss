"use client";
import { useState } from "react";
import { Menu, X, Droplet, TrendingUp, Coins, ExternalLink } from "lucide-react";

interface HamburgerMenuProps {
  onNavigate: (tab: string) => void;
  currentTab: string;
}

export default function HamburgerMenu({ onNavigate, currentTab }: HamburgerMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: "faucet", label: "Faucet", icon: Droplet },
    { id: "trading", label: "Trading", icon: TrendingUp },
    { id: "create-assets", label: "Create Assets", icon: Coins },
    { id: "features", label: "Demos Features", icon: ExternalLink },
  ];

  const handleNavigation = (tabId: string) => {
    onNavigate(tabId);
    setIsOpen(false);
  };

  return (
    <>
      {/* Demos Logo/Brand - Clickable to go to dashboard */}
      <button
        onClick={() => handleNavigation("dashboard")}
        className="text-xl font-bold hover:text-gray-300 transition-colors"
      >
        Demos
      </button>

      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-zinc-800 rounded-lg transition-colors ml-4"
        aria-label="Menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Menu Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-[90]"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Menu Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-[#0A0A0A] border-r border-[#22222299] z-[100] transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold">Menu</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Menu Items */}
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-white text-black'
                      : 'hover:bg-zinc-800 text-white'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="absolute bottom-6 left-6 right-6">
            <div className="p-4 bg-zinc-900 border border-white/10 rounded-lg">
              <p className="text-xs text-gray-400">
                Demos Network - The Omniweb
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
