import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import {
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  Timestamp,
  type QueryDocumentSnapshot,
  type DocumentData,
} from 'firebase/firestore';

import { db } from '../lib/firebase';
import { useAuth } from './auth';
import { PAGE_SIZE } from '../constants/config';
import type { Entry, EntryInput } from '../types/entry';

type EntriesContextValue = {
  entries: Entry[];
  hasMore: boolean;
  isLoading: boolean;
  error: string | null;
  loadMore: () => Promise<void>;
  reload: () => Promise<void>;
  addEntry: (input: EntryInput) => Promise<void>;
  updateEntry: (id: string, input: EntryInput) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
};

const EntriesContext = createContext<EntriesContextValue | null>(null);

function toDate(value: unknown): Date {
  if (value instanceof Timestamp) return value.toDate();
  if (value instanceof Date) return value;
  return new Date();
}

function docToEntry(docSnap: QueryDocumentSnapshot<DocumentData>): Entry {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    userId: data.userId as string,
    icon: data.icon as string,
    title: data.title as string,
    body: data.body as string,
    date: toDate(data.date),
    imageUrl: (data.imageUrl as string | null) ?? null,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}

export function EntriesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);

  const getEntriesRef = useCallback(() => {
    if (!user) throw new Error('Not authenticated');
    return collection(db, 'users', user.uid, 'entries');
  }, [user]);

  const reload = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      const ref = getEntriesRef();
      const q = query(ref, orderBy('date', 'desc'), limit(PAGE_SIZE));
      const snapshot = await getDocs(q);
      const fetched = snapshot.docs.map(docToEntry);
      setEntries(fetched);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1] ?? null);
      setHasMore(snapshot.docs.length === PAGE_SIZE);
    } catch (err) {
      setError('データの読み込みに失敗しました');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [user, getEntriesRef]);

  const loadMore = useCallback(async () => {
    if (!user || isLoading || !hasMore) return;
    setIsLoading(true);
    setError(null);
    try {
      const ref = getEntriesRef();
      const q = lastDoc
        ? query(ref, orderBy('date', 'desc'), startAfter(lastDoc), limit(PAGE_SIZE))
        : query(ref, orderBy('date', 'desc'), limit(PAGE_SIZE));
      const snapshot = await getDocs(q);
      const fetched = snapshot.docs.map(docToEntry);
      setEntries((prev) => [...prev, ...fetched]);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1] ?? null);
      setHasMore(snapshot.docs.length === PAGE_SIZE);
    } catch (err) {
      setError('データの読み込みに失敗しました');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [user, isLoading, hasMore, lastDoc, getEntriesRef]);

  const addEntry = useCallback(async (input: EntryInput) => {
    if (!user) throw new Error('Not authenticated');
    const ref = getEntriesRef();
    await addDoc(ref, {
      userId: user.uid,
      icon: input.icon,
      title: input.title,
      body: input.body,
      date: input.date,
      imageUrl: input.imageUrl ?? null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    await reload();
  }, [user, getEntriesRef, reload]);

  const updateEntry = useCallback(async (id: string, input: EntryInput) => {
    if (!user) throw new Error('Not authenticated');
    const ref = doc(db, 'users', user.uid, 'entries', id);
    await updateDoc(ref, {
      icon: input.icon,
      title: input.title,
      body: input.body,
      date: input.date,
      imageUrl: input.imageUrl ?? null,
      updatedAt: serverTimestamp(),
    });
    setEntries((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              icon: input.icon,
              title: input.title,
              body: input.body,
              date: input.date,
              imageUrl: input.imageUrl ?? null,
              updatedAt: new Date(),
            }
          : e,
      ),
    );
  }, [user]);

  const deleteEntry = useCallback(async (id: string) => {
    if (!user) throw new Error('Not authenticated');
    const ref = doc(db, 'users', user.uid, 'entries', id);
    await deleteDoc(ref);
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, [user]);

  return (
    <EntriesContext.Provider
      value={{ entries, hasMore, isLoading, error, loadMore, reload, addEntry, updateEntry, deleteEntry }}
    >
      {children}
    </EntriesContext.Provider>
  );
}

export function useEntries() {
  const ctx = useContext(EntriesContext);
  if (!ctx) {
    throw new Error('useEntries must be used inside <EntriesProvider>');
  }
  return ctx;
}
