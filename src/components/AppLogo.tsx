import { useSystemSettings } from '../lib/queries';

interface AppLogoProps {
  className?: string;
  showText?: boolean;
}

export default function AppLogo({ className = 'h-8', showText = true }: AppLogoProps) {
  const { data: settings } = useSystemSettings();
  const logoUrl = settings?.app_logo_url || null;

  return (
    <div className="flex items-center gap-2">
      {logoUrl ? (
        <img
          src={logoUrl}
          alt="SlideCoffee"
          className={className}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      ) : (
        <div className="text-3xl">☕</div>
      )}
      {showText && (
        <span className="text-xl font-bold">SlideCoffee</span>
      )}
    </div>
  );
}

