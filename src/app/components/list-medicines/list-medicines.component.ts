import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-list-medicines',
  imports: [],
  templateUrl: './list-medicines.component.html',
  styleUrl: './list-medicines.component.css',
})
export class ListMedicinesComponent implements OnInit {
  medicines: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchMedicines();
  }

  async fetchMedicines() {
    try {
      const url = 'http://localhost:3000/medicines';
      const res: any = await firstValueFrom(this.http.get(url));
      console.log('--Medicines : ', res);
      this.medicines = res;
    } catch (error) {
      console.log(error);
    }
  }
}
