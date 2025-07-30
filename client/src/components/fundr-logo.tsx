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
    lg: "h-16"
  };

  if (pieOnly) {
    // Use a cropped version focused on just the pie chart part
    return (
      <div className={className}>
        <div 
          className={`${logoSizes[size]} w-auto bg-no-repeat bg-contain bg-center`}
          style={{
            backgroundImage: `url(${logoImagePath})`,
            backgroundPosition: 'center top',
            backgroundSize: 'auto 200%', // Zoom in to crop out the text
            aspectRatio: '1'
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