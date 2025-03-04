import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { toast } from 'ngx-sonner';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-re-label',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './re-label.component.html',
  styleUrl: './re-label.component.css',
})
export class ReLabelComponent implements OnInit {
  medicineId!: string;

  medicineForm!: FormGroup;

  medicine: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.medicineId = this.route.snapshot.params['id'];
  }

  ngOnInit(): void {
    this.fetchMedicineDetails();
    this.initMedicineForm();
  }

  initMedicineForm() {
    this.medicineForm = this.fb.group({
      originalQrCodeData: [''],
      medicineName: ['', Validators.required],
      medicineType: [''],
      medicinePrice: [null],
      manufacturerName: [''],
    });
  }

  async fetchMedicineDetails() {
    try {
      let url = `http://localhost:3000/medicines?current_qr_code_access_code=${this.medicineId}`;
      const res: any = await firstValueFrom(this.http.get(url));
      console.log('--Response : ', res);
      if (!res.length) {
        this.medicineId = '';
        toast.error('No data found');
        return;
      }

      this.medicine = res[0];

      this.medicineForm.patchValue({
        originalQrCodeData: res[0].original_qr_data,
        medicineName: res[0].medicine_name,
        medicineType: res[0].medicine_type,
        medicinePrice: res[0].price,
        manufacturerName: res[0].manufacturer_name,
      });
    } catch (error: any) {
      console.log('--error ', error);
      if (error.status === 404) {
        this.medicineId = '';
        toast.error('No data found');

        return;
      }
      toast.error('Something went wrong');
    }
  }

  payload() {
    return {
      original_qr_data: this.medicine.original_qr_data,
      current_qr_code_access_code: this.medicine.current_qr_code_access_code,
      medicine_name: this.medicineForm.value.medicineName,
      medicine_type: this.medicineForm.value.medicineType,
      manufacturer_name: this.medicineForm.value.manufacturerName,
      price: this.medicineForm.value.medicinePrice,
      re_labeled_qr_code: this.medicine.re_labeled_qr_code,
    };
  }

  async onSubmit() {
    const updateMedicine = this.payload();
    console.log('--Update Medicine : ', updateMedicine);

    try {
      let url = `http://localhost:3000/medicines/${this.medicine.id}`;
      const res = await firstValueFrom(this.http.patch(url, updateMedicine));
      console.log('--Response : ', res);
      toast.success('Medicine updated successfully');
      this.router.navigate(['/all-medicines']);
    } catch (error) {
      toast.error('Something went wrong');
    }
  }
}
