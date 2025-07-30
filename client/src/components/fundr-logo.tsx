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
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer ring */}
        <circle 
          cx="50" 
          cy="50" 
          r="47" 
          fill="none" 
          stroke="#1a2332" 
          strokeWidth="6"
        />
        
        {/* Orange segment (left side, ~50%) */}
        <path 
          d="M 50 3 A 47 47 0 1 1 49.9 50 L 50 50 Z" 
          fill="#FF9233" 
          stroke="#1a2332" 
          strokeWidth="3"
          strokeLinejoin="round"
        />
        
        {/* Green segment (top right, ~35%) */}
        <path 
          d="M 50 3 A 47 47 0 0 1 85.3 61.8 L 50 50 Z" 
          fill="#00FFB2" 
          stroke="#1a2332" 
          strokeWidth="3"
          strokeLinejoin="round"
        />
        
        {/* White segment (bottom right, ~15%) */}
        <path 
          d="M 85.3 61.8 A 47 47 0 0 1 49.9 50 L 50 50 Z" 
          fill="white" 
          stroke="#1a2332" 
          strokeWidth="3"
          strokeLinejoin="round"
        />
        
        {/* Center point */}
        <circle 
          cx="50" 
          cy="50" 
          r="3" 
          fill="#1a2332"
        />
      </svg>
    </div>
  );
}