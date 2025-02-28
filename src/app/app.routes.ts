import { Routes } from '@angular/router';
import { ScannerComponent } from './components/scanner/scanner.component';
import { ReLabelComponent } from './components/re-label/re-label.component';

export const routes: Routes = [
  {
    path: 'scanner',
    component: ScannerComponent,
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
