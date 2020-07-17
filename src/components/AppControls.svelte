<script>
  import { onMount } from 'svelte';
  import Spinner from './Spinner.svelte';
  import SubredditControls from './SubredditControls.svelte';
  import Tooltip from './Tooltip.svelte';
  import {
    createBookmarkFolder,
    setBookmarkFolder,
    createBookmarks,
    getBookmarks
  } from '../services/BookmarkService';
  import { saved, toBeBookmarked, session, settings } from '../stores';
  import { deepCopy, trim } from '../utils';

  let isFolderCreatedTooltipText;
  let createBookmarksTooltipText;
  let unselectDuplicatesTooltipText;

  onMount(async () => {
    await updateFolder($settings.folderName);
  });

  async function createFolder() {
    if (!$session.isFolderCreated) {
      const isFolderCreated = await createBookmarkFolder($settings.folderName);
      updateIsFolderCreated(isFolderCreated);
    }
  }

  async function updateIsFolderCreated(isFolderCreated) {
    session.update(value => {
      value.isFolderCreated = isFolderCreated;
      return value;
    });
    if (isFolderCreated) {
      isFolderCreatedTooltipText = "Bookmark folder found.";
      createBookmarksTooltipText = "Create selected bookmarks.";
      unselectDuplicatesTooltipText = "Unselect bookmarks already in bookmark folder.";
    } else {
      isFolderCreatedTooltipText = "Bookmark folder does not exist.";
      createBookmarksTooltipText = "Create bookmark folder and create selected bookmarks";
      unselectDuplicatesTooltipText =
        `${isFolderCreatedTooltipText} Update bookmark folder to an existing one or create a new one.`;
    }
  }

  async function updateFolder() {
    const isFolderCreated = await setBookmarkFolder($settings.folderName);
    updateIsFolderCreated(isFolderCreated);
  }

  async function create() {
    await createFolder();
    await createBookmarks($toBeBookmarked, $session.isSaveRedditLinkChecked);
  }

  async function unselectDuplicates() {
    const bookmarks = await getBookmarks();
    toBeBookmarked.update(values => {
      const urlSet = new Set();

      values.forEach(value => {
        const saveUrl = $session.isSaveRedditLinkChecked && value.type === "POST" ? value.redditUrl : value.url;

        value.selected = !(urlSet.has(saveUrl) || bookmarks.some(({ url }) => {
          urlSet.add(url);
          return url === saveUrl;
        }));
      });
      return values;
    });
  }

  function updateMaxCommentLength() {
    session.update(value => {
      value.allChecked = true;
      return value;
    });
    const maxCommentLength = $settings.maxCommentLength;
    toBeBookmarked.update(values => {
      values = deepCopy($saved);
      values.forEach(save => {
        save.body = trim(save.body, maxCommentLength);
      });
      return values;
    })
  }
</script>

<div class="app-controls">
  <h3 class="bookmark-controls-title">Bookmark Controls</h3>
  <div class="folder">
    <span class="folder-name">
      <label class="folder-name-label" for="folderName">Folder name</label>
      <input class="folder-name-input" id="folderName" type="text" bind:value={$settings.folderName}>
    </span>
    <span class="is-folder-created">
      <Tooltip text={isFolderCreatedTooltipText}>
        {#if $session.isFolderCreated}
          <svg class="is-created-icon" viewBox="0 0 44 44">
            <path d="m22,0c-12.2,0-22,9.8-22,22s9.8,22 22,22 22-9.8 22-22-9.8-22-22-22zm12.7,15.1l0,0-16,16.6c-0.2,0.2-0.4,0.3-0.7,0.3-0.3,0-0.6-0.1-0.7-0.3l-7.8-8.4-.2-.2c-0.2-0.2-0.3-0.5-0.3-0.7s0.1-0.5 0.3-0.7l1.4-1.4c0.4-0.4 1-0.4 1.4,0l.1,.1 5.5,5.9c0.2,0.2 0.5,0.2 0.7,0l13.4-13.9h0.1c0.4-0.4 1-0.4 1.4,0l1.4,1.4c0.4,0.3 0.4,0.9 0,1.3z">
            </path>
          </svg>
        {:else}
          <svg class="is-not-created-icon" viewBox="0 0 512 512">
            <path d="M437.105,74.896c-99.863-99.863-262.35-99.859-362.209,0c-99.859,99.859-99.863,262.346,0,362.209 s262.351,99.86,362.209,0S536.968,174.759,437.105,74.896z M362.324,338.697c6.526,6.526,6.522,17.105,0,23.627 c-6.522,6.522-17.101,6.526-23.627,0l-82.696-82.696l-82.696,82.696c-6.522,6.522-17.101,6.526-23.627,0 c-6.526-6.526-6.522-17.105,0-23.627l82.696-82.696l-82.696-82.696c-6.526-6.526-6.522-17.106,0-23.627s17.101-6.526,23.627,0 l82.696,82.696l82.696-82.696c6.522-6.522,17.101-6.526,23.627,0c6.526,6.526,6.522,17.106,0,23.627l-82.696,82.696 L362.324,338.697z"/>
          </svg>
        {/if}
      </Tooltip>
    </span>
  </div>
  <Tooltip text="Update folder where created bookmarks will be stored.">
    <button class="update-folder-btn" on:click={updateFolder}>Update folder</button>
  </Tooltip>
  <Tooltip text="Create folder where created bookmarks will be stored.">
    <button class="create-folder-btn" on:click={createFolder}>Create folder</button>
  </Tooltip>
  <Tooltip text={createBookmarksTooltipText}>
    <button class="create-bookmarks-btn" on:click={create}>Create bookmarks</button>
  </Tooltip>
  <Tooltip text={unselectDuplicatesTooltipText}>
    <button class="unselect-duplicates-btn" disabled={!$session.isFolderCreated} on:click={unselectDuplicates}>Unselect duplicates</button>
  </Tooltip>
  <div class="update-max-comment-length">
    <label class="update-max-comment-length-label" for="maxCommentLength">Max comment length</label>
    <input class="update-max-comment-length-input" id="maxCommentLength" type="number" bind:value={$settings.maxCommentLength}>
  </div>
  <Tooltip text="Update max length of comments on bookmark titles. Comments longer than max will be truncated and followed with (...).">
    <button class="update-max-comment-length-btn" on:click={updateMaxCommentLength}>Update max comment length</button>
  </Tooltip>
  <h3 class="subreddits-title">Subreddits</h3>
  <SubredditControls />
</div>

<style>
  .app-controls {
    display: grid;
    grid-gap: 12px;
    grid-template-columns: repeat(4, 1fr);
  }

  .folder {
    grid-column: 1 / 3;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
  }

  .folder-name {
    grid-column: 1 / 4;
  }

  .is-folder-created {
    grid-column: 4 / 5;
    margin: 0 auto;
    align-self: center;
  }

  .is-created-icon,
  .is-not-created-icon {
    height: 30px;
    width: 30px;
  }

  .is-created-icon {
    fill: green;
  }

  .is-not-created-icon {
    fill: red;
  }

  .bookmark-controls-title,
  .subreddits-title {
    margin-bottom: 0;
  }

  .bookmark-controls-title {
    grid-column: 1 / 3;
  }

  .subreddits-title {
    grid-column: 3 / 5;
    grid-row: 1 / 2;
  }

  .update-folder-btn, .create-bookmarks-btn,
  .update-max-comment-length, .create-folder-btn,
  .unselect-duplicates-btn, .update-max-comment-length-btn {
    height: 45px;
  }
  
  .update-folder-btn, .create-bookmarks-btn,
  .update-max-comment-length {
    grid-column: 1 / 2;
  }

  .create-folder-btn, .unselect-duplicates-btn,
  .update-max-comment-length-btn {
    grid-column: 2 / 3;
  }
</style>
