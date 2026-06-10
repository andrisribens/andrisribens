import type { Metadata } from 'next';
import '../../styles/globals.scss';

export const metadata: Metadata = {
  title: 'Weather Now - Local Forecasts',
  description: 'Live weather updates and forecasts by location.',
  manifest: '/img/weather/site.webmanifest',
  openGraph: {
    title: 'Weather Now - Local Forecasts',
    description: 'Live weather updates and forecasts by location.',
    url: '/weather',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Weather Now - Local Forecasts',
    description: 'Live weather updates and forecasts by location.',
  },
};

export default function WeatherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
