import { Component, OnInit } from '@angular/core';

import { BookmarkService } from '../services/bookmark.service';
import { RedditService } from '../services/reddit.service';

import { Bookmark } from '../types';
import { StorageService } from '../services/storage.service';

@Component({
  selector: 'app-bookmarker',
  templateUrl: './bookmarker.component.html',
  styleUrls: ['./bookmarker.component.css', '../../css/tooltip.css']
})
export class BookmarkerComponent implements OnInit {
  private savedPosts: Array<Bookmark>;
  bookmarks: Array<Bookmark>;
  subreddits: Array<{name: string, checked: boolean}>;
  allChecked = true;
  savedPostsLoaded = false;
  folderName: string;
  maxCommentLength: number;

  constructor(
    public bookmarkService: BookmarkService,
    public redditService: RedditService,
    private readonly storageService: StorageService
  ) { }

  ngOnInit() {
    this.storageService.init(this.redditService.username);
  }

  async getSaved() {
    const saved = await this.redditService.getAllSaved();
    this.setSavedPosts(saved);
    this.bookmarks = saved;
    this.subreddits = this.getSubreddits();
    this.folderName = this.storageService.redditStorage.folderName;
    this.maxCommentLength = this.storageService.redditStorage.maxCommentLength;
    this.bookmarkService.setBookmarkFolder(this.folderName);
    this.setMaxCommentLengthOnBookmarks();
    this.savedPostsLoaded = true;
  }

  getSubreddits(): Array<{name: string, checked: boolean}> {
    const subreddits = Array.from(new Set(this.getSavedPosts().map(post => post.subreddit)));
    return subreddits.sort()
    .map(subreddit => {
      return {name: subreddit, checked: true};
    });
  }

  filterSubreddit(subreddit) {
    if (subreddit.checked) {
      this.bookmarks = this.bookmarks
      .concat(this.getSavedPosts().filter(post => post.subreddit === subreddit.name));
    } else {
      this.bookmarks = this.bookmarks.filter(post => post.subreddit !== subreddit.name);
    }
  }

  changeAll() {
    this.subreddits.forEach(subreddit => {
      subreddit.checked = this.allChecked;
    });
    this.bookmarks = this.allChecked ? this.getSavedPosts() : [];
  }

  updateMaxCommentLength() {
    this.allChecked = true;
    this.changeAll();
    this.setMaxCommentLengthOnBookmarks();
    this.setRedditStorage();
  }

  async updateSaveFolder() {
    await this.bookmarkService.setBookmarkFolder(this.folderName);
    this.setRedditStorage();
  }

  async createBookmarkFolder(): Promise<void> {
    return await this.bookmarkService.createBookmarkFolder(this.folderName);
  }

  async createBookmarks() {
    if (!this.bookmarkService.folderId) {
      await this.createBookmarkFolder();
    }
    this.bookmarkService.createBookmarks(this.bookmarks);
  }

  async removeDuplicates() {
   this.bookmarks = await this.bookmarkService.removeDuplicates(this.bookmarks);
  }

  private getSavedPosts(): Bookmark[] {
    return JSON.parse(JSON.stringify(this.savedPosts));
  }

  private setSavedPosts(bookmarks: Bookmark[]) {
    this.savedPosts = JSON.parse(JSON.stringify(bookmarks));
  }

  private setRedditStorage() {
    this.storageService.setRedditStorage(this.redditService.username, {
      folderName: this.folderName,
      maxCommentLength: this.maxCommentLength
    });
  }

  private setMaxCommentLengthOnBookmarks() {
    this.bookmarks.forEach(bookmark => {
      bookmark.body = this.trim(bookmark.body);
    });
  }

  private trim(text: string): string {
    return text && this.maxCommentLength > 0 ?
      (text.length > this.maxCommentLength ?
        text.substring(0, this.maxCommentLength) + '...' :
        text) :
      undefined;
  }
}
