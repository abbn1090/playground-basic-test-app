import { Component, OnInit } from '@angular/core';
import { ApiService } from '../app/services/api-service.service';
import { finalize, map } from 'rxjs/operators';
import { Sort } from '@angular/material/sort';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SearchFilter } from './models/searchFilter';
import { Patient } from './models/patient';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'fhir-app-test';
  displayedColumns: string[] = ['name', 'gender', 'birthDate'];
  dataSource: Patient[] = [];
  sortedData: Patient[] = [];
  lastRequestTime;
  searchForm: FormGroup;
  isSubmitted = false;
  loading = false;
  get formControls() {
    return this.searchForm.controls;
  }
  constructor(
    private apiService: ApiService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit() {
    this.searchForm = this.formBuilder.group({
      name: ['', Validators.pattern('^[a-zA-Z ]*$')],
      dateOfBirth: [
        null,
        Validators.pattern(
          /^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/
        ),
      ],
    });
    this.getPatients();
  }
  search() {
    this.isSubmitted = true;
    this.loading = true;
    if (this.searchForm.invalid) {
      this.loading = false;
      return;
    }
    let { name, dateOfBirth } = this.searchForm.value;
    this.getPatients({ name, exactDoB: dateOfBirth });
  }
  getPatients(filter?: SearchFilter) {
    const startTime = new Date().getTime();
    this.apiService
      .getPatientsWithFilter(
        filter || { startDate: '1960-01-01', endDate: '1965-12-31' }
      )
      .pipe(finalize(() => (this.loading = false)))
      .pipe(map((resources) => resources?.entry))
      .subscribe((data) => {
        console.log(data);
        const endTime = new Date().getTime();
        this.lastRequestTime = endTime - startTime;
        if (data) {
          this.dataSource = data.map((entry) => {
            return {
              id: entry?.resource?.id,
              birthDate: entry?.resource?.birthDate || '',
              gender: entry?.resource?.gender || '',
              fullUrl: entry?.fullUrl || '',
              name: formatName(entry?.resource?.name),
            };
          });
          this.sortData({ active: 'birthDate', direction: 'desc' });
        } else {
          this.dataSource = [];
          this.sortedData = [];
        }
      });
  }
  sortData(sort: Sort) {
    const data = this.dataSource.slice();
    if (!sort.active || sort.direction === '') {
      this.sortedData = data;
      return;
    }

    this.sortedData = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      if (sort.active) {
        return compare(a.birthDate, b.birthDate, isAsc);
      } else {
        return 0;
      }
    });
  }
}
function compare(a: number | string, b: number | string, isAsc: boolean) {
  let aDate = new Date(a);
  let bDate = new Date(b);
  return (aDate < bDate ? -1 : 1) * (isAsc ? 1 : -1);
}
function formatName(names: any[]): string {
  if (!names) return '';
  let name = names[0];
  return name?.given?.join(' ') + ' ' + name?.family;
}
