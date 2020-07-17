import browser from "webextension-polyfill";

let bookmarkFolderId;

export async function setBookmarkFolder(folderName) {
  const options = {
    title: folderName
  };
  const nodes = await browser.bookmarks.search(options);
  const folderNode = nodes.find(node => {
    return !node.url;
  });
  let isFolderCreated = false;
  if (folderNode) {
    bookmarkFolderId = folderNode.id;
    isFolderCreated = true;
  }
  return isFolderCreated;
}

export async function createBookmarkFolder(folderName) {
  const node = await browser.bookmarks.create({ title: folderName });
  bookmarkFolderId = node.id;
  return bookmarkFolderId !== undefined;
}

export async function createBookmarks(bookmarks, isSaveRedditLinkChecked) {
  bookmarks.forEach(async bookmark => {
    if (bookmark.selected) {
      await browser.bookmarks.create({
        parentId: bookmarkFolderId,
        title: bookmark.body ? `${bookmark.title} - ${bookmark.body}` : bookmark.title,
        url: isSaveRedditLinkChecked && bookmark.type === "POST" ? bookmark.redditUrl : bookmark.url
      });
    }
  });
}

export async function getBookmarks() {
  return await browser.bookmarks.getChildren(bookmarkFolderId);
}
