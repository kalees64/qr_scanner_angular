import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ZXingScannerComponent, ZXingScannerModule } from '@zxing/ngx-scanner';
import { BarcodeFormat } from '@zxing/library';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-scanner',
  imports: [ZXingScannerModule, CommonModule, ReactiveFormsModule],
  templateUrl: './scanner.component.html',
  styleUrl: './scanner.component.css',
})
export class ScannerComponent implements OnInit, AfterViewInit {
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

  qrImage: string | null = null;

  @ViewChild('scanner') scanner!: ZXingScannerComponent;

  isScannerReady = false;

  @ViewChild('qrCanvas', { static: false })
  qrCanvas!: ElementRef<HTMLCanvasElement>;

  @ViewChild('videoElement', { static: false })
  videoElement!: ElementRef<HTMLVideoElement>;

  qrResultString: string = '';

  blobUrl: string | null = null;

  dataUrl: string | null = null;

  ngOnInit(): void {
    this.initQrForm();
  }

  ngAfterViewInit() {
    if (!this.scanner) {
      console.error('Scanner component is not initialized yet.');
    }
  }

  initQrForm() {
    this.qrScanForm = this.fb.group({
      originalQrCodeData: [''],
      modifiedQrCodeData: [''],
    });
  }

  onScannerReady() {
    this.isScannerReady = true;
    console.log('Scanner is ready.');
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

    // Capture the QR code image
    // if (this.isScannerReady) {
    //   setTimeout(() => {
    //     this.captureImage(); // Wait a bit before capturing
    //   }, 1000);
    // } else {
    //   console.error('Scanner is not ready yet.');
    // }
  }

  // captureImage() {
  //   setTimeout(() => {
  //     const videoElement =
  //       this.scanner?.previewElemRef?.nativeElement.querySelector('video');
  //     console.log('--Video element:', videoElement);

  //     if (videoElement) {
  //       videoElement.onloadeddata = () => {
  //         // Wait until video is fully loaded
  //         console.log('--Video is now loaded and ready for capture.');
  //         const canvas = document.createElement('canvas');
  //         canvas.width = videoElement.videoWidth;
  //         canvas.height = videoElement.videoHeight;
  //         const context = canvas.getContext('2d');

  //         if (context) {
  //           context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
  //           this.qrImage = canvas.toDataURL('image/png'); // Convert to Base64
  //           console.log('--Captured QR Image:', this.qrImage);
  //         }
  //       };
  //     } else {
  //       console.error('Video element not found.');
  //     }
  //   }, 500); // Small delay to allow video stream to start
  // }

  onCodeResult(resultString: string) {
    this.qrResultString = resultString;
    this.captureAndUpload();
  }

  captureAndUpload() {
    const canvas = this.qrCanvas.nativeElement;
    const video = this.videoElement.nativeElement;
    const context = canvas.getContext('2d');

    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (blob) {
          const reader = new FileReader();
          reader.onload = () => {
            this.dataUrl = reader.result as string; // Store data URL for binding
            console.log('Captured Image Data URL : ', this.dataUrl);
          };
          reader.readAsDataURL(blob);

          const formData = new FormData();
          formData.append('qrImage', blob, 'qr-code.png');
          formData.append('qrData', this.qrResultString);

          // Display blob as image
          const blobUrl = URL.createObjectURL(blob);
          this.blobUrl = blobUrl; // Store the blob URL to bind in the template

          console.log('Captured Image Object URL : ', blobUrl);

          console.log('--Form Data : ', formData);
          console.log('--Form Data Image : ', blob);

          // this.http
          //   .post('http://localhost:3000/qrcodes/upload', formData)
          //   .subscribe((response) => {
          //     console.log('QR Code image uploaded successfully', response);
          //   });
        }
      }, 'image/png');
    }
  }

  onScanAgain() {
    this.scannedBarcode = null;
    this.qrResultString = '';
    this.qrScanForm.reset();
  }

  onSubmit() {
    console.log('--Form submitted:', this.qrScanForm.value);
  }
}
