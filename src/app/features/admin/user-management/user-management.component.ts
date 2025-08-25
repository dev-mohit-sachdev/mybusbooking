import { Component,OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Observable } from 'rxjs';

import { User } from '../../../models/user.model';
import { UserService } from '../../../services/user.service';
import { UserDialogComponent } from './user-dialogue.component';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss'],
   imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule
  ]
})
export class UserManagementComponent implements OnInit {
  users: Observable<User[]>;
  displayedColumns: string[] = ['email', 'actions'];

  constructor(private userService: UserService, private dialog: MatDialog) {
    this.users = this.userService.getUsers();
  }

  ngOnInit(): void {}

  openDialog(user?: User): void {
    const dialogRef = this.dialog.open(UserDialogComponent, {
      width: '400px',
      data: user || null
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.users = this.userService.getUsers();
      }
    });
  }
}
