import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";

import { DOCUMENTS_COLLECTION } from "./constants";
import { db, isFirebaseConfigured } from "./firebase";
import type { StoredDocument } from "./types";

const PAGE_SIZE = 5;

function assertDb() {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase is not configured");
  }
  return db;
}

export async function saveDocument(
  payload: DocumentData,
): Promise<string> {
  const database = assertDb();
  const ref = await addDoc(collection(database, DOCUMENTS_COLLECTION), payload);
  return ref.id;
}

export async function fetchDocumentsPage(
  cursor?: QueryDocumentSnapshot<DocumentData>,
): Promise<{
  documents: StoredDocument[];
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
}> {
  const database = assertDb();
  const constraints = [
    orderBy("createdAt", "desc"),
    limit(PAGE_SIZE),
  ] as const;

  const q = cursor
    ? query(
        collection(database, DOCUMENTS_COLLECTION),
        orderBy("createdAt", "desc"),
        startAfter(cursor),
        limit(PAGE_SIZE),
      )
    : query(collection(database, DOCUMENTS_COLLECTION), ...constraints);

  const snapshot = await getDocs(q);
  const documents = snapshot.docs.map((item) => ({
    id: item.id,
    ...(item.data() as Omit<StoredDocument, "id">),
  }));

  const lastDoc = snapshot.docs.at(-1) ?? null;

  return {
    documents,
    lastDoc,
    hasMore: snapshot.docs.length === PAGE_SIZE,
  };
}

export async function fetchAllDocuments(): Promise<StoredDocument[]> {
  const database = assertDb();
  const snapshot = await getDocs(collection(database, DOCUMENTS_COLLECTION));
  return snapshot.docs.map((item) => ({
    id: item.id,
    ...(item.data() as Omit<StoredDocument, "id">),
  }));
}

export async function removeDocument(id: string): Promise<void> {
  const database = assertDb();
  await deleteDoc(doc(database, DOCUMENTS_COLLECTION, id));
}

export { PAGE_SIZE };
