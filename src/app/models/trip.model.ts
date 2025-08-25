export interface Trip {
  id?: string;
  busId: string;
  departure: { time: string; name: string };
  destination: { time: string; name: string };
  pricing: { adult: number; child: number };
  dates: string[]; // yyyy-MM-dd
  operator: string;
}
