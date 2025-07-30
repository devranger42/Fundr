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
    <div className={className}>
      <svg 
        className={sizeClasses[size]} 
        viewBox="0 0 200 200" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Orange segment (left half) */}
        <path 
          d="M 100 20 A 80 80 0 0 1 100 180 L 100 100 Z" 
          fill="#FF9233" 
          stroke="#1a2332" 
          strokeWidth="8"
          strokeLinejoin="round"
        />
        
        {/* Green segment (top right quarter) */}
        <path 
          d="M 100 20 A 80 80 0 0 1 156.56 143.43 L 100 100 Z" 
          fill="#00FFB2" 
          stroke="#1a2332" 
          strokeWidth="8"
          strokeLinejoin="round"
        />
        
        {/* White segment (bottom right quarter) */}
        <path 
          d="M 156.56 143.43 A 80 80 0 0 1 100 180 L 100 100 Z" 
          fill="white" 
          stroke="#1a2332" 
          strokeWidth="8"
          strokeLinejoin="round"
        />
        
        {/* Outer circle border */}
        <circle 
          cx="100" 
          cy="100" 
          r="80" 
          fill="none" 
          stroke="#1a2332" 
          strokeWidth="8"
        />
        
        {/* Center point */}
        <circle 
          cx="100" 
          cy="100" 
          r="6" 
          fill="#1a2332"
        />
      </svg>
    </div>
  );
}