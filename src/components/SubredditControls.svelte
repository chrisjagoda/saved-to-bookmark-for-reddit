<script>
  import { saved, subreddits, toBeBookmarked } from '../stores';
  import { trim } from '../utils';

  function checkAll(event) {
    const checked = event.target.checked;
    subreddits.update(value => {
      value.available.forEach(subreddit => {
        subreddit.checked = checked;
      });
      return value;
    });
    toBeBookmarked.update(values => {
      values.forEach(save => {
        save.selected = checked;
      });
      return values;
    });
  }
  
  function filterBySubreddit(event) {
    const target = event.target;
    const subreddit = target.value;
    toBeBookmarked.update(values => {
      const checked = target.checked;
      values.forEach(save => {
        if (save.subreddit === subreddit) save.selected = checked;
      });
      return values;
    });
  }
</script>

<div class="subreddit-controls">
  <div class="check-all">
    <input type="checkbox" id="checkAll" bind:checked={$subreddits.allChecked} on:change={checkAll}>
    <label class="check-all-label" for="checkAll">
      Check/Uncheck All
    </label>
  </div>
  <ul class="subreddit-list">
    {#each $subreddits.available as { name, checked }}
      <li class="subreddit">
        <input class="subreddit-checkbox" type="checkbox" bind:value={name} id="{name}Subreddit" bind:checked={checked} on:change={filterBySubreddit}>
        <label class="subreddit-label" for="{name}Subreddit">
          {name}
        </label>
      </li>
    {/each}
  </ul>
</div>

<style>
  .subreddit-controls {
    grid-column: 3 / 5;
    grid-row: 2 / 6;
    display: flex;
    flex-flow: column;
  }

  .check-all-label, .subreddit-label {
    display: inline-block;
  }

  .subreddit-list {
    flex: 1;
    max-height: 207px;
    max-height: -webkit-fill-available;
  }

  .subreddit {
    line-height: 16px;
  }
</style>
