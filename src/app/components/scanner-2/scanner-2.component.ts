import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  OnDestroy,
  AfterViewInit,
  ViewChild,
} from '@angular/core';
import { Html5Qrcode } from 'html5-qrcode';

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

  async captureQrCodeImage() {
    const videoElement = document.querySelector('video');
    if (videoElement) {
      const canvas = document.createElement('canvas');
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        this.qrImage = canvas.toDataURL('image/png');
      }
    }
  }

  handleScanAgain() {
    this.scannedData = null;
    this.qrImage = null;
    this.isScanning = true;
    setTimeout(() => this.startScanner(), 500);
  }

  ngOnDestroy(): void {
    this.stopScanner();
  }
}
