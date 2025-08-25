import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MantananceBlockedComponent } from './mantanance-blocked.component';

describe('MantananceBlockedComponent', () => {
  let component: MantananceBlockedComponent;
  let fixture: ComponentFixture<MantananceBlockedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MantananceBlockedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MantananceBlockedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
