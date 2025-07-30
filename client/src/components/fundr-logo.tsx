interface FundrLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function FundrLogo({ className = "", size = "md" }: FundrLogoProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12", 
    lg: "w-16 h-16"
  };

  return (
    <div className={className}>
      <svg 
        className={sizeClasses[size]} 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Pie chart circle with segments matching your design */}
        <circle 
          cx="50" 
          cy="50" 
          r="45" 
          fill="none" 
          stroke="#1a1a1a" 
          strokeWidth="6"
        />
        
        {/* Orange segment (BONK color) - top left */}
        <path 
          d="M 50 5 A 45 45 0 0 1 85.36 64.64 L 50 50 Z" 
          fill="#FF9233" 
          stroke="#1a1a1a" 
          strokeWidth="3"
        />
        
        {/* Green segment (PumpFun color) - top right */}
        <path 
          d="M 85.36 64.64 A 45 45 0 0 1 14.64 64.64 L 50 50 Z" 
          fill="#00FFB2" 
          stroke="#1a1a1a" 
          strokeWidth="3"
        />
        
        {/* White segment - bottom */}
        <path 
          d="M 14.64 64.64 A 45 45 0 0 1 50 5 L 50 50 Z" 
          fill="white" 
          stroke="#1a1a1a" 
          strokeWidth="3"
        />
        
        {/* Center point */}
        <circle 
          cx="50" 
          cy="50" 
          r="4" 
          fill="#1a1a1a"
        />
      </svg>
    </div>
  );
}