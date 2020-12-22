import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpHeaders, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, filter } from 'rxjs/operators';
import { AuthenticationService } from '@app/_services';
import { ToastrService } from 'ngx-toastr';

@Injectable()
export class BasicAuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthenticationService, private toastr: ToastrService,) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const authToken = this.authService.getToken();
    const customHeaders = req.clone({
      headers: new HttpHeaders({
        'Authorization': authToken ? "jwt " + authToken : "",
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      })
    });
    // return next.handle(customHeaders).pipe(tap(() => { },
    //   (err: any) => {
    //     if (err instanceof HttpErrorResponse) {
    //       if (err.status !== 401) {
    //         return;
    //       }
    //       console.log('aaaaaa');
    //       this.authService.logout();
    //     }
    //   }));
    return next.handle(customHeaders)
      .pipe(filter(event => event instanceof HttpResponse), tap((event: HttpResponse<any>) => {
        if (event.body.statusCode == 401) {
          this.toastr.error(event.body.message, 'Error', { timeOut: 4000 })
          setTimeout(() => {
            this.authService.logout()
          }, 4000);
        }
      },
      ));
  }
}
