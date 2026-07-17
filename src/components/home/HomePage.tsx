'use client';

import {
  useCallback,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from 'react';
import * as motion from 'motion/react-client';
import styles from './HomePage.module.scss';

const ease = [0.22, 1, 0.36, 1] as const;
const MOBILE_MQ = '(max-width: 900px)';
const REDUCE_MQ = '(prefers-reduced-motion: reduce)';

const fade = {
  hidden: { opacity: 0, y: 10 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.06 + i * 0.06, duration: 0.5, ease },
  }),
};

const linkFade = {
  hidden: { opacity: 0, y: 14 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.2 + i * 0.05, duration: 0.45, ease },
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

function isExternalHref(href: string) {
  return /^https?:\/\//i.test(href);
}

function ProjectLink({
  project,
  index,
  step,
  spotlight,
  motionIndex,
}: {
  project: Project;
  index: number;
  step: number;
  spotlight: boolean;
  motionIndex: number;
}) {
  const label = String(index).padStart(2, '0');
  const external = isExternalHref(project.href);
  const className = spotlight
    ? `${styles.link} ${styles.spotlight}`
    : styles.link;

  return (
    <motion.a
      className={className}
      href={project.href}
      {...(external
        ? { target: '_blank', rel: 'noopener noreferrer' }
        : {})}
      style={{ '--step': step } as React.CSSProperties}
      data-home-link
      custom={motionIndex}
      variants={linkFade}
      initial="hidden"
      animate="show"
    >
      <span className={styles.index}>{label}</span>
      <span className={styles.name}>{project.name}</span>
      <span className={styles.arrow} aria-hidden>
        →
      </span>
    </motion.a>
  );
}

const HomePage = () => {
  const [drawn, setDrawn] = useState(false);
  const [spotlightHref, setSpotlightHref] = useState<string | null>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia(REDUCE_MQ).matches;
    if (reduce) {
      setDrawn(true);
      return;
    }
    const id = requestAnimationFrame(() => setDrawn(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const updateSpotlight = useEffectEvent(() => {
    const root = pageRef.current;
    if (!root) return;

    const mobile = window.matchMedia(MOBILE_MQ).matches;
    const reduce = window.matchMedia(REDUCE_MQ).matches;
    if (!mobile || reduce) {
      setSpotlightHref(null);
      return;
    }

    const links = root.querySelectorAll<HTMLElement>('[data-home-link]');
    if (!links.length) return;

    const targetY = window.innerHeight * 0.4;
    let bestHref: string | null = null;
    let bestDist = Infinity;

    links.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      const mid = rect.top + rect.height / 2;
      const dist = Math.abs(mid - targetY);
      if (dist < bestDist) {
        bestDist = dist;
        bestHref = el.getAttribute('href');
      }
    });

    setSpotlightHref(bestHref);
  });

  const scheduleSpotlight = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => updateSpotlight());
  }, [updateSpotlight]);

  useEffect(() => {
    const root = pageRef.current;
    if (!root) return;

    scheduleSpotlight();

    const onScroll = () => scheduleSpotlight();
    const onResize = () => scheduleSpotlight();

    root.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);

    const mobileMq = window.matchMedia(MOBILE_MQ);
    const reduceMq = window.matchMedia(REDUCE_MQ);
    const onMq = () => scheduleSpotlight();
    mobileMq.addEventListener('change', onMq);
    reduceMq.addEventListener('change', onMq);

    return () => {
      cancelAnimationFrame(rafRef.current);
      root.removeEventListener('scroll', onScroll);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      mobileMq.removeEventListener('change', onMq);
      reduceMq.removeEventListener('change', onMq);
    };
  }, [scheduleSpotlight]);

  return (
    <div className={styles.page} ref={pageRef}>
      <div className={styles.atmosphere} aria-hidden>
        <div className={styles.wash} />
        <div className={`${styles.grid} ${drawn ? styles.visible : ''}`} />
        <div className={styles.grain} />
      </div>

      <div className={styles.frame}>
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

        <div
          className={`${styles.rule} ${drawn ? styles.visible : ''}`}
          aria-hidden
        />

        <div className={styles.lists}>
          <nav className={styles.group} aria-label="Personal">
            <motion.p
              className={styles.groupLabel}
              custom={1}
              variants={fade}
              initial="hidden"
              animate="show"
            >
              Personal
            </motion.p>
            <div className={styles.work}>
              {personal.map((project, i) => (
                <ProjectLink
                  key={project.href}
                  project={project}
                  index={i + 1}
                  step={i}
                  motionIndex={i}
                  spotlight={spotlightHref === project.href}
                />
              ))}
            </div>
          </nav>

          <nav className={styles.group} aria-label="Work">
            <motion.p
              className={styles.groupLabel}
              custom={2}
              variants={fade}
              initial="hidden"
              animate="show"
            >
              Work
            </motion.p>
            <div className={styles.work}>
              {clientWork.map((project, i) => (
                <ProjectLink
                  key={project.href}
                  project={project}
                  index={i + 1}
                  step={personal.length + i}
                  motionIndex={personal.length + i}
                  spotlight={spotlightHref === project.href}
                />
              ))}
            </div>
          </nav>
        </div>

        <motion.a
          className={styles.contact}
          href="mailto:andris.ribens@gmail.com"
          custom={3}
          variants={fade}
          initial="hidden"
          animate="show"
        >
          <span className={styles.contactLabel}>Contact</span>
          <span className={styles.contactMail}>andris.ribens@gmail.com</span>
        </motion.a>

        <motion.p
          className={styles.closer}
          custom={4}
          variants={fade}
          initial="hidden"
          animate="show"
        >
          Based in Amsterdam
        </motion.p>
      </div>
    </div>
  );
};

export default HomePage;
