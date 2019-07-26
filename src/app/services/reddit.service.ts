import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Bookmark, PostType } from '../types';
import { SessionService } from './session.service';

@Injectable()
export class RedditService {
  private loginUrl = 'https://ssl.reddit.com/api/';
  private redditUrl = 'https://www.reddit.com/user/';
  private modhash: string;
  private maxTitleLength = 947;
  loading: boolean;
  username: string;

  constructor(
    private http: HttpClient,
    private sessionService: SessionService) { }

  init(modhash: string, username: string) {
    this.modhash = modhash;
    this.username = username;
  }

  login(username: string, password: string): Promise<any> {
    this.loading = true;
    const url = `${this.loginUrl}login`;
    const body = {
      user: username,
      passwd: password,
      rem: true,
      api_type: 'json'
    };
    const options = {headers: {'content-type': 'application/x-www-form-urlencoded'}};
    return this.http.post(url, this.toUrlParams(body), options).toPromise()
    .then(response => {
      this.modhash = response['json'].data.modhash;
      this.username = username;
      return this.modhash;
    })
    .catch(error => {
      this.loading = false;
      throw new HttpErrorResponse(error);
    });
  }

  getMe(): Promise<any> {
    const url = `${this.redditUrl}${this.username}/about.json`;
    const options = {
      headers: {modhash: this.modhash}
    };
    return this.http.get(url, options).toPromise()
    .then(response => {
      this.username = response['data'].name;
      return response['data'];
    })
    .catch(error => {
      throw new HttpErrorResponse(error);
    })
    .then(() => {
      this.loading = false;
    });
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
        bookmark.title = this.trim(save.data.title);
        bookmark.type = PostType.SUBMISSION;
      } else if (save.kind === 't1') {
        bookmark.url = save.data.link_permalink;
        bookmark.title = save.data.link_title;
        bookmark.body = this.trim(save.data.body);
        bookmark.type = PostType.COMMENT;
      }
      bookmark.subreddit = save.data.subreddit;
      return bookmark;
    });
  }

  private _getAllSaved(options, allSaved, callback) {
    const self = this;
    this.getSaved(options)
    .then(saved => {
      if (saved.data.children && saved.data.children.length > 0) {
        options.after = saved.data.children[saved.data.children.length - 1].data.name;
        self._getAllSaved(options, allSaved.concat(this.convertSavedToBookmark(saved.data.children)), callback);
      } else {
        if (typeof callback === 'function') {
          this.modhash = saved.data.modhash;
          this.sessionService.renewRedditSession(this.modhash, this.username);
          callback(allSaved);
        }
      }
    });
  }

  private getSaved(parameters): Promise<any> {
    const url = `${this.redditUrl}${this.username}/saved.json`;
    const options = {
      headers: {modhash: this.modhash},
      params: parameters
    };
    return this.http.get(url, options).toPromise()
    .then(response => {
      return response;
    })
    .catch(error => {
      throw new HttpErrorResponse(error);
    });
  }

  private toUrlParams(params): string {
    return Object.entries(params).map(([key, val]) => `${key}=${val}`).join('&');
  }

  private trim(text): string {
    return text.length > this.maxTitleLength ? text.substring(0, this.maxTitleLength) + '...' : text;
  }
}
