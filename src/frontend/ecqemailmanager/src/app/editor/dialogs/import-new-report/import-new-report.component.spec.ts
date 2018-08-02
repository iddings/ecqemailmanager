import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportNewReportComponent } from './import-new-report.component';

describe('ImportNewReportComponent', () => {
  let component: ImportNewReportComponent;
  let fixture: ComponentFixture<ImportNewReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImportNewReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportNewReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
