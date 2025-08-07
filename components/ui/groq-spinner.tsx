import React from "react";

const GroqSpinner: React.FC = () => (
  <div className="flex items-center gap-2">
    <div className="groq-spinner w-4 h-4 border-2 border-gray-300 border-t-[#00FF9D] rounded-full animate-spin"></div>
    <span className="text-[#00FF9D] text-sm font-medium">AI Thinking...</span>
  </div>
);

export default GroqSpinner; 