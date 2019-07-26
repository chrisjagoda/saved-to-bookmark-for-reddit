import { Component, OnInit } from '@angular/core';

import { BookmarkService } from './bookmark.service';
import { ConfigService } from './config.service';
import { RedditService } from './reddit.service';

import { Bookmark, BookmarkFolder } from './types';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css', './loading.css', './tooltip.css'],
  providers: [BookmarkService, ConfigService, RedditService]
})
export class AppComponent {
  title: string = 'Saved to Bookmark';
  subtitle: string = 'for Reddit';
  savedPosts: Array<Bookmark>;
  bookmarks: Array<Bookmark>;
  subreddits: Array<{name:string, checked: boolean}>;
  savedPostsRetrieved: boolean = false;
  bookmarkFolder: BookmarkFolder;
  allChecked: boolean = true;

  constructor(
    private bookmarkService: BookmarkService,
    private configService: ConfigService,
    private redditService: RedditService
  ){ }

  ngOnInit() {
    var self = this;
    // Get configuration file
    this.configService.getConfig()
    // Initiate reddit service
    .then(config => this.redditService.init(config))
    // Get saved posts
    .then(() => this.redditService.getAllSaved())
    // Store posts for further processing
    .then(saved => {
      this.savedPosts = saved;
      this.bookmarks = saved.slice();
      // get subreddits of saved posts
      this.subreddits = this.getSubreddits();
      // get bookmark folder if extension has been run before
      return this.bookmarkService.getBookmarkFolder();
    })
    // display posts and set bookmark folder
    .then(result => {
      self.bookmarkFolder = result;      
      self.savedPostsRetrieved = true;
    });
  }

  // get subreddits from saved posts
  getSubreddits(): Array<{name:string, checked: boolean}> {
    return this.savedPosts.map(post => post.subreddit)
    .filter((value, index, self) => self.indexOf(value) === index)
    .sort()
    .map(subreddit => {
      return {name: subreddit, checked: this.allChecked};
    });
  }

  // filters subreddits - toggled on and off with checkbox
  filterSubreddit(subreddit) {
    if (subreddit.checked) { // add sub to bookmarks    
      this.bookmarks = this.bookmarks
      .concat(this.savedPosts
      .filter(post => post.subreddit === subreddit.name));
    }
    else { // if sub is already shown, remove from bookmarks
      this.bookmarks = this.bookmarks
      .filter(post => post.subreddit !== subreddit.name);
    }
  }

  // checks or unchecks all subreddit categories
  changeAll() {
    this.subreddits.forEach(subreddit => {
      subreddit.checked = this.allChecked;
    });
    this.bookmarks = (this.allChecked) ? this.savedPosts: [];
  }

  // updates the folder the bookmarks will be saved to
  updateSaveFolder() {
    this.bookmarkService.updateBookmarkFolder(this.bookmarkFolder.name)
    .then(result => {
      this.bookmarkFolder = result;
    });
  }

  // creates bookmark folder - called with create bookmarks or manually
  createBookmarkFolder(): Promise<any> {
    return new Promise(resolve => {
      this.bookmarkService.createBookmarkFolder()
      .then(result => {
        this.bookmarkFolder = result;
        resolve();
      });
    });
  }

  // create bookmarks in the current save directory
  createBookmarks() {
    // if bookmark folder id is false, create bookmark folder then bookmarks
    if (!this.bookmarkService.bookmarkFolderId) {
      this.createBookmarkFolder()
      .then(() => {
        this.bookmarkService.createBookmarks(this.bookmarks);
      });
    }
    else { // else create bookmarks in active folder
      this.bookmarkService.createBookmarks(this.bookmarks);
    }
  }

  // removed duplicate bookmarks
  removeDuplicates() {
   this.bookmarkService.removeDuplicates(this.bookmarks)
    .then(bookmarks => {
     this.bookmarks = bookmarks;
    });
  }
}