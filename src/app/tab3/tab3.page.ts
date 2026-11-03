
import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef
} from '@angular/core';

import { FirestoreBookService } from '../services/firestore-book.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: false,
})
export class Tab3Page implements OnInit, OnDestroy {

  books: any[] = [];
  searchText = '';
  loading = true;

  private unsubscribeBooks?: () => void;

  constructor(
    private firestoreBookService: FirestoreBookService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadBooks();
  }

  // READ BOOKS FROM FIRESTORE
  loadBooks() {
    this.loading = true;

    this.unsubscribeBooks = this.firestoreBookService.listenToBooks(
      (books) => {
        this.books = books.map(book => ({
          ...book,
          readingStatus: book.readingStatus || 'To Read'
        }));

        this.loading = false;
        this.cdr.detectChanges();

        console.log('Firestore library updated:', this.books);
      }
    );
  }

  // TOTAL BOOKS
  get totalBooks(): number {
    return this.books.length;
  }

  // CURRENTLY READING
  get currentlyReading(): number {
    return this.books.filter(
      book => book.readingStatus === 'Currently Reading'
    ).length;
  }

  // COMPLETED BOOKS
  get completedBooks(): number {
    return this.books.filter(
      book => book.readingStatus === 'Completed'
    ).length;
  }

  // TO READ BOOKS
  get toReadBooks(): number {
    return this.books.filter(
      book => book.readingStatus === 'To Read'
    ).length;
  }

  // READING PROGRESS
  get readingProgress(): number {
    if (this.totalBooks === 0) {
      return 0;
    }

    return Math.round(
      (this.completedBooks / this.totalBooks) * 100
    );
  }

  // SEARCH BOOKS
  get filteredBooks(): any[] {
    const search = this.searchText.toLowerCase().trim();

    if (!search) {
      return this.books;
    }

    return this.books.filter(book =>
      book?.title?.toLowerCase().includes(search) ||
      book?.author?.toLowerCase().includes(search)
    );
  }

  // UPDATE READING STATUS IN FIRESTORE
  async updateReadingStatus(book: any, status: string) {
    const previousStatus = book.readingStatus;

    book.readingStatus = status;
    this.cdr.detectChanges();

    try {
      await this.firestoreBookService.updateBook(book.id, {
        readingStatus: status
      });

      console.log(
        'Reading status updated:',
        book.title,
        status
      );

    } catch (error) {
      book.readingStatus = previousStatus;
      this.cdr.detectChanges();

      console.error('Failed to update reading status:', error);
    }
  }

  // UNSUBSCRIBE WHEN PAGE IS DESTROYED
  ngOnDestroy() {
    if (this.unsubscribeBooks) {
      this.unsubscribeBooks();
    }
  }
}
