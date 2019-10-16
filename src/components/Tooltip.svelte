<script>
  export let text;
</script>

<div class="tooltip">
  <slot></slot>
  {#if text}
    <span class="tooltip-text">{text}</span>
  {/if}
</div>

<style>
  .tooltip .tooltip-text {
    visibility: hidden;
    width: 120px;
    background-color: #F7F8FA;
    color: #333;
    text-align: center;
    border-radius: 2px;
    border: 1px solid rgb(170, 170, 170);
    box-shadow: 0 1px 4px rgba(220, 220, 220, 0.5);
    padding: 4px;
    position: absolute;
    z-index: 1;
  }

  .tooltip:hover .tooltip-text {
    visibility: visible;
  }
</style>
