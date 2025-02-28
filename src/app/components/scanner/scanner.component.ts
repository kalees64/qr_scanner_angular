import { Component, OnInit } from '@angular/core';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { BarcodeFormat } from '@zxing/library';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-scanner',
  imports: [ZXingScannerModule, CommonModule, ReactiveFormsModule],
  templateUrl: './scanner.component.html',
  styleUrl: './scanner.component.css',
})
export class ScannerComponent implements OnInit {
  formats = [
    BarcodeFormat.AZTEC,
    BarcodeFormat.CODABAR,
    BarcodeFormat.CODE_39,
    BarcodeFormat.CODE_93,
    BarcodeFormat.CODE_128,
    BarcodeFormat.DATA_MATRIX,
    BarcodeFormat.EAN_8,
    BarcodeFormat.EAN_13,
    BarcodeFormat.ITF,
    BarcodeFormat.MAXICODE,
    BarcodeFormat.PDF_417,
    BarcodeFormat.QR_CODE,
    BarcodeFormat.RSS_14,
    BarcodeFormat.RSS_EXPANDED,
    BarcodeFormat.UPC_A,
    BarcodeFormat.UPC_E,
    BarcodeFormat.UPC_EAN_EXTENSION,
  ];

  scannedBarcode: string | null = null;

  availableDevices: MediaDeviceInfo[] = [];
  selectedDevice: MediaDeviceInfo | undefined = undefined;

  qrScanForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initQrForm();
  }

  initQrForm() {
    this.qrScanForm = this.fb.group({
      originalQrCodeData: [''],
      modifiedQrCodeData: [''],
    });
  }

  onCamerasFound(devices: MediaDeviceInfo[]) {
    this.availableDevices = devices;
    if (devices.length > 0) {
      this.selectedDevice = devices[0];
      console.log('--All devices : ', devices);
    }
  }

  onScanSuccess(result: string) {
    this.scannedBarcode = result;
    console.log('Scanned Barcode:', result);
    this.qrScanForm.patchValue({
      originalQrCodeData: JSON.stringify(result).slice(
        1,
        JSON.stringify(result).length - 1
      ),
      modifiedQrCodeData: JSON.stringify(result).slice(
        1,
        JSON.stringify(result).length - 1
      ),
    });
  }

  onScanAgain() {
    this.scannedBarcode = null;
    this.qrScanForm.reset();
  }

  onSubmit() {
    console.log('--Form submitted:', this.qrScanForm.value);
  }
}
