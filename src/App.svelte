<script>
  import { onMount } from 'svelte';
  import Bookmarker from './components/Bookmarker.svelte';
  import Header from './components/Header.svelte';
  import Spinner from './components/Spinner.svelte';
  import { getMe } from './services/RedditService';
  import { session } from './stores';
  import { LOGIN_URL } from './constants';

  let loading = true;

  onMount(async () => {
    try {
      const user = await getMe();
      session.update(value => {
        value.username = user.username;
        value.email = user.email;
        value.isLoggedIn = true;
        return value;
      });
    } catch (err) { }
    loading = false;
  });
</script>

<Header />
{#if loading}
  <Spinner />
{:else}
  {#if $session.isLoggedIn}
    <Bookmarker />
  {:else}
    <p>Click <a href={LOGIN_URL} target="_blank">here</a> to login to Reddit and then reopen extension once logged in.</p>
  {/if}
{/if}
