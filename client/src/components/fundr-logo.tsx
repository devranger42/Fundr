import logoImagePath from "@assets/Fundr Logo Design with Pie Chart_1753848859200.png";

interface FundrLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function FundrLogo({ className = "", size = "md" }: FundrLogoProps) {
  const logoSizes = {
    sm: "h-8",
    md: "h-12", 
    lg: "h-16"
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl"
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <img 
        src={logoImagePath}
        alt="Fundr Logo"
        className={`${logoSizes[size]} w-auto object-contain`}
      />
      
      <span className={`font-bold ${
        className.includes("text-white") ? "text-white" : "text-gray-900"
      } ${textSizes[size]}`}>
        Fundr
      </span>
    </div>
  );
}