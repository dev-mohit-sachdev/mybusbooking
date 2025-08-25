import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, collectionData, CollectionReference } from '@angular/fire/firestore';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private col: CollectionReference;
  constructor(private firestore: Firestore) {
    this.col = collection(this.firestore, 'bookings');
  }

  create(booking: any) {
    return addDoc(this.col, booking);
  }
}
