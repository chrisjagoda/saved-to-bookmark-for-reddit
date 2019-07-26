import { Injectable } from '@angular/core';
import { RedditSession } from '../types';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  message: string;
  loggedIn = false;
  rememberMe: boolean;
  redditSession: RedditSession;

  getRedditSession(): Promise<RedditSession> {
    const self = this;
    if (!this.redditSession) {
      return new Promise(resolve => {
        chrome.storage.local.get('redditSession', function(data: RedditSession) {
          if (data && data['redditSession']) {
            self.redditSession = JSON.parse(data['redditSession']);
            resolve(self.redditSession);
          } else {
            resolve();
          }
        });
      });
    }
  }

  setRedditSession(redditSession: RedditSession) {
    this.redditSession = redditSession;
    chrome.storage.local.set({redditSession: redditSession && this.rememberMe ? JSON.stringify(redditSession) : ''});
  }

  renewRedditSession(modhash: string, username: string) {
    const expires = new Date();
    expires.setDate(expires.getDate() + 1);
    if (!this.redditSession) {
      this.setRedditSession({
        bookmarkFolder: 'Reddit',
        username: username,
        modhash: modhash,
        expires: expires.getTime()
      });
    } else {
      this.setRedditSession({
        bookmarkFolder: this.redditSession.bookmarkFolder,
        username: username,
        modhash: modhash,
        expires: expires.getTime()
      });
    }
  }
}
