
import {
  Component,
  ChangeDetectorRef
} from '@angular/core';

import { FirestoreBookService } from '../services/firestore-book.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false,
})
export class Tab2Page {

  book = {
    title: '',
    author: '',
    category: '',
    description: ''
  };

  saving = false;

  constructor(
    private firestoreBookService: FirestoreBookService,
    private toastController: ToastController,
    private cdr: ChangeDetectorRef
  ) {}

  async saveBook(): Promise<void> {
    if (this.saving) {
      return;
    }

    const title = this.book.title.trim();
    const author = this.book.author.trim();
    const category = this.book.category;
    const description = this.book.description.trim();

    if (!title || !author || !category) {
      await this.showToast('Please complete the required fields.');
      return;
    }

    this.saving = true;
    this.cdr.detectChanges();

    try {
      await this.firestoreBookService.addBook({
        title,
        author,
        category,
        description,
        readingStatus: 'To Read'
      });

      this.book = {
        title: '',
        author: '',
        category: '',
        description: ''
      };

      this.saving = false;
      this.cdr.detectChanges();

      await this.showToast('Book successfully added!');

    } catch (error) {
      console.error('Error saving book to Firestore:', error);

      this.saving = false;
      this.cdr.detectChanges();

      await this.showToast('Unable to save book. Please try again.');
    }
  }

  async showToast(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom'
    });

    await toast.present();
  }
}
