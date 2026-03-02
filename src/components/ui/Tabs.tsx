import React, { useState } from 'react';

interface Tab {
  id: string;
  label: string;
  icon?: React.ElementType; 
  content: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  className?: string;
}

export function Tabs({ tabs, defaultTab, className = '' }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0].id);

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Tab Headers - ChessBotBuddies Navy Theme */}
      <div className="flex border-b border-[#3a4a6e] bg-[#1a2744]">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex-1 py-3 px-4 flex items-center justify-center gap-2
                text-sm font-bold transition-colors relative
                ${isActive 
                  ? 'text-[#5ec2f2] bg-[#243354]' 
                  : 'text-[#a8b4ce] hover:text-white hover:bg-[#243354]/50'}
              `}
            >
              {Icon && <Icon size={16} />}
              {tab.label}
              {isActive && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#5ec2f2]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden relative bg-[#1a2744]">
        {tabs.map((tab) => (
            <div 
                key={tab.id} 
                className={`absolute inset-0 overflow-auto transition-opacity duration-200 ${activeTab === tab.id ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}
            >
                {tab.content}
            </div>
        ))}
      </div>
    </div>
  );
}
