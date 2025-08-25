import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, RouterModule, NgIf],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
  isLoggedIn = false; // Replace with auth logic
}
