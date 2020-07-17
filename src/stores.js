import { writable } from "svelte/store";
import { DEFAULT_FOLDER_NAME, DEFAULT_MAX_COMMENT_LENGTH } from "./constants";
import { deepCopy } from "./utils";

const DEFAULT_SAVED = null;
const DEFAULT_SUBREDDITS = {
  available: null,
  allChecked: false
};
const DEFAULT_SESSION = {
  isSaveRedditLinkChecked: false,
  isSavedRetrieved: false,
  isFolderCreated: false,
  isLoggedIn: false,
  username: null,
  email: null
};
const DEFAULT_SETTINGS = {
  folderName: DEFAULT_FOLDER_NAME,
  maxCommentLength: DEFAULT_MAX_COMMENT_LENGTH
};

export const saved = writable(DEFAULT_SAVED);
export const toBeBookmarked = writable(DEFAULT_SAVED);
export const subreddits = writable(deepCopy(DEFAULT_SUBREDDITS));
export const session = writable(deepCopy(DEFAULT_SESSION));
export const settings = writable(deepCopy(DEFAULT_SETTINGS));

export function resetAll() {
  saved.set(DEFAULT_SAVED);
  toBeBookmarked.set(DEFAULT_SAVED);
  subreddits.set(deepCopy(DEFAULT_SUBREDDITS));
  session.set(deepCopy(DEFAULT_SESSION));
  settings.set(deepCopy(DEFAULT_SETTINGS));
}
