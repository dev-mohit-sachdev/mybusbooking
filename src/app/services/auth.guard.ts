import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
  const required = route.data ? (route.data['role'] as 'admin' | 'user' | undefined) : undefined;

    // admin session
    const adminJson = sessionStorage.getItem('mybusbooking-admin');
    const userJson = sessionStorage.getItem('mybusbooking-user');

    const isAdmin = !!adminJson;
    const isUser = !!userJson;

    if (!required) return true; // no role requirement

    if (required === 'admin' && isAdmin) return true;
    if (required === 'user' && isUser) return true;

    // if user is admin trying to access user route or vice versa, redirect to appropriate auth
    if (required === 'admin') {
      return this.router.parseUrl('/admin/login');
    }
    return this.router.parseUrl('/');
  }
}
