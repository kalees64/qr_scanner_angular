import { Routes } from '@angular/router';
import { ScannerComponent } from './components/scanner/scanner.component';
import { ReLabelComponent } from './components/re-label/re-label.component';
import { ListMedicinesComponent } from './components/list-medicines/list-medicines.component';

export const routes: Routes = [
  {
    path: 'scanner',
    component: ScannerComponent,
  },
  {
    path: 're-label/:id',
    component: ReLabelComponent,
  },
  {
    path: 'all-medicines',
    component: ListMedicinesComponent,
  },
  {
    path: '',
    redirectTo: '/scanner',
    pathMatch: 'full',
  },
];
