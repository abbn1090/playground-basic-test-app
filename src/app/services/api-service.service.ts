import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs/internal/Observable';
import { GetPatientsResponse } from '../models/getPatientsResponse';
import { SearchFilter } from '../models/searchFilter';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private httpClient: HttpClient) {}

  getPatients(): Observable<GetPatientsResponse> {
    return this.httpClient.get(environment.queryURI + '/Patient', {
      headers: this.getHeaders(),
    }) as Observable<GetPatientsResponse>;
  }
  getPatientsWithFilter(filter: SearchFilter): Observable<GetPatientsResponse> {
    let url = '';

    if (filter?.exactDoB) {
      url += `${url === '' ? '?' : '&'}birthdate=eq${filter?.exactDoB}`;
    } else {
      if (filter?.startDate) {
        url += `${url === '' ? '?' : '&'}birthdate=ge${filter?.startDate}`;
      }
      if (filter?.endDate) {
        url += `${url === '' ? '?' : '&'}birthdate=le${filter?.endDate}`;
      }
    }
    if (filter?.name) {
      url += `${url === '' ? '?' : '&'}name:contains=${filter?.name}`;
    }
    return this.httpClient.get(environment.queryURI + `/Patient${url}`, {
      headers: this.getHeaders(),
    }) as Observable<GetPatientsResponse>;
  }

  private getHeaders(): HttpHeaders {
    const headers = new HttpHeaders({
      'Content-Type': 'application/fhir+json',
    });
    return headers;
  }
}
