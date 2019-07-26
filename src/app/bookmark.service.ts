import { Injectable } from '@angular/core';
import { } from 'chrome';

import { BookmarkFolder, Bookmark } from './types';

@Injectable()
export class BookmarkService {
  private dataStore = window.localStorage;
  bookmarkFolder: string = "Reddit"; //default bookmark folder name
  bookmarkFolderId: string = null;

  // gets bookmark folder from data strorage if exists, and checks if created
  getBookmarkFolder(): Promise<BookmarkFolder> {
    var self = this;
    var isCreated = false;
    this.bookmarkFolderId = null;

    if (this.dataStore.getItem("bookmarkFolder"))
      this.bookmarkFolder = (this.dataStore.getItem("bookmarkFolder"));

    return new Promise(resolve => { 
      let options = {title:this.bookmarkFolder}
      chrome.bookmarks.search(options, nodes => {
        for (let i = 0; i < nodes.length; i++) {
          if (!nodes[i].hasOwnProperty("url")) { // node is folder
            self.bookmarkFolderId = nodes[i].id;
            isCreated = true;
            break;
          }
        }
        resolve(<BookmarkFolder>{
          name: self.bookmarkFolder, created: isCreated
        });
      });
    })
  }

  // creates folder bookmarks are to be stored in
  createBookmarkFolder(): Promise<BookmarkFolder>  {
    var self = this;
    return new Promise(resolve => {
      
      if (!self.bookmarkFolderId) {
        chrome.bookmarks.create({title: this.bookmarkFolder}, node => {
          self.bookmarkFolderId = node.id;        
          resolve(<BookmarkFolder>{
            name: self.bookmarkFolder, created: true
          });
        });
      }
      else {
        resolve(<BookmarkFolder>{
          name: self.bookmarkFolder, created: true
        });
      }
    });
  }

  // updates bookmark folder
  updateBookmarkFolder(name: string): Promise<BookmarkFolder> {
    this.dataStore.setItem("bookmarkFolder", name);
    this.bookmarkFolder = name;
    return this.getBookmarkFolder();
  }

  // creates bookmarks from passed array
  createBookmarks(bookmarks: Array<Bookmark>) {
    var self = this;
    
    for (let i = 0; i < bookmarks.length; i++) {
      chrome.bookmarks.create({
        parentId: self.bookmarkFolderId,
        title: bookmarks[i].title,
        url: bookmarks[i].url
      });
      void(i); // makes function synchronous
    }
  }

  // removed duplicate bookmarks
  removeDuplicates(bookmarks: Array<Bookmark>): Promise<Array<Bookmark>> {
    var self = this;
    return new Promise(resolve => {
      // check if bookmark folder is created
      if (self.bookmarkFolderId) {
        chrome.bookmarks.getChildren(self.bookmarkFolderId, nodes => {
          resolve(bookmarks.filter(bookmark => {
            return nodes.findIndex(node => node.url === bookmark.url) < 0 &&
            nodes.findIndex(node => node.title === bookmark.title) < 0;
          }));
        });
      }
      else { // else return all bookmarks
        resolve(bookmarks);
      }
    });    
  }
}
