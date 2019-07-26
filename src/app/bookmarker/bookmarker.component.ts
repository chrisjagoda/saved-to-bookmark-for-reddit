import { Component, OnInit } from '@angular/core';

import { BookmarkService } from '../services/bookmark.service';
import { RedditService } from '../services/reddit.service';

import { Bookmark, BookmarkFolder } from '../types';
import { SessionService } from '../services/session.service';

@Component({
  selector: 'app-bookmarker',
  templateUrl: './bookmarker.component.html',
  styleUrls: ['./bookmarker.component.css', '../tooltip.css']
})
export class BookmarkerComponent implements OnInit {
  bookmarkFolder: BookmarkFolder;
  savedPosts: Array<Bookmark>;
  bookmarks: Array<Bookmark>;
  subreddits: Array<{name: string, checked: boolean}>;
  allChecked = true;
  savedPostsRetrieved = false;

  constructor(
    private bookmarkService: BookmarkService,
    public redditService: RedditService,
    public sessionService: SessionService
  ) { }

  ngOnInit() {
    this.sessionService.message = `Welcome ${this.redditService.username}.`;
  }

  getSaved() {
    this.sessionService.message = `Welcome ${this.redditService.username}. Please wait while your posts are retrieved...`;
    this.savedPostsRetrieved = false;
    this.redditService.getAllSaved()
    .then(saved => {
      this.savedPosts = saved;
      this.bookmarks = saved.slice();
      this.subreddits = this.getSubreddits();
      return this.bookmarkService.setBookmarkFolder(this.sessionService.redditSession.bookmarkFolder);
    })
    .then(result => {
      this.bookmarkFolder = result;
      this.savedPostsRetrieved = true;
      this.sessionService.message = `Welcome ${this.redditService.username}.`;
    });
  }

  getSubreddits(): Array<{name: string, checked: boolean}> {
    return this.savedPosts.map(post => post.subreddit)
    .filter((value, index, self) => self.indexOf(value) === index)
    .sort()
    .map(subreddit => {
      return {name: subreddit, checked: true};
    });
  }

  filterSubreddit(subreddit) {
    if (subreddit.checked) {
      this.bookmarks = this.bookmarks
      .concat(this.savedPosts
      .filter(post => post.subreddit === subreddit.name));
    } else {
      this.bookmarks = this.bookmarks
      .filter(post => post.subreddit !== subreddit.name);
    }
  }

  changeAll() {
    this.subreddits.forEach(subreddit => {
      subreddit.checked = this.allChecked;
    });
    this.bookmarks = this.allChecked ? this.savedPosts : [];
  }

  updateSaveFolder() {
    this.bookmarkService.setBookmarkFolder(this.bookmarkFolder.name)
    .then(result => {
      this.bookmarkFolder = result;
      this.sessionService.setRedditSession({
        bookmarkFolder: this.bookmarkFolder.name,
        username: this.sessionService.redditSession.username,
        modhash: this.sessionService.redditSession.modhash,
        expires: this.sessionService.redditSession.expires
      });
    });
  }

  createBookmarkFolder(): Promise<any> {
    return new Promise(resolve => {
      this.bookmarkService.createBookmarkFolder()
      .then(result => {
        this.bookmarkFolder = result;
        resolve();
      });
    });
  }

  createBookmarks() {
    if (!this.bookmarkService.bookmarkFolderId) {
      this.createBookmarkFolder()
      .then(() => {
        this.bookmarkService.createBookmarks(this.bookmarks);
      });
    } else {
      this.bookmarkService.createBookmarks(this.bookmarks);
    }
  }

  removeDuplicates() {
   this.bookmarkService.removeDuplicates(this.bookmarks)
    .then(bookmarks => {
     this.bookmarks = bookmarks;
    });
  }

  switchUser() {
    this.sessionService.setRedditSession(undefined);
    this.sessionService.rememberMe = false;
    this.sessionService.loggedIn = false;
  }
}
