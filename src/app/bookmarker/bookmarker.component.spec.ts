import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BookmarkerComponent } from './bookmarker.component';

describe('BookmarkerComponent', () => {
  let component: BookmarkerComponent;
  let fixture: ComponentFixture<BookmarkerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BookmarkerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BookmarkerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
