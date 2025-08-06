import React from "react";

const DemoBanner: React.FC = () => (
  <div className="demo-banner fixed top-0 left-0 w-full bg-yellow-100 text-yellow-800 p-2 text-center z-50 animate-fade-in">
    DEMO MODE: Simulating Hedera HCS -
    <a href="#real-integration" className="underline ml-1">
      See Real Integration Plan
    </a>
  </div>
);

export default DemoBanner; 