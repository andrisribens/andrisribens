import type { Metadata } from 'next';
import '../../styles/globals.scss';

export const metadata: Metadata = {
  title: 'Weather Now - Local Forecasts',
  description: 'Live weather updates and forecasts by location.',
  openGraph: {
    title: 'Weather Now - Local Forecasts',
    description: 'Live weather updates and forecasts by location.',
    url: 'https://andrisribens.com/weather',
    images: [
      {
        url: 'https://andrisribens.com/og/weather.png',
        width: 1200,
        height: 630,
        alt: 'Weather Forecast Screenshot',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Weather Now - Local Forecasts',
    description: 'Live weather updates and forecasts by location.',
    images: ['https://andrisribens.com/og/weather.png'],
  },
};

export default function WeatherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
