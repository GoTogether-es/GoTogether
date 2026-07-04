export function saveDraft<T>(key: string, data: T): void {
  try {
    sessionStorage.setItem(key, JSON.stringify(data));
  } catch (err: unknown) {
    if (process.env.NODE_ENV === 'development') console.error(`Failed to save draft "${key}":`, err);
  }
}

export function loadDraft<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch (err: unknown) {
    if (process.env.NODE_ENV === 'development') console.error(`Failed to load draft "${key}":`, err);
    return null;
  }
}

export function clearDraft(key: string): void {
  try {
    sessionStorage.removeItem(key);
  } catch (err: unknown) {
    if (process.env.NODE_ENV === 'development') console.error(`Failed to clear draft "${key}":`, err);
  }
}
