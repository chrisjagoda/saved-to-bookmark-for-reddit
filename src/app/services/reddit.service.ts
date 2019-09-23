import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Bookmark, PostType } from '../types';

@Injectable()
export class RedditService {
  private apiUrl = 'https://www.reddit.com/';
  private sslUrl = 'https://ssl.reddit.com/';
  maxCommentLength = 947;
  email: string;
  username: string;
  loading = false;
  loggedIn = false;

  constructor(private http: HttpClient) { }

  async login(username: string, password: string): Promise<{email: string, username: string}> {
    this.loading = true;
    const url = `${this.sslUrl}api/login`;
    const body = {
      user: username,
      passwd: password,
      rem: true,
      api_type: 'json'
    };
    const options = {headers: {'content-type': 'application/x-www-form-urlencoded'}};
    await this.http.post(url, this.toUrlParams(body), options).toPromise();
    const user = await this.getMe();
    this.loading = false;
    return user;
  }

  async getMe(): Promise<any> {
    const url = `${this.sslUrl}/prefs/update`;
    try {
      await this.http.get(url).toPromise();
    } catch (response) { // TODO - use a different http method
      if (response.statusText === 'OK') {
        const domParser = new DOMParser();​​​​​​
        const dom = domParser.parseFromString(response.error.text, 'text/html');
        const usernameElement = <HTMLLinkElement>dom.getElementsByClassName('user')[0].firstChild;
        const username = usernameElement.innerText;
        const emailElement = <HTMLInputElement>dom.getElementsByName('email')[0];
        const email = emailElement.defaultValue;
        this.email = email;
        this.username = username;
        this.loggedIn = true;
        return { email, username };
      }
    }
    return null;
  }

  getAllSaved(): Promise<Array<Bookmark>> {
    this.loading = true;
    return new Promise(resolve => {
      const options = {limit: 100};

      this._getAllSaved(options, [], (saved) => {
        this.loading = false;
        resolve(saved);
      });
    });
  }

  private convertSavedToBookmark(saved: any): Array<Bookmark> {
    return saved.map(save => {
      const bookmark = <Bookmark>{};
      if (save.kind === 't3') {
        bookmark.url = save.data.url;
        bookmark.title = save.data.title;
        bookmark.type = PostType.SUBMISSION;
      } else if (save.kind === 't1') {
        bookmark.url = save.data.link_permalink;
        bookmark.title = save.data.link_title;
        bookmark.body = save.data.body;
        bookmark.type = PostType.COMMENT;
      }
      bookmark.subreddit = save.data.subreddit;
      return bookmark;
    });
  }

  private async _getAllSaved(options, allSaved, callback) {
    const saved = await this.getSaved(options);
    if (saved.data.children && saved.data.children.length > 0) {
      options.after = saved.data.children[saved.data.children.length - 1].data.name;
      this._getAllSaved(options, allSaved.concat(this.convertSavedToBookmark(saved.data.children)), callback);
    } else {
      if (typeof callback === 'function') {
        callback(allSaved);
      }
    }
  }

  private async getSaved(parameters): Promise<any> {
    const url = `${this.apiUrl}user/${this.username}/saved.json`;
    const options = {
      params: parameters
    };
    return await this.http.get(url, options).toPromise();
  }

  private toUrlParams(params): string {
    return Object.entries(params).map(([key, val]) => `${key}=${val}`).join('&');
  }
}
