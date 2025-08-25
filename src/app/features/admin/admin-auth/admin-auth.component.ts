import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule }     from '@angular/material/input';
import { MatButtonModule }    from '@angular/material/button';
import { MatCardModule }      from '@angular/material/card';
import { MatIconModule }      from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; 

@Component({
  selector: 'app-admin-auth',
    standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './admin-auth.component.html',
  styleUrls: ['./admin-auth.component.scss']
})
export class AdminAuthComponent {
hide = true;
  loading = false;

  signupForm!: FormGroup;
  loginForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private snack: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

async onLogin() {
  if (this.loginForm.invalid) {
    this.loginForm.markAllAsTouched();
    return;
  }

  const { email, password } = this.loginForm.value;
  this.loading = true;

  try {
    const result = await this.userService.getUserByEmailAndPassword(email ?? '', password ?? '', "admin");

    if (result.user) {
      this.snack.open(`Welcome ${result.user.email}!`, 'OK', { duration: 2500 });
      sessionStorage.setItem('mybusbooking-admin', JSON.stringify(result.user))
      this.router.navigate(['/admin/dashboard']);
    } else {
      this.snack.open(result.message, 'Try Again', { duration: 2500 });
    }
  } catch (e: any) {
    this.snack.open(e?.message ?? 'Login failed', 'Dismiss', { duration: 3000 });
  } finally {
    this.loading = false;
  }
}
}
