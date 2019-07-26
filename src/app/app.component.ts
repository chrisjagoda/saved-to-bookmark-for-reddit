import { Component, OnInit } from '@angular/core';

import { SessionService } from './services/session.service';
import { RedditService } from './services/reddit.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css', './loading.css']
})
export class AppComponent implements OnInit {
  constructor(
    public redditService: RedditService,
    public sessionService: SessionService
  ) { }

  ngOnInit() {
    this.sessionService.getRedditSession()
    .then(redditSession => {
      if (redditSession &&
        new Date(redditSession.expires).getTime() > new Date().getTime()) {
        this.sessionService.loggedIn = true;
        this.sessionService.rememberMe = true;
        this.redditService.init(redditSession.modhash, redditSession.username);
      }
    });
  }
}
