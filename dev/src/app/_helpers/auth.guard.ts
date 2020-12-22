import { Injectable } from '@angular/core';
import { Router, ActivatedRoute, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthenticationService } from '@app/_services';
import { ToastrService } from 'ngx-toastr';
import { MessageConstants } from '../_common/constants/message';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authenticationService: AuthenticationService,
    private toastr: ToastrService
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    const access_token = route.queryParams.access_token;
    if (access_token) {
      const local_access_token = localStorage.getItem('access_token')
      if (local_access_token !== '' || local_access_token !== undefined || local_access_token !== null)
        localStorage.setItem('access_token', access_token)
    }
    if (this.authenticationService.isLoggedIn !== true) {
      // this.toastr.error(MessageConstants.mustLogin, 'Error', { timeOut: 4000 })
      // this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      this.router.navigate(['/login']);
      return false;
    }
    return true;
  }
}
