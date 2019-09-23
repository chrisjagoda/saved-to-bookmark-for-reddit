import { Injectable } from '@angular/core';
import browser from 'webextension-polyfill';
import { Bookmark } from '../types';

@Injectable()
export class BookmarkService {
  folderId: string;

  async setBookmarkFolder(folderName: string): Promise<void> {
    const options = {
      title: folderName
    };
    const nodes = await browser.bookmarks.search(options);
    const folderNameNode = nodes.find(node => {
      return !node.url;
    });
    this.folderId = folderNameNode ? folderNameNode.id : undefined;
  }

  async createBookmarkFolder(folderName: string): Promise<void>  {
    if (!this.folderId) {
      const node = await browser.bookmarks.create({title: folderName});
      this.folderId = node.id;
    }
  }

  createBookmarks(bookmarks: Array<Bookmark>) {
    bookmarks.forEach(bookmark => {
      browser.bookmarks.create({
        parentId: this.folderId,
        title: bookmark.body ? bookmark.title + ' - ' + bookmark.body : bookmark.title,
        url: bookmark.url
      });
    });
  }

  async removeDuplicates(bookmarks: Array<Bookmark>): Promise<Array<Bookmark>> {
    if (this.folderId) {
      const nodes = await browser.bookmarks.getChildren(this.folderId);
      return bookmarks.filter(bookmark => {
        return nodes.findIndex(node => node.url === bookmark.url) === -1;
      });
    }
  }
}
