import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { Location } from '@angular/common';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap, map } from 'rxjs/operators';
import { ApiConstants } from '../../_common/constants/api';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {

  constructor(
    private http: HttpClient,
    private _location: Location
  ) { }

  // getCompany() {
  //   var id = ApiConstants.companyId;
  //   let apiUrl = `${ApiConstants.baseURL}/${ApiConstants.apiVersion}/${ApiConstants.companyDetail}/${id}`;
  //   return this.http.get(apiUrl)
  //     .pipe(
  //       tap(),
  //       catchError(this.handleError)
  //     );
  // }

  back() {
    this._location.back();
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
