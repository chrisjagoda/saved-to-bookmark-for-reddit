export interface RedditStorage {
  folderName: string;
  maxCommentLength: number;
}

export interface Bookmark {
  subreddit: string;
  title: string;
  body?: string;
  url: string;
  type: PostType;
}

export enum PostType {
  SUBMISSION = 'SUBMISSION',
  COMMENT = 'COMMENT'
}
