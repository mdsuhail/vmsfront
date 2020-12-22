import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { Location } from '@angular/common';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap, map, timeout, retryWhen, delay, take, concat } from 'rxjs/operators';
import { ApiConstants } from '../../_common/constants/api';

@Injectable({
  providedIn: 'root'
})

export class FaceService {
  constructor(
    private http: HttpClient,
    private _location: Location,
  ) { }

  recognize(data: any) {
    let apiUrl = `${ApiConstants.faceURL}/${ApiConstants.faceRecognize}`;
    return this.http.post(apiUrl, data).pipe(
      timeout(30000),
      // retryWhen(errors => errors.pipe(delay(1000), take(3), concat(throwError("Giving up Retry.!")))),
      catchError(err => {
        return throwError("Error in Response");
      })
    );
  }

  add(data: any) {
    let apiUrl = `${ApiConstants.faceURL}/${ApiConstants.faceAdd}`;
    return this.http.post(apiUrl, data).pipe(
      timeout(30000),
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
