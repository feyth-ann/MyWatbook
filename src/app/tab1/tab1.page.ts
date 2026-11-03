
import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef
} from '@angular/core';

import { AlertController } from '@ionic/angular/lazy';
import { FirestoreBookService } from '../services/firestore-book.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,
})
export class Tab1Page implements OnInit, OnDestroy {

  books: any[] = [];
  loading = true;
  searchText = '';
  statusFilter = 'All';

  private unsubscribeBooks?: () => void;

  constructor(
    private firestoreBookService: FirestoreBookService,
    private alertController: AlertController,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadBooks();
  }

  // READ - Load books from Firestore
  loadBooks(): void {
    this.loading = true;

    this.unsubscribeBooks = this.firestoreBookService.listenToBooks(
      (books) => {
        this.books = books.map(book => ({
          ...book,
          readingStatus: book.readingStatus || 'To Read'
        }));

        this.loading = false;
        this.cdr.detectChanges();

        console.log('Firestore books updated:', this.books);
      }
    );
  }

  // SEARCH AND STATUS FILTER
  get filteredBooks(): any[] {
    const search = this.searchText.toLowerCase().trim();

    return this.books.filter(book => {
      const title = (book?.title || '').toLowerCase();
      const author = (book?.author || '').toLowerCase();
      const status = book?.readingStatus || 'To Read';

      const matchesSearch =
        title.includes(search) ||
        author.includes(search);

      const matchesStatus =
        this.statusFilter === 'All' ||
        status === this.statusFilter;

      return matchesSearch && matchesStatus;
    });
  }

  // COUNT BOOK CATEGORIES
  getCategoryCount(): number {
    return new Set(
      this.books
        .map(book => book?.category)
        .filter(Boolean)
    ).size;
  }

  // UPDATE BOOK
  async editBook(book: any): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Edit Book',
      inputs: [
        {
          name: 'title',
          type: 'text',
          placeholder: 'Book Title',
          value: book?.title || ''
        },
        {
          name: 'author',
          type: 'text',
          placeholder: 'Author',
          value: book?.author || ''
        },
        {
          name: 'category',
          type: 'text',
          placeholder: 'Category',
          value: book?.category || ''
        },
        {
          name: 'description',
          type: 'textarea',
          placeholder: 'Description',
          value: book?.description || ''
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Save Changes',
          handler: async (values) => {
            const title = values.title?.trim();
            const author = values.author?.trim();
            const category = values.category?.trim();

            if (!title || !author || !category) {
              console.log('Please complete the required fields.');
              return false;
            }

            try {
              await this.firestoreBookService.updateBook(book.id, {
                title,
                author,
                category,
                description: values.description?.trim() || ''
              });

              console.log('Book updated successfully!');
              return true;

            } catch (error) {
              console.error('Failed to update book:', error);
              return false;
            }
          }
        }
      ]
    });

    await alert.present();
  }

  // DELETE BOOK
  async deleteBook(book: any): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Delete Book',
      message: `Are you sure you want to delete "${book?.title || 'this book'}"?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: async () => {
            try {
              await this.firestoreBookService.deleteBook(book.id);
              console.log('Book deleted successfully!');
            } catch (error) {
              console.error('Failed to delete book:', error);
            }
          }
        }
      ]
    });

    await alert.present();
  }

  // CLEAN UP FIRESTORE LISTENER
  ngOnDestroy(): void {
    if (this.unsubscribeBooks) {
      this.unsubscribeBooks();
    }
  }
}
