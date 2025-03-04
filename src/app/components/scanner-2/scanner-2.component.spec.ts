import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Scanner2Component } from './scanner-2.component';

describe('Scanner2Component', () => {
  let component: Scanner2Component;
  let fixture: ComponentFixture<Scanner2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Scanner2Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Scanner2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
