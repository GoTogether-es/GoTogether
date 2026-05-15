import { useEffect, useState } from 'react';
import { getHealth } from '@/services/api';

export function useApiHealth() {
  const [status, setStatus] = useState<'idle' | 'ok' | 'error'>('idle');

  useEffect(() => {
    getHealth()
      .then(() => setStatus('ok'))
      .catch(() => setStatus('error'));
  }, []);

  return status;
}
