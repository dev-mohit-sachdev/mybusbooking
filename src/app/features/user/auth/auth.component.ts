import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { UserService } from '../../../services/user.service';

// Angular Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule }     from '@angular/material/input';
import { MatButtonModule }    from '@angular/material/button';
import { MatCardModule }      from '@angular/material/card';
import { MatIconModule }      from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
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
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {
  hide = true;
  loading = false;
  isLoginMode = false;

  signupForm!: FormGroup;
  loginForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private snack: MatSnackBar
  , private router: Router
  ) {}

  ngOnInit(): void {
    // ✅ Initialize forms here
    this.signupForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
  }

  async onSignup() {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    const { email, password } = this.signupForm.value;
    this.loading = true;
    try {
      const res = await this.userService.addUser({
        email: email ?? '',
        password: password ?? '',
        role: 'user'
      });
      this.snack.open(res.message, 'OK', { duration: 2500 });
      if (res.status === 201) {
        this.signupForm.reset();
        this.isLoginMode = true;
      }
    } catch (e: any) {
      this.snack.open(e?.message ?? 'Something went wrong', 'Dismiss', { duration: 3000 });
    } finally {
      this.loading = false;
    }
  }

async onLogin() {
  if (this.loginForm.invalid) {
    this.loginForm.markAllAsTouched();
    return;
  }

  const { email, password } = this.loginForm.value;
  this.loading = true;

  try {
    const result = await this.userService.getUserByEmailAndPassword(email ?? '', password ?? '', "user");

    if (result.user) {
      // ✅ Successful login
      this.snack.open(`Welcome ${result.user.email}!`, 'OK', { duration: 2500 });
  // persist to session storage for route guards and later use
  sessionStorage.setItem('mybusbooking-user', JSON.stringify(result.user));
  // navigate to search buses page
  this.router.navigate(['/search']);
    } else {
      // ❌ Show exact error (email or password incorrect)
      this.snack.open(result.message, 'Try Again', { duration: 2500 });
    }
  } catch (e: any) {
    this.snack.open(e?.message ?? 'Login failed', 'Dismiss', { duration: 3000 });
  } finally {
    this.loading = false;
  }
}

}
