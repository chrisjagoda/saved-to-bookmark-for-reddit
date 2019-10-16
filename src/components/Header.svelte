<header class="header">
  <img class="logo" src="images/logo.png" alt="App logo">
  <h1 class="title">Saved to Bookmark</h1>
  <h2 class="subtitle">for Reddit</h2>
</header>

<style>
  .header {
    display: grid;
    grid-gap: 12px;
    grid-template-columns: repeat(5, 1fr);
  }

  .logo {
    grid-column: 1 / 2;
    grid-row: 1 / 3;
    width: 100%;
  }

  .title {
    grid-column: 2 / 6;
    margin-top: 16px;
    margin-bottom: 0;
    color: #FF4503;
  }

  .subtitle {
    grid-column: 2 / 6;
    margin-top: -16px;
    padding-bottom: 4px;
    font-weight: normal;
    color: #0479D4;
    border-bottom: 1px solid #DAE0E6;
  }
</style>
