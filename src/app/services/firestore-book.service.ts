
import { Injectable } from '@angular/core';

import {
  initializeApp,
  getApps,
  getApp
} from 'firebase/app';

import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  Firestore,
  CollectionReference,
  DocumentData
} from 'firebase/firestore';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FirestoreBookService {

  private db: Firestore;
  private booksCollection: CollectionReference<DocumentData>;

  constructor() {
    const app = getApps().length
      ? getApp()
      : initializeApp(environment.firebaseConfig);

    this.db = getFirestore(app);

    this.booksCollection = collection(this.db, 'books');
  }

  // CREATE
  async addBook(book: any) {
    return await addDoc(this.booksCollection, {
      ...book,
      createdAt: new Date().toISOString()
    });
  }

  // READ - REAL TIME
  listenToBooks(callback: (books: any[]) => void) {

    return onSnapshot(this.booksCollection, (snapshot) => {

      const books = snapshot.docs.map((document) => ({
        id: document.id,
        ...document.data()
      }));

      callback(books);
    });
  }

  // UPDATE
  async updateBook(id: string, book: any) {
    const bookRef = doc(this.db, 'books', id);

    return await updateDoc(bookRef, book);
  }

  // DELETE
  async deleteBook(id: string) {
    const bookRef = doc(this.db, 'books', id);

    return await deleteDoc(bookRef);
  }
}
