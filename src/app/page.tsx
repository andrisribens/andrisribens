'use client';

import Image from 'next/image';

export default function Home() {
  return (
    <div className="projects">
      <div className="container">
        <div className="projects__list">
          <a href="/weather" className="projects__item">
            <Image
              src="/img/logo8.png"
              alt="Weather Now"
              width={300}
              height={300}
            />
            Weather Now
          </a>

          <a
            href="https://kingofthebeach.me"
            target="_blank"
            className="projects__item"
          >
            <div className="projects__item-image-wrap">
              <Image
                src="/img/kob-logo.svg"
                alt="King of The Beach"
                width={200}
                height={200}
              />
            </div>
            King Of The Beach
          </a>
        </div>
      </div>
    </div>
  );
}
