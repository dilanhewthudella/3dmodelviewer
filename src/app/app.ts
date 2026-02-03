import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductViewer, AmazonProductViewer } from 'product-viewer';

@Component({
  selector: 'app-root',
  imports: [AmazonProductViewer, ProductViewer, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('3dmodelviewer');
  model = 'assets/models/scene.gltf';
  activeTab: 'product' | 'amazon' = 'product';

  setTab(tab: 'product' | 'amazon') {
    this.activeTab = tab;
  }
}
