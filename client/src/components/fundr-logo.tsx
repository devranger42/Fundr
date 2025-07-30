import logoImagePath from "@assets/Fundr Logo Design with Pie Chart_1753848859200.png";

interface FundrLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function FundrLogo({ className = "", size = "md" }: FundrLogoProps) {
  const logoSizes = {
    sm: "h-8",
    md: "h-12", 
    lg: "h-20"
  };

  return (
    <div className={className}>
      <img 
        src={logoImagePath}
        alt="Fundr Logo"
        className={`${logoSizes[size]} w-auto object-contain`}
      />
    </div>
  );
}