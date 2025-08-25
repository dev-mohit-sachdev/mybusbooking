export function seatLabel(seat: any): string {
  if (!seat) return '';
  if (seat.side) return `${seat.side.charAt(0).toUpperCase()}${seat.row}`;
  return `S${seat.seatNo}`;
}
