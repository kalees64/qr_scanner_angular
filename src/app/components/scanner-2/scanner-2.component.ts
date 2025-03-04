import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  OnDestroy,
  AfterViewInit,
  ViewChild,
} from '@angular/core';
import { Html5Qrcode } from 'html5-qrcode';
import { QRCodeStyling } from '@liquid-js/qr-code-styling';

@Component({
  selector: 'app-qr-scanner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './scanner-2.component.html',
  styleUrl: './scanner-2.component.css',
})
export class Scanner2Component implements AfterViewInit, OnDestroy {
  @ViewChild('qrReader', { static: false }) qrReader!: ElementRef;
  scannedData: string | null = null;
  qrImage: string | null = null;
  isScanning = true;
  qrCodeScanner: Html5Qrcode | null = null;
  private qrCode: QRCodeStyling;
  newQr: string = '';

  constructor() {
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

  ngAfterViewInit(): void {
    if (this.isScanning) {
      this.startScanner();
    }
  }

  async startScanner() {
    if (this.qrReader?.nativeElement) {
      this.qrCodeScanner = new Html5Qrcode(this.qrReader.nativeElement.id);
      try {
        await this.qrCodeScanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 300, height: 300 } },
          async (decodedText: string) => {
            this.scannedData = decodedText;
            await this.captureQrCodeImage();
            this.stopScanner();
            this.isScanning = false;
            console.log('--Scanned data : ', {
              original_qr_code_data: this.scannedData,
              original_qr_code_image: this.qrImage,
            });
            this.newQr = await this.generateQrCode(
              JSON.stringify({
                original_qr_code_data: this.scannedData,
              })
            );
            console.log('--Generated qr code : ', this.newQr);
          },
          (error) => console.warn('QR Code scan error:', error)
        );
      } catch (err) {
        console.error('Failed to start QR scanner:', err);
      }
    }
  }

  async stopScanner() {
    if (this.qrCodeScanner) {
      try {
        await this.qrCodeScanner.stop();
        await this.qrCodeScanner.clear();
        this.qrCodeScanner = null;
      } catch (err) {
        console.error('Failed to stop QR scanner:', err);
      }
    }
  }

  // async captureQrCodeImage() {
  //   const videoElement = document.querySelector('video');
  //   if (videoElement) {
  //     const canvas = document.createElement('canvas');
  //     canvas.width = videoElement.videoWidth;
  //     canvas.height = videoElement.videoHeight;
  //     const ctx = canvas.getContext('2d');
  //     if (ctx) {
  //       ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
  //       this.qrImage = canvas.toDataURL('image/png');
  //     }
  //   }
  // }

  async captureQrCodeImage() {
    const videoElement = this.qrReader.nativeElement.querySelector('video');
    if (videoElement) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const qrBoxSize = 300; // Make sure this matches your qrbox size

      // Set canvas size to QR box size
      canvas.width = qrBoxSize;
      canvas.height = qrBoxSize;

      if (ctx) {
        // Calculate cropping coordinates (center the QR code area)
        const x = (videoElement.videoWidth - qrBoxSize) / 2;
        const y = (videoElement.videoHeight - qrBoxSize) / 2;

        // Draw only the QR code section of the video onto the canvas
        ctx.drawImage(
          videoElement,
          x,
          y,
          qrBoxSize,
          qrBoxSize,
          0,
          0,
          qrBoxSize,
          qrBoxSize
        );

        // Convert the QR code image to a data URL (PNG format)
        this.qrImage = canvas.toDataURL('image/png');
        console.log('Captured QR code image:', this.qrImage);
      }
    }
  }

  handleScanAgain() {
    this.scannedData = null;
    this.qrImage = null;
    this.isScanning = true;
    setTimeout(() => this.startScanner(), 500);
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

  ngOnDestroy(): void {
    this.stopScanner();
  }
}
