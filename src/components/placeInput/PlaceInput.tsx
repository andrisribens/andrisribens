'use client';

import { searchPlaces, type Place } from '@/app/utilities/actions';
import { useDebounce } from '@/app/utilities/useDebounce';
import {
  buildPlaceQuery,
  formatPlaceSuggestionSubtitle,
  MIN_PLACE_QUERY_LENGTH,
  PLACE_SEARCH_LIMIT,
} from '@/app/utilities/placeSearch';
import { useRecentPlaces } from '@/hooks/useRecentPlaces';
import RecentPlaceChips from '../recentPlaces/RecentPlaceChips';
import styles from './PlaceInput.module.scss';
import React, {
  Suspense,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

const PlaceInputInner = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const listboxId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [hasSearched, setHasSearched] = useState(false);
  const [hasEdited, setHasEdited] = useState(false);

  const debouncedInput = useDebounce(inputValue, 300);
  const { recentPlaces, rememberPlace, removePlace, isLoaded } =
    useRecentPlaces();

  const urlPlaceName = searchParams.get('place') ?? '';

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    setActiveIndex(-1);
  }, []);

  useEffect(() => {
    setInputValue('');
    setHasEdited(false);
    closeDropdown();
    setSuggestions([]);
    setHasSearched(false);
    setError(null);
  }, [urlPlaceName, closeDropdown]);

  useEffect(() => {
    const query = debouncedInput.trim();

    if (query.length < MIN_PLACE_QUERY_LENGTH) {
      setSuggestions([]);
      setIsLoading(false);
      setHasSearched(false);
      setError(null);
      closeDropdown();
      return;
    }

    let alive = true;

    (async () => {
      setIsLoading(true);
      setError(null);
      setHasSearched(false);

      try {
        const places = await searchPlaces(query, PLACE_SEARCH_LIMIT);
        if (!alive) return;
        setSuggestions(places);
        setHasSearched(true);
        setActiveIndex(places.length > 0 ? 0 : -1);
      } catch {
        if (!alive) return;
        setSuggestions([]);
        setHasSearched(true);
        setError("Couldn't search places right now. Please try again.");
      } finally {
        if (alive) setIsLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [debouncedInput, closeDropdown]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        closeDropdown();
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [closeDropdown]);

  const selectPlace = useCallback(
    (place: Place) => {
      rememberPlace(place);
      setInputValue('');
      setHasEdited(false);
      closeDropdown();
      setSuggestions([]);
      setHasSearched(false);
      setError(null);
      router.push(
        buildPlaceQuery({
          name: place.name,
          lat: place.lat,
          lon: place.lon,
        }),
      );
    },
    [rememberPlace, router, closeDropdown],
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && event.key === 'ArrowDown' && suggestions.length > 0) {
      setIsOpen(true);
      setActiveIndex(0);
      event.preventDefault();
      return;
    }

    if (!isOpen) {
      if (event.key === 'Enter') {
        event.preventDefault();
      }
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) =>
        index < suggestions.length - 1 ? index + 1 : index,
      );
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => (index > 0 ? index - 1 : 0));
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      closeDropdown();
    }
  };

  const openDropdown = () => {
    if (inputValue.trim().length >= MIN_PLACE_QUERY_LENGTH && hasEdited) {
      setIsOpen(true);
    }
  };

  const showSuggestions =
    isOpen &&
    inputValue.trim().length >= MIN_PLACE_QUERY_LENGTH &&
    (isLoading || hasSearched || Boolean(error));

  const showRecent =
    isLoaded &&
    !showSuggestions &&
    inputValue.trim().length < MIN_PLACE_QUERY_LENGTH &&
    recentPlaces.length > 0;

  const showHint =
    inputValue.trim().length > 0 &&
    inputValue.trim().length < MIN_PLACE_QUERY_LENGTH &&
    !showSuggestions;

  return (
    <div className="container">
      <div className={styles.placeInput} ref={rootRef}>
        <div className={styles.placeInput__input}>
          <input
              ref={inputRef}
              name="input-place"
              type="search"
              role="combobox"
              aria-expanded={showSuggestions}
              aria-controls={listboxId}
              aria-autocomplete="list"
              aria-activedescendant={
                activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined
              }
              value={inputValue}
              onChange={(event) => {
                const value = event.target.value;
                setHasEdited(true);
                setInputValue(value);
                setError(null);

                if (value.trim().length >= MIN_PLACE_QUERY_LENGTH) {
                  setIsOpen(true);
                } else {
                  closeDropdown();
                  setSuggestions([]);
                  setHasSearched(false);
                }
              }}
              onFocus={openDropdown}
              onBlur={(event) => {
                const next = event.relatedTarget as Node | null;
                if (!next || !rootRef.current?.contains(next)) {
                  closeDropdown();
                }
              }}
              onKeyDown={handleKeyDown}
              placeholder="Search city or place"
              autoComplete="off"
            />

            <Image
              src="/img/search.svg"
              alt=""
              width={30}
              height={30}
              className={styles.placeInput__icon}
              aria-hidden
            />

            {isLoading && (
              <span className={styles.placeInput__spinner} aria-hidden />
            )}

          {showSuggestions && (
            <div
              id={listboxId}
              role="listbox"
              className={styles.placeInput__dropdown}
              aria-label="Place suggestions"
            >
              {isLoading && (
                <p className={styles.placeInput__message}>Searching places…</p>
              )}

              {!isLoading && error && (
                <p className={styles.placeInput__message} role="alert">
                  {error}
                </p>
              )}

              {!isLoading && !error && hasSearched && suggestions.length === 0 && (
                <p className={styles.placeInput__message}>No places found</p>
              )}

              {!isLoading &&
                !error &&
                suggestions.map((place, index) => (
                  <button
                    key={`${place.osm_id}-${index}`}
                    id={`${listboxId}-option-${index}`}
                    role="option"
                    type="button"
                    aria-selected={index === activeIndex}
                    className={
                      index === activeIndex
                        ? `${styles.placeCard} ${styles['placeCard--active']}`
                        : styles.placeCard
                    }
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => selectPlace(place)}
                  >
                    <span className={styles.placeCard__name}>{place.name}</span>
                    <span className={styles.placeCard__meta}>
                      {formatPlaceSuggestionSubtitle(place)}
                    </span>
                  </button>
                ))}
            </div>
          )}
        </div>

        <div className={styles.placeInput__helpers}>
          {showHint ? (
            <p className={styles.placeInput__hint}>
              Type at least {MIN_PLACE_QUERY_LENGTH} characters
            </p>
          ) : isLoaded && showRecent ? (
            <RecentPlaceChips
              places={recentPlaces}
              onRemove={removePlace}
              compact
            />
          ) : null}
        </div>
      </div>
    </div>
  );
};

const PlaceInput = () => {
  return (
    <Suspense fallback={null}>
      <PlaceInputInner />
    </Suspense>
  );
};

export default PlaceInput;
