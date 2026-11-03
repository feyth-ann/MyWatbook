
import { Injectable } from '@angular/core';

import {
  initializeApp,
  getApps,
  getApp
} from 'firebase/app';

import {
  getDatabase,
  ref,
  push,
  set,
  get,
  update,
  remove,
  onValue,
  Database
} from 'firebase/database';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BookService {

  private db: Database;
  private booksRef: any;

  constructor() {
    const app = getApps().length
      ? getApp()
      : initializeApp(environment.firebaseConfig);

    this.db = getDatabase(app);
    this.booksRef = ref(this.db, 'books');
  }

  // CREATE
  async addBook(book: any) {
    console.log('1. Creating book reference...');

    const newBookRef = push(this.booksRef);

    console.log('2. Sending data to Firebase...');

    const startTime = Date.now();

    try {
      await set(newBookRef, book);

      const elapsed = (Date.now() - startTime) / 1000;

      console.log('3. Firebase confirmed save!');
      console.log('Save duration:', elapsed, 'seconds');

      return newBookRef.key;

    } catch (error) {
      console.error('Firebase save failed:', error);
      throw error;
    }
  }

  // READ ONCE
  async getBooks() {
    const snapshot = await get(this.booksRef);

    if (!snapshot.exists()) {
      return [];
    }

    const data = snapshot.val();

    return Object.keys(data).map(id => ({
      id,
      ...data[id]
    }));
  }

  // REAL-TIME READ
  listenToBooks(callback: (books: any[]) => void) {
    const unsubscribe = onValue(
      this.booksRef,
      snapshot => {
        if (!snapshot.exists()) {
          callback([]);
          return;
        }

        const data = snapshot.val();

        const books = Object.keys(data).map(id => ({
          id,
          ...data[id]
        }));

        callback(books);
      },
      error => {
        console.error('Firebase real-time error:', error);
      }
    );

    return unsubscribe;
  }

  // UPDATE
  updateBook(id: string, book: any) {
    const bookRef = ref(this.db, `books/${id}`);
    return update(bookRef, book);
  }

  // DELETE
  deleteBook(id: string) {
    const bookRef = ref(this.db, `books/${id}`);
    return remove(bookRef);
  }
}
