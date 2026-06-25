/**
 * entries store tests
 *
 * The real store depends on Firebase Firestore.
 * Here we mock the Firebase modules so we can test the context behaviour
 * without a live connection.
 */

import { act, renderHook } from '@testing-library/react-native';

// --- Firebase mocks -----------------------------------------------------------

const mockGetDocs = jest.fn();
const mockAddDoc = jest.fn();
const mockUpdateDoc = jest.fn();
const mockDeleteDoc = jest.fn();
const mockServerTimestamp = jest.fn(() => ({ _type: 'serverTimestamp' }));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(() => ({})),
  query: jest.fn((...args: unknown[]) => args),
  orderBy: jest.fn(),
  limit: jest.fn(),
  startAfter: jest.fn(),
  getDocs: (...args: unknown[]) => mockGetDocs(...args),
  addDoc: (...args: unknown[]) => mockAddDoc(...args),
  updateDoc: (...args: unknown[]) => mockUpdateDoc(...args),
  deleteDoc: (...args: unknown[]) => mockDeleteDoc(...args),
  doc: jest.fn(() => ({})),
  serverTimestamp: () => mockServerTimestamp(),
}));

jest.mock('../lib/firebase', () => ({
  db: {},
}));

// Mock auth: always return a dummy user
jest.mock('./auth', () => ({
  useAuth: () => ({ user: { uid: 'test-user' } }),
}));

// --- Helpers ------------------------------------------------------------------

import type React from 'react';
import { EntriesProvider, useEntries } from './entries';

function wrap({ children }: { children: React.ReactNode }) {
  return <EntriesProvider>{children}</EntriesProvider>;
}

function makeDocSnap(data: Record<string, unknown>, id: string) {
  return {
    id,
    data: () => data,
  };
}

function makeTimestamp() {
  return { toDate: () => new Date('2026-01-01') };
}

// --- Tests -------------------------------------------------------------------

describe('useEntries', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('starts with empty entries before reload', () => {
    const { result } = renderHook(() => useEntries(), { wrapper: wrap });
    expect(result.current.entries).toHaveLength(0);
    expect(result.current.isLoading).toBe(false);
  });

  it('loads entries via reload', async () => {
    const fakeDoc = makeDocSnap(
      {
        userId: 'test-user',
        icon: '☀️',
        title: 'テスト',
        body: '本文',
        date: makeTimestamp(),
        imageUrl: null,
        createdAt: makeTimestamp(),
        updatedAt: makeTimestamp(),
      },
      'entry-1',
    );
    mockGetDocs.mockResolvedValueOnce({ docs: [fakeDoc] });

    const { result } = renderHook(() => useEntries(), { wrapper: wrap });

    await act(async () => {
      await result.current.reload();
    });

    expect(result.current.entries).toHaveLength(1);
    expect(result.current.entries[0]).toMatchObject({
      id: 'entry-1',
      icon: '☀️',
      title: 'テスト',
    });
  });

  it('addEntry calls addDoc and reloads', async () => {
    mockAddDoc.mockResolvedValueOnce({});
    mockGetDocs.mockResolvedValueOnce({ docs: [] });

    const { result } = renderHook(() => useEntries(), { wrapper: wrap });

    await act(async () => {
      await result.current.addEntry({
        icon: '☕️',
        title: '新しい記録',
        body: 'テスト本文',
        date: new Date('2026-06-01'),
        imageUrl: null,
      });
    });

    expect(mockAddDoc).toHaveBeenCalledTimes(1);
    expect(mockGetDocs).toHaveBeenCalledTimes(1);
  });

  it('deleteEntry removes entry from state', async () => {
    const fakeDoc = makeDocSnap(
      {
        userId: 'test-user',
        icon: '🌧️',
        title: '削除テスト',
        body: '本文',
        date: makeTimestamp(),
        imageUrl: null,
        createdAt: makeTimestamp(),
        updatedAt: makeTimestamp(),
      },
      'entry-del',
    );
    mockGetDocs.mockResolvedValueOnce({ docs: [fakeDoc] });
    mockDeleteDoc.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useEntries(), { wrapper: wrap });

    await act(async () => {
      await result.current.reload();
    });

    expect(result.current.entries).toHaveLength(1);

    await act(async () => {
      await result.current.deleteEntry('entry-del');
    });

    expect(result.current.entries).toHaveLength(0);
    expect(mockDeleteDoc).toHaveBeenCalledTimes(1);
  });

  it('throws when used outside the provider', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useEntries())).toThrow(
      /useEntries must be used inside/,
    );
    spy.mockRestore();
  });
});
