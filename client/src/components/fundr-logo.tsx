import logoImage from "@assets/ChatGPT Image Jul 30, 2025, 09_17_22 AM_1753885236863.png";

interface FundrLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export default function FundrLogo({ className = "", size = "md" }: FundrLogoProps) {
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16", 
    lg: "w-24 h-24",
    xl: "w-32 h-32"
  };

  return (
    <img 
      src={logoImage}
      alt="Fundr Logo"
      className={`${sizeClasses[size]} ${className} object-contain`}
    />
  );
}