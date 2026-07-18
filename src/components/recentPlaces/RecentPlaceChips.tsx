'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from './RecentPlaceChips.module.scss';
import { buildPlaceQuery, type RecentPlace } from '@/app/utilities/placeSearch';

type RecentPlaceChipsProps = {
  places: RecentPlace[];
  title?: string;
  onRemove?: (place: RecentPlace) => void;
  compact?: boolean;
};

const RecentPlaceChips = ({
  places,
  title = 'Recent',
  onRemove,
  compact = false,
}: RecentPlaceChipsProps) => {
  const router = useRouter();

  if (!places.length) return null;

  const selectPlace = (place: RecentPlace) => {
    router.push(
      buildPlaceQuery({
        name: place.name,
        lat: place.lat,
        lon: place.lon,
      }),
    );
  };

  return (
    <div
      className={
        compact
          ? `${styles.recentPlaces} ${styles['recentPlaces--compact']}`
          : styles.recentPlaces
      }
    >
      <p className={styles.recentPlaces__title}>{title}</p>
      <div className={styles.recentPlaces__list}>
        {places.map((place) => (
          <div
            className={styles.recentPlaces__chip}
            key={`${place.osm_id}-${place.lat}-${place.lon}`}
          >
            <button
              type="button"
              className={styles.recentPlaces__name}
              onPointerDown={(event) => {
                event.preventDefault();
                selectPlace(place);
              }}
            >
              {place.name}
            </button>

            {onRemove && (
              <button
                type="button"
                className={styles.recentPlaces__close}
                onPointerDown={(event) => {
                  event.preventDefault();
                  onRemove(place);
                }}
                aria-label={`Remove ${place.name}`}
              >
                <Image src="/img/close.svg" alt="" width={15} height={15} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentPlaceChips;
