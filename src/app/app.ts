import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ProductViewer } from './product-viewer/product-viewer';
import { AmazonProductViewer } from './amazon-product-viewer/amazon-product-viewer';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [ProductViewer, AmazonProductViewer, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('3dmodelviewer');
  activeTab: 'product' | 'amazon' = 'product';

  setTab(tab: 'product' | 'amazon') {
    this.activeTab = tab;
  }
}
