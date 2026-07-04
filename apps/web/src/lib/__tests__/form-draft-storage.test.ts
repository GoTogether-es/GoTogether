import { saveDraft, loadDraft, clearDraft } from '@/lib/form-draft-storage';

describe('form-draft-storage', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('round-trips an object through save and load', () => {
    saveDraft('key-1', { fullName: 'Juan', city: 'Málaga' });
    expect(loadDraft('key-1')).toEqual({ fullName: 'Juan', city: 'Málaga' });
  });

  it('returns null when the key does not exist', () => {
    expect(loadDraft('missing-key')).toBeNull();
  });

  it('returns null instead of throwing when the stored value is corrupt JSON', () => {
    sessionStorage.setItem('key-2', '{not-json');
    expect(loadDraft('key-2')).toBeNull();
  });

  it('removes the key on clearDraft', () => {
    saveDraft('key-3', 'some-value');
    clearDraft('key-3');
    expect(loadDraft('key-3')).toBeNull();
  });

  it('does not throw when sessionStorage.setItem fails', () => {
    const spy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota exceeded');
    });
    expect(() => saveDraft('key-4', 'value')).not.toThrow();
    spy.mockRestore();
  });
});
