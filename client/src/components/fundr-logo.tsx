interface FundrLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  backgroundColor?: string;
}

export default function FundrLogo({ className = "", size = "md", backgroundColor = "#1a2332" }: FundrLogoProps) {
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16", 
    lg: "w-24 h-24",
    xl: "w-32 h-32"
  };

  return (
    <svg 
      className={`${sizeClasses[size]} ${className}`}
      viewBox="0 0 200 200" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Orange segment (left side) */}
      <path 
        d="M 100 20 A 80 80 0 0 1 100 180 L 100 100 Z" 
        fill="#FF9233" 
        stroke="#1a2332" 
        strokeWidth="8"
        strokeLinejoin="round"
      />
      
      {/* Green segment (top right) */}
      <path 
        d="M 100 20 A 80 80 0 0 1 156.56 143.43 L 100 100 Z" 
        fill="#00FFB2" 
        stroke="#1a2332" 
        strokeWidth="8"
        strokeLinejoin="round"
      />
      
      {/* Dark background segment (bottom right) */}
      <path 
        d="M 156.56 143.43 A 80 80 0 0 1 100 180 L 100 100 Z" 
        fill={backgroundColor} 
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
  );
}