export interface RedditSession {
  bookmarkFolder: string;
  username: string;
  modhash: string;
  expires: number;
}

export interface Config {
  userAgent: string;
}

export interface Bookmark {
  subreddit: string;
  title: string;
  body?: string;
  url: string;
  type: PostType;
}

export interface BookmarkFolder {
  name: string;
  created: boolean;
}

export enum PostType {
  SUBMISSION = 'SUBMISSION',
  COMMENT = 'COMMENT'
}
