import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReLabelComponent } from './re-label.component';

describe('ReLabelComponent', () => {
  let component: ReLabelComponent;
  let fixture: ComponentFixture<ReLabelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReLabelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReLabelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
