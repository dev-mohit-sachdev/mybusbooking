export interface Seat {
  seatNo: number;
  row: number;
  col: number;
  side?: 'left' | 'right';   // only for sitting
  type: 'sitting' | 'sleeper';
  // optional reservation/maintenance metadata
  reservedFor?: 'none' | 'female' | 'maintenance';
  blocked?: boolean; // true when seat is blocked/under maintenance
  bookedBy?: string | null; // userId who has booked the seat
}

export interface Bus {
  id?: string;
  name: string;
  sitting: {
    left: { total: number; seats: Seat[] };
    right: { total: number; seats: Seat[] };
  };
  sleeper: {
    total: number;
    seats: Seat[];
  };
  ratings: number;
}
