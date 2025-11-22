import { useSystemSettings } from '../lib/queries';
import CoffeeCupIcon from './CoffeeCupIcon';

interface AppLogoProps {
  className?: string;
  showText?: boolean;
  iconClassName?: string;
}

export default function AppLogo({ className = '', showText = true, iconClassName = 'w-8 h-8' }: AppLogoProps) {
  const { data: settings } = useSystemSettings();
  const logoUrl = settings?.app_logo_url || null;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {logoUrl ? (
        <img
          src={logoUrl}
          alt="SlideCoffee"
          className={iconClassName}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      ) : (
        <CoffeeCupIcon className={iconClassName} />
      )}
      {showText && (
        <span className="text-xl font-bold text-gray-900">SlideCoffee</span>
      )}
    </div>
  );
}

