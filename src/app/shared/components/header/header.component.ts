import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    NgIf
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  userEmail = '';
  isLoggedIn = false;
  isAdmin = false;

  constructor(private router: Router) {
    this.syncFromSession();
  }

  syncFromSession() {
    const u = sessionStorage.getItem('mybusbooking-user');
    const a = sessionStorage.getItem('mybusbooking-admin');
    if (u) {
      try { const user = JSON.parse(u); this.userEmail = user.email || ''; } catch { this.userEmail = ''; }
      this.isLoggedIn = true;
      this.isAdmin = false;
    } else if (a) {
      try { const admin = JSON.parse(a); this.userEmail = admin.email || ''; } catch { this.userEmail = ''; }
      this.isLoggedIn = true;
      this.isAdmin = true;
    } else {
      this.userEmail = '';
      this.isLoggedIn = false;
      this.isAdmin = false;
    }
  }

  logout() {
    // clear both keys
    sessionStorage.removeItem('mybusbooking-user');
    sessionStorage.removeItem('mybusbooking-admin');
    this.syncFromSession();
    // redirect to public auth
    this.router.navigate(['/']);
  }
}
