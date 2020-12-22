import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { Location } from '@angular/common';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap, map } from 'rxjs/operators';
import { ApiConstants } from '../../_common/constants/api';
import { VisitorCategory } from '../../_models/visitorcategory';


@Injectable({
  providedIn: 'root'
})
export class VisitorcategoriesService {

  constructor(
    private http: HttpClient
  ) { }

  getVisitorCategories(): Observable<any> {
    let apiUrl = `${ApiConstants.baseURL}/${ApiConstants.apiVersion}/${ApiConstants.visitorCategories}`;
    return this.http.get<VisitorCategory[]>(apiUrl)
      .pipe(
        tap(),
        catchError(this.handleError)
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
