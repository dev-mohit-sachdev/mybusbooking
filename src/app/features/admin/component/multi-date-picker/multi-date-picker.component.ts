import { Component, Output, EventEmitter, DoCheck, Inject, Input } from '@angular/core';
import {
  DateRange,
  MatDateRangeSelectionStrategy,
  MAT_DATE_RANGE_SELECTION_STRATEGY,
} from '@angular/material/datepicker';
// DateAdapter removed — format dates with toISOString to avoid DI provider issues
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { DateAdapter, NativeDateAdapter, MAT_DATE_FORMATS, MAT_NATIVE_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';

// -------------------------
// Multiple Date Selection Strategy
// -------------------------
export class MultipleDateSelectionStrategy<D>
  implements MatDateRangeSelectionStrategy<D>
{
  private selectedDates: D[] = [];

  // Called when user selects a date
  public selectionFinished(date: D | null): DateRange<D> {
    if (date) {
      this.selectedDates.push(date);
    }
    return this._createDateRange(date, date);
  }

  // Preview while hovering over a date
  public createPreview(activeDate: D | null): DateRange<D> {
    return this._createDateRange(activeDate, activeDate);
  }

  // Helper to create a date range object
  private _createDateRange(start: D | null, end: D | null): DateRange<D> {
    return new DateRange<D>(start, end);
  }

  // Expose selected dates
  public getSelectedDates(): D[] {
    return this.selectedDates;
  }
  // toggle a date: add if missing, remove if present
  public toggle(date: D | null) {
    if (!date) return;
    const iso = (date as any).toISOString ? (date as any).toISOString().slice(0, 10) : String(date);
    const idx = this.selectedDates.findIndex((d: any) => (d && d.toISOString ? d.toISOString().slice(0,10) : String(d)) === iso);
    if (idx === -1) this.selectedDates.push(date);
    else this.selectedDates.splice(idx, 1);
  }
  public isSelected(date: D | null) {
    if (!date) return false;
    const iso = (date as any).toISOString ? (date as any).toISOString().slice(0, 10) : String(date);
    return this.selectedDates.some((d: any) => (d && d.toISOString ? d.toISOString().slice(0,10) : String(d)) === iso);
  }
}

// -------------------------
// Component
// -------------------------
@Component({
  selector: 'app-multi-date-picker',
  standalone: true,
  imports: [
    // core
    CommonModule,
    // material
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
  MatCardModule,
  ],
  templateUrl: './multi-date-picker.component.html',
  styleUrls: ['./multi-date-picker.component.css'],
  providers: [
    {
      provide: MAT_DATE_RANGE_SELECTION_STRATEGY,
      useClass: MultipleDateSelectionStrategy,
    },
  // ensure a DateAdapter provider is available for the standalone component
  { provide: DateAdapter, useClass: NativeDateAdapter, deps: [MAT_DATE_LOCALE] },
  { provide: MAT_DATE_FORMATS, useValue: MAT_NATIVE_DATE_FORMATS },
  ],
})

export class MultiDatePickerComponent implements DoCheck {
  @Output() datesChange = new EventEmitter<Date[]>();
  @Input() disabled = false;

  constructor(
    @Inject(MAT_DATE_RANGE_SELECTION_STRATEGY) private strategy: MultipleDateSelectionStrategy<Date>
  ) {}

  // Format selected dates as comma-separated strings
  getFormattedDates(): string {
    const dates = this.strategy.getSelectedDates();
    return (dates || [])
      .map((d: any) => (d instanceof Date ? d.toISOString().slice(0, 10) : String(d)))
      .join(', ');
  }

  ngDoCheck() {
    this.datesChange.emit(this.strategy.getSelectedDates());
  }

  onSelect(d: Date | null) {
  if (this.disabled) return;
  this.strategy.toggle(d);
  }

  dateClass = (d: Date | null) => {
    if (!d) return '';
    return this.strategy.isSelected(d) ? 'multi-selected' : '';
  }
}
