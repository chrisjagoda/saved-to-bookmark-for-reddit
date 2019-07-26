export interface RedditSession {
  bookmarkFolder: string,
  username: string,
  code: string,
  timestamp: number,
  isValid: boolean
}

export interface Config {
  userAgent: string,
  clientId: string,
  redirectUri: string
}

export interface Bookmark {
  subreddit: string,
  title: string,
  url: string,
  type: PostType
}

export interface BookmarkFolder {
  name: string,
  created: boolean
}

export enum PostType {
  SUBMISSION = 'SUBMISSION',
  COMMENT = 'COMMENT'
}