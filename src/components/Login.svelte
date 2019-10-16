<script>
  import Spinner from './Spinner.svelte';
  import { session } from '../stores';
  import { login, getMe } from '../services/RedditService';

  let username;
  let password;
  let error;
  let loading = false;

  async function handleSubmit() {
    if (username && (username = username.trim()) &&
        password && (password = password.trim())) {
      loading = true;
      try {
        await login(username, password);
        const user = await getMe();
        session.update(value => {
          value.username = user.username;
          value.email = user.email;
          value.isLoggedIn = true;
          return value;
        });
      } catch (err) {
        error = err.message;
      }
      loading = false;
    }
  }
</script>

{#if loading}
  <Spinner />
{:else}
  <form class="login" on:submit|preventDefault={handleSubmit}>
    <p class="login-text">Please log in to continue.</p>
    {#if error}
      <p class="error-text">{error}</p>
    {/if}
    <input class="username-input" bind:value={username} name="username" placeholder="Username" type="text" required>
    <input class="password-input" bind:value={password} name="password" placeholder="Password" type="password" required>
    <button class="login-btn" type="submit">Login</button>
  </form>
{/if}

<style>
  .login {
    display: grid;
    grid-gap: 12px;
    grid-template-columns: repeat(3, 1fr);
  }

  .login-text, .error-text {
    text-align: center;
  }

  .username-input, .password-input, .login-btn {
    grid-column: 2 / 2;
  }

  .login-text, .error-text {
    grid-column: 1 / 4;
  }

  .error-text {
    color: red;
  }
</style>
