import logoImage from "@assets/ChatGPT Image Jul 30, 2025, 09_17_22 AM_1753885236863.png";

interface FundrLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export default function FundrLogo({ className = "", size = "md" }: FundrLogoProps) {
  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-20 h-20", 
    lg: "w-28 h-28",
    xl: "w-36 h-36"
  };

  return (
    <img 
      src={logoImage}
      alt="Fundr Logo"
      className={`${sizeClasses[size]} ${className} object-contain`}
    />
  );
}