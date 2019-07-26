import { Component, OnInit } from '@angular/core';

import { RedditService } from '../services/reddit.service';
import { SessionService } from '../services/session.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  username: string;
  password: string;
  errorMessage: string;

  constructor(
    public redditService: RedditService,
    public sessionService: SessionService
  ) { }

  ngOnInit() {
    this.sessionService.message = 'Please log in to continue.';
  }

  login() {
    if (this.username && this.password.trim() && this.password && this.password.trim()) {
      this.sessionService.message = 'Attempting log in...';
      this.redditService.login( this.username, this.password)
      .then(() => {
        return this.redditService.getMe();
      })
      .then(data => {
        this.sessionService.loggedIn = true;
        this.sessionService.renewRedditSession(data.modhash, data.name);
      })
      .catch(() => {
        this.sessionService.message = 'Please log in to continue.';
        this.errorMessage = 'Invalid username or password';
      });
    } else {
        this.errorMessage = 'Invalid username or password';
    }
  }

}
