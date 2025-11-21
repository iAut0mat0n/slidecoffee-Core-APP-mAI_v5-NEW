import { useSystemSettings } from '@/lib/queries';

interface AppLogoProps {
  className?: string;
  showText?: boolean;
}

export default function AppLogo({ className = 'h-8', showText = true }: AppLogoProps) {
  const { data: settings } = useSystemSettings();
  const logoUrl = settings?.app_logo_url || '/logo.png';

  return (
    <div className="flex items-center gap-2">
      <img
        src={logoUrl}
        alt="SlideCoffee"
        className={className}
        onError={(e) => {
          // Fallback to default logo if custom logo fails to load
          e.currentTarget.src = '/logo.png';
        }}
      />
      {showText && (
        <span className="text-xl font-bold">SlideCoffee</span>
      )}
    </div>
  );
}

