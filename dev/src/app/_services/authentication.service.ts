import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Platform } from '@angular/cdk/platform';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError, timeout } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
import { environment } from '@environments/environment';
import { ApiConstants } from '../_common/constants/api';
import { MessageConstants } from '../_common/constants/message';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from "ngx-spinner";
import { User } from '@app/_models';


@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  //private currentUserSubject: BehaviorSubject<User>;
  // public currentUser: Observable<User>;

  public currentUser: any
  errorCount = 0

  constructor(
    public platform: Platform,
    public router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    public SpinnerService: NgxSpinnerService,
    private toastr: ToastrService,
  ) {
    // this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
    // this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User {
    this.currentUser = localStorage.getItem('user');
    return this.currentUser;
  }

  // login(username: string, password: string) {
  //     return this.http.post<any>(`${environment.apiUrl}/users/authenticate`, { username, password })
  //         .pipe(map(user => {
  //             // store user details and basic auth credentials in local storage to keep user logged in between page refreshes
  //             user.authdata = window.btoa(username + ':' + password);
  //             localStorage.setItem('currentUser', JSON.stringify(user));
  //             this.currentUserSubject.next(user);
  //             return user;
  //         }));
  // }

  // login
  login(user: User) {
    this.SpinnerService.show();
    return this.http.post(`${ApiConstants.apiURL}/${ApiConstants.apiVersion}/${ApiConstants.userLogin}`, user)
      .pipe(
        timeout(10000),
        catchError(err => {
          return throwError("Error in Response");
        })
      ).subscribe((res: any) => {
        this.SpinnerService.hide();
        if (res.success == true && res.statusCode == 200) {
          this.toastr.success(res.message, 'Success', { timeOut: 3000 })
          this.setAccessToken(res.data.token);
          this.getUserProfile(res.data.user._id).subscribe(
            res => {
              this.currentUser = res;
              this.checkBrowser(res);
              this.router.navigate(['/home']);
            },
          )
        } else if (res.success == false) {
          this.toastr.error(res.message, 'Error', { timeOut: 4000 })
        } else {
          this.toastr.error(MessageConstants.serverError, 'Error', { timeOut: 6000 })
        }
      }, err => {
        this.checkResponse('login', user)
        console.log(err);
      });
  }

  checkBrowser(detail: any) {
    if (detail.data.branch !== null && detail.data.branch.length !== 0) {
      detail.data.branch.isTouchlessData = detail.data.branch.isTouchless
      // if (this.platform.isBrowser) {
      //   detail.data.branch.isTouchless = false
      // }
    }
    this.setUserInfo(detail)
  }

  // User profile
  getUserProfile(id): Observable<any> {
    let api = `${ApiConstants.apiURL}/${ApiConstants.apiVersion}/${ApiConstants.userProfile}/${id}`;
    return this.http.get(api).pipe(
      map((res: Response) => {
        return res || {}
      }),
      catchError(this.handleError)
    )
  }

  // Error
  handleError(error: HttpErrorResponse) {
    let msg = '';
    if (error.error instanceof ErrorEvent) {
      // client-side error
      msg = error.error.message;
    } else {
      // server-side error
      msg = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(msg);
  }

  public setAccessToken(token) {
    localStorage.setItem('access_token', token);
  }

  get isLoggedIn(): boolean {
    // const access_token = this.route.snapshot.queryParamMap.get('access_token');
    // console.log(access_token)
    // this.route.queryParams.subscribe(params => {
    //   const access_token = params['access_token'];
    //   if (access_token)
    //     localStorage.setItem('access_token', access_token)
    // });
    let authToken = localStorage.getItem('access_token');
    return (authToken !== null) ? true : false;
  }

  public setUserInfo(detail) {
    localStorage.setItem('user', JSON.stringify(detail.data.user));
    localStorage.setItem('company', JSON.stringify(detail.data.company));
    localStorage.setItem('branch', JSON.stringify(detail.data.branch));
    localStorage.setItem('role', JSON.stringify(detail.data.role));
  }

  getToken() {
    return localStorage.getItem('access_token');
  }

  getLocalData(dataKey = '') {
    return localStorage.getItem(dataKey);
  }

  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('company');
    localStorage.removeItem('branch');
    localStorage.removeItem('role');
    this.toastr.success(MessageConstants.logout, 'Succeess', { timeOut: 3000 })
    let removeToken = localStorage.removeItem('access_token');
    if (removeToken == null) {
      this.router.navigate(['login']);
    }
  }

  interruptToHome() {
    this.toastr.error(MessageConstants.responseError, 'Error', { timeOut: 3000 })
    setTimeout(() => {
      this.router.navigate(['home'])
    }, 3000);
  }

  checkResponse(funcName = '', param: any) {
    this.errorCount = 0
    this.SpinnerService.hide()
    this.interruptToHome()

    // if (this.errorCount == 5) {
    //   this.errorCount = 0
    //   this.SpinnerService.hide();
    //   this.interruptToHome()
    // } else if (this.errorCount < 5) {
    //   this.errorCount++
    //   if (funcName === 'login')
    //     this.login(param)
    // }
  }
}
