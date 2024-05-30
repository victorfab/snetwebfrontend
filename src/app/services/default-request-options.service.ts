import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
/**
 *the headers in the rest request
 *
 * @export
 * @class DefaultRequestOptions
 * @extends {HttpRequest}
 */
@Injectable()
export class DefaultRequestOptions implements HttpInterceptor {

  constructor() {
  }

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
): Observable<HttpEvent<any>> {
    return next.handle(this.makeRequest(request)).pipe(
        catchError((error: HttpErrorResponse) => {
            return throwError(error);
        })
    );
}



  makeRequest(request: HttpRequest<any>) {
    request = request.clone({
        setHeaders: {
            'Content-Type': 'application/json'
        }
    });
    return request;
  }

}

