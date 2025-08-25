import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ReactiveFormsModule, HeaderComponent, FooterComponent,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatSelectModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'] 
})
export class AppComponent implements OnInit, OnDestroy{
  showUserLayout = false;
  private sub: any;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.updateLayoutFromUrl(this.router.routerState.snapshot.root);
    this.sub = this.router.events.subscribe(e => {
      if (e instanceof NavigationEnd) {
        this.updateLayoutFromUrl(this.router.routerState.snapshot.root);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.sub) this.sub.unsubscribe();
  }

  private updateLayoutFromUrl(snapshot: any) {
    let route = snapshot;
    while (route.firstChild) route = route.firstChild;
    const role = route && route.data ? route.data['role'] : null;
    this.showUserLayout = role === 'user';
  }

}

  