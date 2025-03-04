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
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { QRCodeStyling } from '@liquid-js/qr-code-styling';
import { v4 as uuidv4 } from 'uuid';
import { HttpClient } from '@angular/common/http';
import { toast } from 'ngx-sonner';
import { firstValueFrom } from 'rxjs';

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

  qrImage: string | null = null;

  @ViewChild('scanner') scanner!: ZXingScannerComponent;

  isScannerReady = false;

  @ViewChild('qrCanvas', { static: false })
  qrCanvas!: ElementRef<HTMLCanvasElement>;

  @ViewChild('videoElement', { static: false })
  videoElement!: ElementRef<HTMLVideoElement>;

  qrResultString: string = '';

  blobUrl: string | null = null;

  qrDataUrl: string | null = null;
  private qrCode: QRCodeStyling;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient
  ) {
    this.qrCode = new QRCodeStyling({
      width: 150,
      height: 150,
      data: 'something',
      dotsOptions: {
        color: '#000000',
        // color: 'blue',
        type: 'extra-rounded',
      },
      backgroundOptions: {
        color: '#ffffff',
      },
      imageOptions: {
        crossOrigin: 'anonymous',
        margin: 10,
      },
    });
  }

  ngOnInit(): void {
    this.initQrForm();
  }

  ngAfterViewInit() {
    if (!this.scanner) {
      console.error('Scanner component is not initialized yet.');
    }
  }

  navigateTo(path: string) {
    this.router.navigateByUrl(path);
  }

  initQrForm() {
    this.qrScanForm = this.fb.group({
      originalQrCodeData: [''],
      medicineName: ['', Validators.required],
      medicineType: [''],
      medicinePrice: [''],
      manufacturerName: [''],
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

  async onScanSuccess(result: string) {
    this.scannedBarcode = result;
    console.log('Scanned Barcode:', result);

    if (result.startsWith('AssayCR')) {
      this.navigateTo(`re-label/${result}`);
      return;
    }

    try {
      const url = `http://localhost:3000/medicines?original_qr_data=${result}`;
      const res: any = await firstValueFrom(this.http.get(url));
      console.log('--Medicine Data : ', res);
      if (res.length) {
        this.navigateTo(`re-label/${res[0].current_qr_code_access_code}`);
        return;
      }
    } catch (error) {
      console.log(error);
    }

    this.qrDataUrl = await this.generateQrCode(result);

    this.qrScanForm.patchValue({
      originalQrCodeData: JSON.stringify(result),
    });
  }

  onScanAgain() {
    this.scannedBarcode = null;
    this.qrResultString = '';
    this.qrScanForm.reset();
  }

  generateQrCode(data: string): Promise<string> {
    if (data.length > 1000) {
      return Promise.reject(
        'Data is too long for a QR code. Please shorten the content.'
      );
    }

    return new Promise((resolve, reject) => {
      this.qrCode.update({ data });
      const div = document.createElement('div');
      this.qrCode.append(div);
      setTimeout(() => {
        const svgElement = div.querySelector('svg');
        if (svgElement) {
          const serializer = new XMLSerializer();
          const svgString = serializer.serializeToString(svgElement);
          const encodedData = 'data:image/svg+xml;base64,' + btoa(svgString);
          resolve(encodedData);
        } else {
          reject('Failed to generate QR code');
        }
      }, 500);
    });
  }

  payload() {
    return {
      original_qr_data: this.scannedBarcode,
      current_qr_code_access_code: 'AssayCR-' + uuidv4(),
      medicine_name: this.qrScanForm.value.medicineName,
      medicine_type: this.qrScanForm.value.medicineType,
      manufacturer_name: this.qrScanForm.value.manufacturerName,
      price: this.qrScanForm.value.medicinePrice,
      re_labeled_qr_code: '',
    };
  }

  async onSubmit() {
    const newMedicine = this.payload();
    const qrDataUrl = await this.generateQrCode(
      newMedicine.current_qr_code_access_code
    );
    newMedicine.re_labeled_qr_code = qrDataUrl;
    console.log('--New Medicine Data : ', newMedicine);

    try {
      let url = 'http://localhost:3000/medicines';
      const res = await firstValueFrom(this.http.post(url, newMedicine));
      console.log('--Response : ', res);
      toast.success('Medicine Added Successfully');
      this.onScanAgain();
    } catch (error) {
      toast.error('Something went wrong');
    }
  }
}
