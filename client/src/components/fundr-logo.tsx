import logoImagePath from "@assets/Fundr Logo Design with Pie Chart_1753848859200.png";

interface FundrLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  pieOnly?: boolean;
}

export default function FundrLogo({ className = "", size = "md", pieOnly = false }: FundrLogoProps) {
  const logoSizes = {
    sm: "h-8",
    md: "h-12", 
    lg: "h-20"
  };

  if (pieOnly) {
    // Show only the pie chart part - crop the image to just show the top circle
    return (
      <div className={`${className} ${logoSizes[size]} aspect-square overflow-hidden relative`}>
        <img 
          src={logoImagePath}
          alt="Fundr Pie Chart"
          className="absolute inset-0 w-full h-auto object-cover"
          style={{
            transform: 'scale(1.8) translateY(-15%)', // Scale up and shift to show only pie
            transformOrigin: 'center center'
          }}
        />
      </div>
    );
  }

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