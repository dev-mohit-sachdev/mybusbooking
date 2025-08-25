import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';

import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user.model';
import { MatSnackBarModule,MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-user-dialog',
  templateUrl: './user-dialogue.component.html',
  styleUrls: ['./user-dialogue.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatSnackBarModule
  ]
})
export class UserDialogComponent {
  form: FormGroup;
  isEdit: boolean = false;
  loading:boolean = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<UserDialogComponent>,
    private userService: UserService,
    private snack: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: User
  ) {
    this.isEdit = !!data;
    this.form = this.fb.group({
      email: [data?.email || '', [Validators.required, Validators.email]],
      password: [data?.password, this.isEdit ? [] : [Validators.required, Validators.minLength(6)]]
    });
  }

  async save() {
    if (this.form.invalid) return;

    const { email, password } = this.form.value;

    if (this.isEdit) {
    //   this.userService.updateUser(this.data.id!, { email, ...(password && { password }), role })
    //     .then(() => this.dialogRef.close(true));
    } else {
    this.loading = true;
    try {
      const res = await this.userService.addUser({
        email: email ?? '',
        password: password ?? '',
        role: 'user'
      });
      this.snack.open(res.message, 'OK', { duration: 2500 });
      if (res.status === 201) {
        this.form.reset();
      }
    } catch (e: any) {
       
      this.snack.open(e?.message ?? 'Something went wrong', 'Dismiss', { duration: 3000 });
    } finally {
         this.form.reset();
      this.loading = false;
    }
    }
  }

  close() {
    this.dialogRef.close();
  }
}
