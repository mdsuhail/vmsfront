import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { Location } from '@angular/common';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap, map, timeout } from 'rxjs/operators';
import { ApiConstants } from '../../_common/constants/api';

@Injectable({
  providedIn: 'root'
})

export class OtpService {
  constructor(
    private http: HttpClient,
    private _location: Location,
  ) { }

  send(data: any) {
    let apiUrl = `${ApiConstants.baseURL}/${ApiConstants.apiVersion}/${ApiConstants.otpSend}`;
    return this.http.post(apiUrl, data).pipe(
      tap(),
      catchError(this.handleError)
    );
  }

  verify(data: any) {
    let apiUrl = `${ApiConstants.baseURL}/${ApiConstants.apiVersion}/${ApiConstants.otpVerify}`;
    return this.http.post(apiUrl, data).pipe(
      tap(),
      catchError(this.handleError)
    );
  }

  sendOldVisitor(data: any) {
    let apiUrl = `${ApiConstants.baseURL}/${ApiConstants.apiVersion}/${ApiConstants.oldVisitor}`;
    return this.http.post(apiUrl, data).pipe(
      tap(),
      catchError(this.handleError)
    );
  }

  tinyUrl(data: any) {
    let apiUrl = `${ApiConstants.baseURL}/${ApiConstants.apiVersion}/${ApiConstants.tinyUrl}`;
    return this.http.post(apiUrl, data).pipe(
      timeout(6000),
      catchError(err => {
        return throwError("Error in Response");
      })
    );
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

}
