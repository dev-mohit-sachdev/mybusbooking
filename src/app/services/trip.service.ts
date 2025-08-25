import { Injectable } from '@angular/core';
import { collectionData, docData, addDoc, CollectionReference, collection, doc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { Firestore } from '@angular/fire/firestore';
import { Trip } from '../models/trip.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TripService {
  private col: CollectionReference;
  constructor(private firestore: Firestore) {
    this.col = collection(this.firestore, 'trips');
  }

  list(): Observable<Trip[]> {
    return collectionData(this.col, { idField: 'id' }) as Observable<Trip[]>;
  }

  get(id: string): Observable<Trip> {
    const d = doc(this.firestore, `trips/${id}`);
    return docData(d, { idField: 'id' }) as Observable<Trip>;
  }

  add(trip: Trip) {
    return addDoc(this.col, trip);
  }

  update(id: string, payload: Partial<Trip>) {
    const d = doc(this.firestore, `trips/${id}`);
    return updateDoc(d, payload as any);
  }

  delete(id: string) {
    const d = doc(this.firestore, `trips/${id}`);
    return deleteDoc(d);
  }
}
