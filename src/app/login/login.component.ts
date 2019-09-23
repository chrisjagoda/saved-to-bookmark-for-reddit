import { Component, OnInit } from '@angular/core';

import { RedditService } from '../services/reddit.service';
import { StorageService } from '../services/storage.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  private readonly INVALID_LOGIN_ERROR_MESSAGE = 'Invalid username or password';
  username: string;
  password: string;
  errorMessage: string;

  constructor(
    public redditService: RedditService,
    public storageService: StorageService
  ) { }

  ngOnInit() {
    this.storageService.message = 'Please log in to continue.';
  }

  async login() {
    if (this.username && (this.username = this.username.trim()) &&
        this.password && (this.password = this.password.trim())) {
      try {
        return await this.redditService.login(this.username, this.password);
      } catch { }
    }

    this.errorMessage = this.INVALID_LOGIN_ERROR_MESSAGE;
  }
}
