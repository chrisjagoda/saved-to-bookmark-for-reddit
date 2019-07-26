import { Injectable } from '@angular/core';
import { BookmarkFolder, Bookmark } from '../types';

@Injectable()
export class BookmarkService {
  bookmarkFolder: string;
  bookmarkFolderId: string;

  setBookmarkFolder(bookmarkFolder: string): Promise<BookmarkFolder> {
    const self = this;
    return new Promise(resolve => {
      const options = {
        title: bookmarkFolder
      };
      chrome.bookmarks.search(options, nodes => {
        const bookmarkFolderNode = nodes.find(node => {
          return !node.url;
        });
        self.bookmarkFolderId = bookmarkFolderNode ? bookmarkFolderNode.id : undefined;
        self.bookmarkFolder = bookmarkFolder;
        resolve(<BookmarkFolder>{
          name: self.bookmarkFolder,
          created: Boolean(bookmarkFolderNode)
        });
      });
    });
  }

  createBookmarkFolder(): Promise<BookmarkFolder>  {
    const self = this;
    return new Promise(resolve => {
      if (!self.bookmarkFolderId) {
        chrome.bookmarks.create({title: this.bookmarkFolder}, node => {
          self.bookmarkFolderId = node.id;
          resolve(<BookmarkFolder>{
            name: self.bookmarkFolder, created: true
          });
        });
      } else {
        resolve(<BookmarkFolder>{
          name: self.bookmarkFolder, created: true
        });
      }
    });
  }

  createBookmarks(bookmarks: Array<Bookmark>) {
    const self = this;
    bookmarks.forEach(bookmark => {
      chrome.bookmarks.create({
        parentId: self.bookmarkFolderId,
        title: bookmark.body ? bookmark.title + ' - ' + bookmark.body : bookmark.title,
        url: bookmark.url
      });
    });
  }

  removeDuplicates(bookmarks: Array<Bookmark>): Promise<Array<Bookmark>> {
    const self = this;
    return new Promise(resolve => {
      if (self.bookmarkFolderId) {
        chrome.bookmarks.getChildren(self.bookmarkFolderId, nodes => {
          resolve(bookmarks.filter(bookmark => {
            return nodes.findIndex(node => node.url === bookmark.url || node.title === bookmark.title) < 0;
          }));
        });
      } else {
        resolve(bookmarks);
      }
    });
  }
}
