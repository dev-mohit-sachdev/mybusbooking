import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  collectionData,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  CollectionReference,
  query,
  where,
  getDocs
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Bus } from '../models/bus.model';

@Injectable({ providedIn: 'root' })
export class BusService {
  private busesCollection: CollectionReference;

  constructor(private firestore: Firestore) {
    this.busesCollection = collection(this.firestore, 'buses');
  }

  // CREATE
  async addBus(bus: Bus): Promise<{ status: number; message: string }> {
    const busWithSeats = this.ensureSeats(bus);
    await addDoc(this.busesCollection, busWithSeats);
    return { status: 201, message: 'Bus created successfully' };
  }

  // Ensure seat arrays are populated with Seat objects (seatNo, row, col, side, type)
  private ensureSeats(bus: Bus): Bus {
    // shallow clone
    const out: Bus = JSON.parse(JSON.stringify(bus));
    let seatNo = 1;

    out.sitting = out.sitting || { left: { total: 0, seats: [] }, right: { total: 0, seats: [] } };
    out.sleeper = out.sleeper || { total: 0, seats: [] };

    // left sitting
    out.sitting.left.seats = out.sitting.left.seats && out.sitting.left.seats.length ? out.sitting.left.seats : [];
    out.sitting.right.seats = out.sitting.right.seats && out.sitting.right.seats.length ? out.sitting.right.seats : [];
    out.sleeper.seats = out.sleeper.seats && out.sleeper.seats.length ? out.sleeper.seats : [];

    // generate left sitting seats
    for (let i = 1; i <= (out.sitting.left.total || 0); i++) {
      if (!out.sitting.left.seats.find(s => s.seatNo === seatNo)) {
        out.sitting.left.seats.push({ seatNo: seatNo, row: i, col: 1, side: 'left', type: 'sitting', reservedFor: 'none', blocked: false, bookedBy: null });
      }
      seatNo++;
    }

    // generate right sitting seats
    for (let i = 1; i <= (out.sitting.right.total || 0); i++) {
      if (!out.sitting.right.seats.find(s => s.seatNo === seatNo)) {
        out.sitting.right.seats.push({ seatNo: seatNo, row: i, col: 1, side: 'right', type: 'sitting', reservedFor: 'none', blocked: false, bookedBy: null });
      }
      seatNo++;
    }

    // generate sleeper seats
    for (let i = 1; i <= (out.sleeper.total || 0); i++) {
      if (!out.sleeper.seats.find(s => s.seatNo === seatNo)) {
        out.sleeper.seats.push({ seatNo: seatNo, row: i, col: 1, type: 'sleeper', reservedFor: 'none', blocked: false, bookedBy: null });
      }
      seatNo++;
    }

    return out;
  }

  // Scan all buses and backfill seats arrays when missing or counts mismatch
  async backfillAllBuses(): Promise<void> {
    const q = query(this.busesCollection);
    const snap = await getDocs(q);
    const updates: Array<Promise<any>> = [];
    snap.forEach(docSnap => {
      const data = docSnap.data() as Bus;
      const id = docSnap.id;
      const needs = (obj?: any) => !obj || !obj.seats || obj.seats.length === 0;
      if (needs(data.sitting?.left) || needs(data.sitting?.right) || needs(data.sleeper)) {
        const fixed = this.ensureSeats(data);
        const ref = doc(this.firestore, `buses/${id}`);
        updates.push(updateDoc(ref, { sitting: fixed.sitting, sleeper: fixed.sleeper }));
      }
    });
    await Promise.all(updates);
  }

  // READ ALL
  getBuses(): Observable<Bus[]> {
    return collectionData(this.busesCollection, { idField: 'id' }) as Observable<Bus[]>;
  }

  // READ ONE
  async getBusById(id: string): Promise<Bus | null> {
    const ref = doc(this.firestore, `buses/${id}`);
    const snap = await getDoc(ref);
    return snap.exists() ? (snap.data() as Bus) : null;
  }

  // UPDATE
  async updateBus(id: string, patch: Partial<Bus>) {
    const ref = doc(this.firestore, `buses/${id}`);

    // If the patch only contains totals for sitting/sleeper, we should
    // merge them with existing seats and run ensureSeats so seats are not
    // accidentally overwritten with empty arrays.
    if (patch.sitting || patch.sleeper) {
      const snap = await getDoc(ref);
      if (!snap.exists()) throw new Error('Bus not found');
      const current = snap.data() as Bus;

      // Merge totals from patch into a copy of current
      const merged: Bus = JSON.parse(JSON.stringify(current));
      if (patch.name !== undefined) merged.name = patch.name as string;
      if (patch.sitting) {
        merged.sitting = merged.sitting || { left: { total: 0, seats: [] }, right: { total: 0, seats: [] } };
        merged.sitting.left.total = patch.sitting.left?.total ?? merged.sitting.left.total;
        merged.sitting.right.total = patch.sitting.right?.total ?? merged.sitting.right.total;
      }
      if (patch.sleeper) {
        merged.sleeper = merged.sleeper || { total: 0, seats: [] };
        merged.sleeper.total = patch.sleeper.total ?? merged.sleeper.total;
      }

      const ensured = this.ensureSeats(merged);

      // Apply the merged/ensured sitting and sleeper plus any other top-level fields in patch
      const toUpdate: any = { ...(patch as any) };
      toUpdate.sitting = ensured.sitting;
      toUpdate.sleeper = ensured.sleeper;

      return updateDoc(ref, toUpdate);
    }

    return updateDoc(ref, patch as any);
  }

  // UPDATE single seat metadata inside a bus document
  async updateSeatMetadata(busId: string, seatNo: number, payload: Partial<import('../models/bus.model').Seat>) {
    const ref = doc(this.firestore, `buses/${busId}`);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error('Bus not found');
    const bus = snap.data() as Bus;

    // find seat in sitting.left, sitting.right or sleeper
    let updated = false;
    const tryUpdate = (arr?: import('../models/bus.model').Seat[]) => {
      if (!arr) return;
      for (let i = 0; i < arr.length; i++) {
        if (arr[i].seatNo === seatNo) {
          arr[i] = { ...arr[i], ...payload };
          updated = true;
          return;
        }
      }
    };

    tryUpdate(bus.sitting?.left?.seats);
    tryUpdate(bus.sitting?.right?.seats);
    tryUpdate(bus.sleeper?.seats);

    if (!updated) throw new Error('Seat not found');

    await updateDoc(ref, { ...bus });
    return { status: 200, message: 'Seat updated' };
  }

  async markSeatBooked(busId: string, seatNo: number, dateIso: string, bookedBy?: string | null) {
    const ref = doc(this.firestore, `buses/${busId}`);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error('Bus not found');
    const bus = snap.data() as Bus;

    const findAndMark = (arr?: import('../models/bus.model').Seat[]) => {
      if (!arr) return false;
      for (let i = 0; i < arr.length; i++) {
        if (arr[i].seatNo === seatNo) {
          const s = arr[i];
          const dates = Array.isArray((s as any).bookedDates) ? (s as any).bookedDates.slice() : [];
          if (!dates.includes(dateIso)) dates.push(dateIso);
          (s as any).bookedDates = dates;
          if (bookedBy !== undefined) (s as any).bookedBy = bookedBy;
          arr[i] = s;
          return true;
        }
      }
      return false;
    };

    let updated = false;
    updated = updated || findAndMark(bus.sitting?.left?.seats);
    updated = updated || findAndMark(bus.sitting?.right?.seats);
    updated = updated || findAndMark(bus.sleeper?.seats);

    if (!updated) throw new Error('Seat not found');

    await updateDoc(ref, { ...bus });
    return { status: 200, message: 'Seat marked booked for date' };
  }

  // Check if a user can book a specific seat based on reservation metadata
  async canUserBookSeat(busId: string, seatNo: number, user: { gender: 'male' | 'female'; age: number }) {
    const ref = doc(this.firestore, `buses/${busId}`);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error('Bus not found');
    const bus = snap.data() as Bus;

    const findSeat = (arr?: import('../models/bus.model').Seat[]) => arr?.find(s => s.seatNo === seatNo);
    let seat = findSeat(bus.sitting?.left?.seats) || findSeat(bus.sitting?.right?.seats) || findSeat(bus.sleeper?.seats);
    if (!seat) throw new Error('Seat not found');

    if (seat.blocked) return { allowed: false, reason: 'Seat is blocked / under maintenance' };
  if (seat.reservedFor === 'female' && user.gender !== 'female') return { allowed: false, reason: 'Seat reserved for female passengers' };
  if (seat.reservedFor === 'maintenance') return { allowed: false, reason: 'Seat reserved/locked for maintenance' };
    if (seat.bookedBy) return { allowed: false, reason: 'Seat already booked' };
    return { allowed: true };
  }

  // DELETE
  deleteBus(id: string) {
    const ref = doc(this.firestore, `buses/${id}`);
    return deleteDoc(ref);
  }
}
