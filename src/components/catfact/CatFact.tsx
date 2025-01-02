import React, { Suspense } from 'react';
import styles from './CatFact.module.scss';
import { getCatFact } from '@/app/utilities/actions';

const CatFact = async () => {
  const catFact = await getCatFact();

  return (
    <>
      <Suspense
        fallback={
          <div>
            <h1>Loading...</h1>
          </div>
        }
      >
        <div className={styles.catFact}>
          <h2 className={styles.catFact__fact}>{catFact.fact}</h2>
          <p>
            This is <span>{catFact.length}</span> characters long fact
          </p>
        </div>
      </Suspense>
    </>
  );
};

export default CatFact;
