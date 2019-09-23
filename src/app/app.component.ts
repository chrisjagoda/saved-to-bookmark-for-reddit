import { Component, OnInit, ViewChild } from '@angular/core';
import { StorageService } from './services/storage.service';
import { RedditService } from './services/reddit.service';
import { BookmarkerComponent } from './bookmarker/bookmarker.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css', '../css/loading.css']
})
export class AppComponent implements OnInit {
  @ViewChild(BookmarkerComponent) bookmarker;

  constructor(
    public redditService: RedditService,
    public storageService: StorageService
  ) { }

  async ngOnInit() {
    const existingUser = await this.redditService.getMe();
    if (existingUser !== null) {
      this.redditService.loggedIn = true;
    }
  }

  switchUser() {
    this.redditService.loggedIn = false;
  }
}
