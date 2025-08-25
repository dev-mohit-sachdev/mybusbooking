// sidebar.component.ts
import { Component, HostListener } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, MatIconModule, MatButtonModule, MatTooltipModule, NgIf, NgFor],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  isSidebarOpen = window.innerWidth >= 768;

  navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { path: '/admin/book-management', label: 'Book Management', icon: 'book_online' },
    { path: '/admin/bus-management', label: 'Bus Management', icon: 'directions_bus' },
    { path: '/admin/seat-management', label: 'Seat Management', icon: 'event_seat' },
    { path: '/admin/trip-management', label: 'Trip Management', icon: 'map' },
    { path: '/admin/user-management', label: 'User Management', icon: 'group' }
  ];

  @HostListener('window:resize')
  onResize() {
    this.isSidebarOpen = window.innerWidth >= 768;
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  onLogout() {
    // Place logout logic here
  }
}
