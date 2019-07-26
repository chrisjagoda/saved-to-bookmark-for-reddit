import { TestBed, inject } from '@angular/core/testing';

import { BookmarkService } from './bookmark.service';

describe('BookmarkService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BookmarkService]
    });
  });

  it('should be created', inject([BookmarkService], (service: BookmarkService) => {
    expect(service).toBeTruthy();
  }));
});
