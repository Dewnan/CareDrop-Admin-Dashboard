import { useState, useEffect } from 'react';
import { dataService } from '../services/dataService';

export function useLiveData() {
  const [snapshot, setSnapshot] = useState(() => dataService.getSnapshot());

  useEffect(() => {
    // Sync initial snapshot
    setSnapshot(dataService.getSnapshot());

    // Subscribe to live data updates from Firestore
    const unsubscribe = dataService.subscribe(() => {
      setSnapshot(dataService.getSnapshot());
    });

    return unsubscribe;
  }, []);

  return snapshot;
}
