export type Entry = {
  id: string;
  userId: string;
  icon: string;
  title: string;
  body: string;
  date: Date;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type EntryInput = {
  icon: string;
  title: string;
  body: string;
  date: Date;
  imageUrl?: string | null;
};
