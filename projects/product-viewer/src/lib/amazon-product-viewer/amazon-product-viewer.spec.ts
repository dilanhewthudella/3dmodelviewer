import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AmazonProductViewer } from './amazon-product-viewer';

describe('AmazonProductViewer', () => {
  let component: AmazonProductViewer;
  let fixture: ComponentFixture<AmazonProductViewer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AmazonProductViewer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AmazonProductViewer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
