export function convertSavedToBookmark(saved) {
  return saved.map(save => {
    const bookmark = {};
    const kind = save.kind;
    const data = save.data;
    if (kind === 't3') {
      bookmark.url = data.url;
      bookmark.title = data.title;
    } else if (kind === 't1') {
      bookmark.url = data.link_permalink;
      bookmark.title = data.link_title;
      bookmark.body = data.body;
    }
    bookmark.subreddit = data.subreddit;
    bookmark.selected = true;
    return bookmark;
  });
}

export function toUrlParams(params) {
  return Object.entries(params).map(([key, val]) => `${key}=${val}`).join('&');
}

export function debounce(func, interval) {
  let timeout;
  return () => {
    const context = this;
    const args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      timeout = null;
      func.apply(context, args);
    }, interval);
  }
}

export function deepCopy(obj) {
  return JSON.parse(JSON.stringify(obj));
}

export function trim(text, length) {
  if (text !== undefined && length > 0) {
    if (text.length > length) {
      return text.substring(0, length) + ' ...';
    }
    return text;
  }
  return undefined;
}
