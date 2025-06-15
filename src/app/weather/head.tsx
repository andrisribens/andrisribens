export default function Head() {
  return (
    <>
      <title>Weather Now - Local Forecasts</title>
      <meta
        name="description"
        content="Live weather updates and forecasts by location."
      />
      <link rel="manifest" href="/img/weather/site.webmanifest" />

      {/* Custom Favicon */}
      <link rel="icon" href="/img/weather/favicon.ico" sizes="any" />
      <link rel="apple-touch-icon" href="/img/weather/apple-touch.png" />
      <meta name="theme-color" content="#00aaff" />

      {/* Open Graph / Social */}
      <meta property="og:title" content="Weather Now - Local Forecasts" />
      <meta
        property="og:description"
        content="Live weather updates and forecasts by location."
      />
      <meta
        property="og:image"
        content="https://andrisribens.com/og/weather.png"
      />
      <meta property="og:url" content="https://andrisribens.com/weather" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta
        name="twitter:image"
        content="https://andrisribens.com/og/weather.png"
      />
    </>
  );
}
