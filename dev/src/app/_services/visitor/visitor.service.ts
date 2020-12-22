import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { Location } from '@angular/common';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { catchError, tap, map, timeout, retryWhen, delay, take, concat } from 'rxjs/operators';
import { ApiConstants } from '../../_common/constants/api';

@Injectable({
  providedIn: 'root'
})

export class VisitorService {

  constructor(
    private http: HttpClient,
    private _location: Location
  ) { }

  checkVisitorCheckedin(contact): Observable<any> {
    let apiUrl = `${ApiConstants.baseURL}/${ApiConstants.apiVersion}/${ApiConstants.visitorCheckedin}/${contact}`;
    return this.http.get(apiUrl)
      .pipe(
        timeout(6000),
        catchError(err => {
          return throwError("Error in Response");
        })
      );
  }

  checkVisitorCheckedout(contact): Observable<any> {
    let apiUrl = `${ApiConstants.baseURL}/${ApiConstants.apiVersion}/${ApiConstants.visitorCheckedout}/${contact}`;
    return this.http.get(apiUrl)
      .pipe(
        timeout(6000),
        catchError(err => {
          return throwError("Error in Response");
        })
      );
  }

  getProfileByContact(contact): Observable<any> {
    let apiUrl = `${ApiConstants.baseURL}/${ApiConstants.apiVersion}/${ApiConstants.visitorProfile}/${contact}`;
    return this.http.get(apiUrl)
      .pipe(
        timeout(6000),
        catchError(err => {
          return throwError("Error in Response");
        })
      );
  }

  getVisitorByFace(data: any): Observable<any> {
    let apiUrl = `${ApiConstants.baseURL}/${ApiConstants.apiVersion}/${ApiConstants.visitorDetailByFaceData}`;
    return this.http.post(apiUrl, data).pipe(
      timeout(10000),
      catchError(err => {
        return throwError("Error in Response");
      })
    );
  }

  getVisitor(id, queryParams?: any): Observable<any> {
    var params = new HttpParams();
    let apiUrl = `${ApiConstants.baseURL}/${ApiConstants.apiVersion}/${ApiConstants.visitorDetailByid}/${id}`;
    if (queryParams) {
      params = params.append('company', queryParams.company ? queryParams.company : '');
      params = params.append('branch', queryParams.branch ? queryParams.branch : '');
      params = params.append('prefix', queryParams.prefix ? queryParams.prefix : '');
    }
    return this.http.get(apiUrl, { params: params })
      .pipe(
        tap(),
        catchError(this.handleError)
      );
  }

  save(visitor: any): Observable<any> {
    let apiUrl = `${ApiConstants.baseURL}/${ApiConstants.apiVersion}/${ApiConstants.visitors}`;
    return this.http.post(apiUrl, visitor)
      .pipe(
        timeout(18000),
        catchError(err => {
          return throwError("Error in Response");
        })
      );
  }

  checkinPreApprovedVisitor(data: any): Observable<any> {
    let apiUrl = `${ApiConstants.baseURL}/${ApiConstants.apiVersion}/${ApiConstants.visitorPreApprovedCheckin}`;
    return this.http.post(apiUrl, data)
      .pipe(
        timeout(18000),
        catchError(err => {
          return throwError("Error in Response");
        })
      );
  }

  saveProfileAvatar(data: any): Observable<any> {
    let apiUrl = `${ApiConstants.baseURL}/${ApiConstants.apiVersion}/${ApiConstants.visitorProfileAvatar}`;
    return this.http.post(apiUrl, data)
      .pipe(
        timeout(10000),
        catchError(err => {
          return throwError("Error in Response");
        })
      );
  }

  checkout(data: any): Observable<any> {
    let apiUrl = `${ApiConstants.baseURL}/${ApiConstants.apiVersion}/${ApiConstants.visitorSignout}`;
    return this.http.post(apiUrl, data)
      .pipe(
        timeout(10000),
        catchError(err => {
          return throwError("Error in Response");
        })
      );
  }

  approvalStatus(id: any, data: any, queryParams?: any): Observable<any> {
    var params = new HttpParams();
    let apiUrl = `${ApiConstants.baseURL}/${ApiConstants.apiVersion}/${ApiConstants.visitorApproveById}/${id}`;
    if (queryParams) {
      params = params.append('company', queryParams.company ? queryParams.company : '');
      params = params.append('branch', queryParams.branch ? queryParams.branch : '');
      params = params.append('prefix', queryParams.prefix ? queryParams.prefix : '');
    }
    return this.http.put(apiUrl, data, { params: params })
      .pipe(
        tap(),
        catchError(this.handleError)
      );
  }

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
