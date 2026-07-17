'use client';

import { useEffect, useState } from 'react';
import * as motion from 'motion/react-client';
import styles from './HomePage.module.scss';

const ease = [0.22, 1, 0.36, 1] as const;

const fade = {
  hidden: { opacity: 0, y: 10 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.06 + i * 0.06, duration: 0.5, ease },
  }),
};

type Project = {
  name: string;
  href: string;
};

const personal: Project[] = [
  { name: 'Weather Now', href: '/weather' },
  {
    name: 'King of The Beach',
    href: 'https://kingofthebeach.me',
  },
];

const clientWork: Project[] = [
  {
    name: 'SoftwareCentral',
    href: 'https://softwarecentral.com/',
  },
  { name: 'Caballero', href: 'https://www.caballero.lv/' },
  {
    name: 'Baltic Travel Group',
    href: 'https://www.baltic.travel/',
  },
  { name: 'OWOOD', href: 'https://www.owood.lv/en/' },
  { name: 'Latvia.eu', href: 'https://www.latvia.eu/' },
  { name: 'Ekobaze', href: 'https://www.ekobaze.lv/' },
];

function ProjectLink({
  project,
  index,
  step,
}: {
  project: Project;
  index: number;
  step: number;
}) {
  const label = String(index).padStart(2, '0');

  return (
    <a
      className={styles.link}
      href={project.href}
      target="_blank"
      rel="noopener noreferrer"
      style={{ '--step': step } as React.CSSProperties}
    >
      <span className={styles.index}>{label}</span>
      <span className={styles.name}>{project.name}</span>
      <span className={styles.arrow} aria-hidden>
        →
      </span>
    </a>
  );
}

const HomePage = () => {
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setDrawn(true);
      return;
    }
    const id = requestAnimationFrame(() => setDrawn(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.atmosphere} aria-hidden>
        <div className={styles.wash} />
        <div className={`${styles.grid} ${drawn ? styles.visible : ''}`} />
        <div className={styles.grain} />
      </div>

      <div className={styles.frame}>
        <div className={styles.top}>
          <motion.header
            className={styles.intro}
            custom={0}
            variants={fade}
            initial="hidden"
            animate="show"
          >
            <h1 className={styles.maker}>Andris Rībens</h1>
            <p className={styles.line}>Frontend developer</p>
          </motion.header>

          <motion.a
            className={styles.contact}
            href="mailto:andris.ribens@gmail.com"
            custom={0}
            variants={fade}
            initial="hidden"
            animate="show"
          >
            <span className={styles.contactLabel}>Contact</span>
            <span className={styles.contactMail}>andris.ribens@gmail.com</span>
          </motion.a>
        </div>

        <div
          className={`${styles.rule} ${drawn ? styles.visible : ''}`}
          aria-hidden
        />

        <motion.div
          className={styles.lists}
          custom={1}
          variants={fade}
          initial="hidden"
          animate="show"
        >
          <nav className={styles.group} aria-label="Personal">
            <p className={styles.groupLabel}>Personal</p>
            <div className={styles.work}>
              {personal.map((project, i) => (
                <ProjectLink
                  key={project.href}
                  project={project}
                  index={i + 1}
                  step={i}
                />
              ))}
            </div>
          </nav>

          <nav className={styles.group} aria-label="Work">
            <p className={styles.groupLabel}>Work</p>
            <div className={styles.work}>
              {clientWork.map((project, i) => (
                <ProjectLink
                  key={project.href}
                  project={project}
                  index={i + 1}
                  step={personal.length + i}
                />
              ))}
            </div>
          </nav>
        </motion.div>
      </div>
    </div>
  );
};

export default HomePage;
