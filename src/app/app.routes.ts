import { Routes } from '@angular/router';
import { ScannerComponent } from './components/scanner/scanner.component';
import { ReLabelComponent } from './components/re-label/re-label.component';
import { Scanner2Component } from './components/scanner-2/scanner-2.component';

export const routes: Routes = [
  {
    path: 'scanner',
    component: Scanner2Component,
  },
  {
    path: 're-label',
    component: ReLabelComponent,
  },
  {
    path: '',
    redirectTo: '/scanner',
    pathMatch: 'full',
  },
];
