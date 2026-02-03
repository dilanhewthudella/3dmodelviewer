import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductViewer } from './product-viewer';

describe('ProductViewer', () => {
  let component: ProductViewer;
  let fixture: ComponentFixture<ProductViewer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductViewer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductViewer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
