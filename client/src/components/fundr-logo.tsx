interface FundrLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function FundrLogo({ className = "", size = "md" }: FundrLogoProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12", 
    lg: "w-20 h-20"
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <svg 
        className={sizeClasses[size]} 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Pie chart circle with segments */}
        <circle 
          cx="50" 
          cy="50" 
          r="45" 
          fill="none" 
          stroke="#1f2937" 
          strokeWidth="4"
        />
        
        {/* Orange segment (BONK color) */}
        <path 
          d="M 50 5 A 45 45 0 0 1 85.36 64.64 L 50 50 Z" 
          fill="#FF9233" 
          stroke="#1f2937" 
          strokeWidth="2"
        />
        
        {/* Green segment (PumpFun color) */}
        <path 
          d="M 85.36 64.64 A 45 45 0 0 1 14.64 64.64 L 50 50 Z" 
          fill="#00FFB2" 
          stroke="#1f2937" 
          strokeWidth="2"
        />
        
        {/* White segment */}
        <path 
          d="M 14.64 64.64 A 45 45 0 0 1 50 5 L 50 50 Z" 
          fill="white" 
          stroke="#1f2937" 
          strokeWidth="2"
        />
        
        {/* Center point */}
        <circle 
          cx="50" 
          cy="50" 
          r="3" 
          fill="#1f2937"
        />
      </svg>
      
      <span className={`font-bold ${
        className.includes("text-white") ? "text-white" : "text-gray-900"
      } ${
        size === "sm" ? "text-lg" : 
        size === "md" ? "text-2xl" : 
        "text-4xl"
      }`}>
        Fundr
      </span>
    </div>
  );
}