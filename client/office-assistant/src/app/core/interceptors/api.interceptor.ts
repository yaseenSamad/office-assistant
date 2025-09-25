import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpErrorResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const apiInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
  const toastr = inject(ToastrService);
  const baseUrl = 'http://localhost:5000';

  let apiReq = req.clone({
    url: `${baseUrl}${req.url}`,
  });

  const token = localStorage.getItem('token');
  if (token) {
    apiReq = apiReq.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return next(apiReq).pipe(
    catchError((error: HttpErrorResponse) => {
      const errMsg = error.error?.error || error.message || 'Something went wrong';
      toastr.error(errMsg, 'Failure');
      return throwError(() => error);
    })
  );
};
