import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ProductViewer } from './product-viewer/product-viewer';

@Component({
  selector: 'app-root',
  imports: [ProductViewer],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('3dmodelviewer');
}
