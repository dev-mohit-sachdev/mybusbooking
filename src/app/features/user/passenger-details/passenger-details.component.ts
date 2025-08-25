import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';

@Component({
  selector: 'app-passenger-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatSelectModule, MatRadioModule],
  template: `
  <div class="page">
    <mat-card class="card">
      <h2>Passenger Details</h2>

      <form [formGroup]="form">
        <div formArrayName="passengers">
          <div *ngFor="let p of passengers.controls; let i = index" [formGroupName]="i" class="passenger-row">
            <div class="row-top">
              <div class="seat">Seat: <strong>{{ selectedLabels[i] }}</strong></div>
              <div class="age-type">Type: <span>{{ passengerType(i) }}</span></div>
            </div>

            <div class="fields-grid">
              <mat-form-field appearance="outline">
                <mat-label>Name</mat-label>
                <input matInput formControlName="name" required />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Age</mat-label>
                <input matInput type="number" formControlName="age" required (input)="onAgeChange(i)" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Gender</mat-label>
                <mat-select formControlName="gender">
                  <mat-option value="male">Male</mat-option>
                  <mat-option value="female">Female</mat-option>
                  <mat-option value="other">Other</mat-option>
                </mat-select>
              </mat-form-field>

              <div class="category">
                <label>Category</label>
                <mat-radio-group formControlName="category">
                  <mat-radio-button value="adult">Adult</mat-radio-button>
                  <mat-radio-button value="child">Child</mat-radio-button>
                </mat-radio-group>
              </div>

              <mat-form-field appearance="outline">
                <mat-label>Email</mat-label>
                <input matInput type="email" formControlName="email" [required]="i===0" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Phone</mat-label>
                <input matInput type="tel" formControlName="phone" [required]="i===0" />
              </mat-form-field>
            </div>

            <div class="age-message" *ngIf="isBetween14And18(i)">
              Note: Age between 14 and 18 will be considered child for seating but charged as adult.
            </div>
          </div>
        </div>

        <div class="actions">
          <button mat-stroked-button color="primary" type="button" (click)="goBack()">Back</button>
          <button mat-flat-button color="accent" type="button" (click)="proceedToPayment()" [disabled]="form.invalid">Proceed to Payment</button>
        </div>
      </form>
    </mat-card>
  </div>
  `,
  styles: [
    `
    .page{ padding:18px; display:flex; justify-content:center }
    .card{ width:100%; max-width:900px; padding:16px }
    .passenger-row{ border-radius:8px; padding:12px; margin-bottom:12px; background:#fbfeff; box-shadow:0 6px 20px rgba(2,6,23,0.03) }
    .row-top{ display:flex; justify-content:space-between; align-items:center; margin-bottom:8px }
    mat-form-field{ width:100%; margin-right:12px }
    .passenger-row mat-form-field{ width: calc(33% - 12px); display:inline-block }
    .actions{ display:flex; justify-content:flex-end; gap:12px; margin-top:12px }
    @media(max-width:760px){ .passenger-row mat-form-field{ width:100%; display:block } }
    .passenger-card{margin-bottom:12px}
    .fields-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}
    @media (max-width:600px){.fields-grid{grid-template-columns:1fr}}
    .age-note{font-size:12px;color:#666;margin-top:6px}
    .radio-row{display:flex;gap:12px;align-items:center}
    .age-message{font-size:13px;color:#b35500;margin-top:8px}
    `
  ]
})
export class PassengerDetailsComponent implements OnInit {
  form: any;
  selected: any[] = [];
  selectedLabels: string[] = [];
  tripId?: string | null;
  busId?: string | null;
  date?: string | null;

  constructor(private router: Router, private fb: FormBuilder) {
    const group = this.fb.group({ passengers: this.fb.array([]) });
    this.form = group;
  }

  ngOnInit(): void {
    const nav = (this.router.getCurrentNavigation && this.router.getCurrentNavigation()?.extras.state) || (window && (window as any).history?.state);
    this.selected = nav?.selected || [];
  this.tripId = nav?.tripId || null;
  this.busId = nav?.busId || null;
  this.date = nav?.date || null;
    this.selectedLabels = this.selected.map((s: any, i: number) => s.label || (s.seatNo ? String(s.seatNo) : `S${i+1}`));

    const arr = this.form.get('passengers') as FormArray;
    this.selected.forEach((s: any, i: number) => {
      // email & phone required only for the first passenger (index 0)
      const emailValidators = i === 0 ? [Validators.required, Validators.email] : [];
      const phoneValidators = i === 0 ? [Validators.required] : [];

      arr.push(this.fb.group({
        name: ['', Validators.required],
        age: [null, [Validators.required, Validators.min(0)]],
        gender: ['male', Validators.required],
        category: ['adult', Validators.required], // adult | child (radio)
        seat: [this.selectedLabels[i]],
        email: ['', emailValidators],
        phone: ['', phoneValidators]
      }));
    });
  }

  get passengers() { return this.form.get('passengers') as FormArray }

  onAgeChange(i: number) {
    const ctrl = this.passengers.at(i).get('age');
    if (!ctrl) return;
    const val = Number(ctrl.value);
    // Auto-select category based on age
    const group = this.passengers.at(i);
    if (!group) return;
    const catCtrl = group.get('category');
    if (!catCtrl) return;
    if (val < 14) {
      catCtrl.setValue('child', { emitEvent: false });
    } else if (val > 18) {
      catCtrl.setValue('adult', { emitEvent: false });
    } else {
      // 14-18: considered child (but charged adult) -> select child
      catCtrl.setValue('child', { emitEvent: false });
    }
  }

  passengerType(index: number) {
    const ageCtrl = this.passengers.at(index).get('age');
    const catCtrl = this.passengers.at(index).get('category');
    const age = ageCtrl ? Number(ageCtrl.value || 0) : 0;
    // explicit category if set
    if (catCtrl && catCtrl.value === 'child') {
      // for display, child if below 14 or between 14-18
      if (age > 0 && age < 14) return 'Child';
      if (age >= 14 && age <= 18) return 'Child (charged as Adult)';
      return 'Child';
    }
    return 'Adult';
  }

  isBetween14And18(index: number) {
    const ageCtrl = this.passengers.at(index).get('age');
    const age = ageCtrl ? Number(ageCtrl.value || 0) : 0;
    return age >= 14 && age <= 18;
  }

  proceedToPayment() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const payload: any = { passengers: this.form.value.passengers, selected: this.selected, tripId: this.tripId, busId: this.busId, date: this.date };
  this.router.navigate(['/payment'], { state: { booking: payload } });
  }

  goBack() { this.router.navigate(['/view-seats']); }
}
