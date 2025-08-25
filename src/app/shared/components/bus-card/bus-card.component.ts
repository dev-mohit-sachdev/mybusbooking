import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Bus } from '../../../models/bus.model';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-bus-card',
  standalone: true,
  imports: [MatCardModule, MatIconModule, MatButtonModule],
  templateUrl: './bus-card.component.html',
  styleUrls: ['./bus-card.component.scss']
})
export class BusCardComponent {
  @Input() bus!: Bus;
  @Output() view = new EventEmitter<Bus>();
  @Output() edit = new EventEmitter<Bus>();
}
