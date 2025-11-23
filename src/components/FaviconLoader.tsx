import { useEffect } from 'react';
import { useSystemSettings } from '../lib/queries';

export default function FaviconLoader() {
  const { data: settings } = useSystemSettings();

  useEffect(() => {
    const faviconUrl = settings?.app_favicon_url;
    
    if (faviconUrl) {
      // Update favicon dynamically
      const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (link) {
        link.href = faviconUrl;
      } else {
        // Create favicon link if it doesn't exist
        const newLink = document.createElement('link');
        newLink.rel = 'icon';
        newLink.type = 'image/svg+xml';
        newLink.href = faviconUrl;
        document.head.appendChild(newLink);
      }
    }
  }, [settings]);

  return null; // This component doesn't render anything
}
