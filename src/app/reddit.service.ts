import { Injectable } from '@angular/core';
import * as snoowrap from 'snoowrap';
import { } from 'chrome';

import { Bookmark, Config, RedditSession, PostType } from './types';

@Injectable()
export class RedditService {
  private dataStore = window.localStorage;
  private snoowrap: any;

  // begin authentication process
  init(config: Config) {
    var self = this;
    return new Promise((resolve, reject) => {
      // get currently selected tab
      chrome.tabs.getSelected(null, tab => {
        let url = new URL(tab.url);
        let path = url.origin + url.pathname;
        let code = url.searchParams.get('code');
        // if not on redirect page create access page      
        if (path !== config.redirectUri || code === self.dataStore.getItem("code")) {
          self.goToAuthenticationTab(config.clientId, config.redirectUri)
          .then(() => resolve())
          .catch(error => reject(error));
        } // else we are on redirect page, get and store access code for further use
        else {
          self.createNewSnoowrap(code, config)
          .then(() => resolve())
          .catch(error => { // if unable to create new snoowrap, get new auth tab
            self.goToAuthenticationTab(config.clientId, config.redirectUri)
            .then(() => resolve())
            .catch(error => reject(error));
          });
        }
      });
    });
  }

  // get all saved posts
  getAllSaved(): Promise<Array<Bookmark>> {
    return new Promise((resolve, reject) => {
    var limit = 100; // max post limit per request
    var options = {limit:limit};
    var allSaved = [];
    let maxTitleLength = 147;
    // if title length is > 147 trim and add elipsis, else return title as is
    var trimTitle = (title) => (title.length > maxTitleLength) ? title.substring(0, maxTitleLength) + "...": title;
    this._getAllSaved(options, allSaved, (saved) => {
        resolve(
          saved.map(save => {
            let type;
            let title;
            if (save.title) {
              title = trimTitle(save.title);
              type = PostType.SUBMISSION;
            }
            else {
              title = trimTitle(save.body);
              type = PostType.COMMENT
            }
            return <Bookmark>{
              subreddit: save.subreddit_name_prefixed.substring(2), // ignore '/r'
              title: title,
              url: "https://reddit.com" + save.permalink,
              type: type
          }}));
      });
    });
  }

  // recursively calls get saved until end of saved posts
  private _getAllSaved(options, allSaved, callback) {
    var self = this;
    this.getSaved(options)
    .then(saved => {
      if (saved.length != 0) { // If posts not empty add and call again
        allSaved = allSaved.concat(saved); 
        let next = saved[saved.length - 1].name;
        options['after'] = next;
        self._getAllSaved(options, allSaved, callback);
      }
      else { // else return saved list       
        if (typeof callback === "function") 
          callback(allSaved);
      }
    })
    .catch(error => {
      console.error("Unable to get saved posts. Error: " + error);
    });
  }

  // get saved posts
  private getSaved(options?): Promise<any> {
    return this.snoowrap    
    .then(r => r.getMe().getSavedContent(options))
    .then(saved => saved);
  }

  // get authentication url and create new tab
  private goToAuthenticationTab(clientId: string, redirectUri: string) {
    var self = this;
    return new Promise((resolve, reject) => {
      chrome.tabs.query({url: 'https://www.reddit.com/api/v1/authorize?client_id=' + clientId + '*'}, tabs => {
        // if auth tab exists already switch to it
        if (tabs.length !== 0) {
          chrome.tabs.highlight({tabs:tabs[0].index}, tab => {
            resolve();
          });
        }
        // else get new auth url and create new tab
        else {
          let authenticationUrl: string;
          try {
            authenticationUrl = snoowrap.getAuthUrl({
              clientId: clientId,
              scope: ['identity', 'history', 'save'],
              redirectUri: redirectUri,
              permanent: false,
              state: self.getRandomId()
            });
          }
          catch (error) {
            reject("Unable to retrieve authentication url. Error: " + error);
          }
          // create new authenticaion url -- close extension
          chrome.tabs.create({'url': authenticationUrl, 'active': true});
          resolve();
        }
      });
    });
  }

  // get 16-digit random ID for authentication state
  private getRandomId(): string {
    return 'xxxxxxxxyxxxxyxx'.replace(/[xy]/g, (c) => {
        let r = Math.random() * 16 | 0,
        v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
  }

  // create snoowrap instance from auth code
  private createNewSnoowrap(code: string, config: Config) {
    var self = this;
    return new Promise((resolve, reject) => {
      try {
        self.snoowrap = snoowrap.fromAuthCode({
          code: code,
          userAgent: config.userAgent,
          clientId: config.clientId,
          redirectUri: config.redirectUri
        });
      }
      catch (error) {
        reject("Unable to create new snoowrap. Error: " + error);
      }
      // get username and save new reddit session settings
      self.getUserName().then(username => {
        self.updateDataStore(username, code)
        .then(() => resolve())
        .catch(error => {
          reject("Unable to get reddit info. Retrieve new auth token and try again. Error: " + error);
        });
      });
    });
  }

  private updateDataStore(username: string, code: string) {
    var self = this;
    return new Promise((resolve, reject) => {
      chrome.storage.local.get("redditSession", (data: RedditSession) => {
        if (chrome.runtime.lastError)
          reject("Unable to get reddit ression from storage. Error: " + chrome.runtime.lastError.message);

        // if more recent session data exists, save to local storage
        if (data && Object.keys(data).length !== 0 && data.timestamp > Number(self.dataStore.getItem('timestamp'))) {
          self.dataStore.setItem('bookmarkFolder', data.bookmarkFolder);
        }

        // set save data
        let timestamp = Date.now();
        self.dataStore.setItem("timestamp", String(timestamp));
        self.dataStore.setItem('isValid', String(true));
        self.dataStore.setItem('username', username);
        self.dataStore.setItem('code', code);
        let redditSession: RedditSession = {
          bookmarkFolder: self.dataStore.getItem("bookmarkFolder"),
          username: username,
          code: code,
          timestamp: timestamp,
          isValid: true
        }
        chrome.storage.local.set({redditSession: redditSession}, () => {
          if(chrome.runtime.lastError)
            reject("Unable to save reddit ression to storage. Error: " + chrome.runtime.lastError.message);
          else
            resolve();
        });
      });
    });
  }

  private getUserName(): Promise<string> {
    return this.snoowrap
      .then(r => r.getMe())
      .then(user => user.name);
  }
}