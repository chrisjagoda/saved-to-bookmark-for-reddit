<script>
  import { onMount, onDestroy } from 'svelte';
  import browser from 'webextension-polyfill';
  import AppControls from './AppControls.svelte';
  import SavedList from './SavedList.svelte';
  import Spinner from './Spinner.svelte';
  import { SETTINGS_STORAGE_KEY } from '../constants';
  import { getAllSaved } from '../services/RedditService';
  import { saved, toBeBookmarked, session, settings, subreddits, resetAll } from '../stores';
  import { debounce, deepCopy, trim } from '../utils';

  let unsubscribeSettings;
  let loading = true;

  onMount(async () => {
    const local = await browser.storage.local.get(SETTINGS_STORAGE_KEY);  

    let existingSettings;
    debugger;
    if (local && (existingSettings = local[SETTINGS_STORAGE_KEY])) {
      settings.set(existingSettings);
    }

    unsubscribeSettings = settings.subscribe(async value => {
      debounce(await browser.storage.local.set({[SETTINGS_STORAGE_KEY]: value}), 500);
    });

    loading = false;
  });

  onDestroy(() => {
    unsubscribeSettings()
  });

  async function getSaved() {
    loading = true;
    const saves = $saved || await getAllSaved($session.username);
    const savesCopy = deepCopy(saves); 
    const maxCommentLength = $settings.maxCommentLength;
    toBeBookmarked.set(
      saves.map(save => {
        save.body = trim(save.body, maxCommentLength);
        return save;
      })
    );
    subreddits.set({
      available: Array.from(new Set(saves.map(save => save.subreddit)))
        .sort()
        .map(save => ({ name: save, checked: true })),
      allChecked: true
    });
    saved.set(savesCopy);
    session.update(value => {
      value.isSavedRetrieved = true;
      return value;
    });
    loading = false;
  }

  async function switchUser() {
    resetAll();
  }
</script>

{#if loading}
  <Spinner />
{:else}
  <div class="user-controls">
    <span class="user-controls-text">Hello, {$session.username}.</span>
    <button class="get-saved-btn" on:click={getSaved}>Get Saved</button>
    <button class="switch-user-btn" on:click={switchUser}>Switch User</button>
  </div>
  {#if $session.isSavedRetrieved}
    <AppControls />
    <SavedList />
  {/if}
{/if}

<style>
  .user-controls {
    display: grid;
    grid-gap: 12px;
    grid-template-columns: repeat(5, 1fr);
    line-height: 28px;
  }

  .user-controls-text {
    grid-column: 1 / 4;
  }

  .get-saved-btn {
    grid-column: 4 / 5;
  }

  .switch-user-btn {
    grid-column: 5 / 6;
  }
</style>
