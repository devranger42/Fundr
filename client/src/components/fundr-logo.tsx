import logoPath from "@assets/ChatGPT Image Jul 30, 2025, 12_46_08 AM_1753850776140.png";

interface FundrLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export default function FundrLogo({ className = "", size = "md" }: FundrLogoProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12", 
    lg: "w-16 h-16",
    xl: "w-20 h-20"
  };

  return (
    <img
      src={logoPath}
      alt="Fundr Logo"
      className={`${sizeClasses[size]} ${className} bg-white rounded-full`}
      style={{ objectFit: 'contain' }}
    />
  );
}