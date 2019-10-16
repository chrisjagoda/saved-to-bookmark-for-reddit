<script>
  import { onMount } from 'svelte';
  import Bookmarker from './components/Bookmarker.svelte';
  import Header from './components/Header.svelte';
  import Login from './components/Login.svelte';
  import Spinner from './components/Spinner.svelte';
  import { getMe } from './services/RedditService';
  import { session } from './stores';

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
    <Login />
  {/if}
{/if}
