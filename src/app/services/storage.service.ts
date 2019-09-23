import { Injectable } from '@angular/core';
import browser from 'webextension-polyfill';
import { RedditStorage } from '../types';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  DEFAULT_FOLDER_NAME = 'Reddit';
  DEFAULT_MAX_COMMENT_LENGTH = 947;
  message: string;
  redditStorage: RedditStorage;

  async init(user: string): Promise<void> {
    const redditStorage = await this.getRedditStorage(user);
    if (redditStorage !== null) {
      this.redditStorage = redditStorage;
    } else {
      this.redditStorage = {
        folderName: this.DEFAULT_FOLDER_NAME,
        maxCommentLength: this.DEFAULT_MAX_COMMENT_LENGTH
      };
    }
    this.message = `Welcome ${user}.`;
  }

  async getRedditStorage(user: string): Promise<RedditStorage | null> {
    if (this.redditStorage) {
      return this.redditStorage;
    } else {
      const appStorageKey = this.getUserKey(user);
      const data = await browser.storage.local.get(appStorageKey);
      let redditStorage;
      if (data && (redditStorage = data[appStorageKey])) {
        return redditStorage;
      }
    }
    return null;
  }

  async setRedditStorage(user: string, redditStorage: RedditStorage): Promise<void> {
    this.redditStorage = redditStorage;
    const appStorageKey = this.getUserKey(user);
    await browser.storage.local.set({ [appStorageKey]: redditStorage });
  }

  private getUserKey(user: string): string {
    return `${user}_reddit_settings`;
  }
}
