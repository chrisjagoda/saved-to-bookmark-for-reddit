<script>
  export let size = 25;
  export let gap = 40;
  export let radius = 10;
  const dash = 2 * Math.PI * radius * (100 - gap) / 100
</script>

<svg
  height="{size}"
  width="{size}"
  style="animation-duration: 750ms;"
  class="spinner"
  viewbox="0 0 32 32"
>
  <circle
    cx="16"
    cy="16"
    r="{radius}"
    stroke="rgba(0,0,0,0.4)"
    fill="none"
    stroke-width="2"
    stroke-dasharray="{dash},100"
    stroke-linecap="round"
  />
</svg>

<style>
  .spinner {
    transition-property: transform;
    animation-name: spinner_infinite-spin;
    animation-iteration-count: infinite;
    animation-timing-function: linear;
  }
  @keyframes spinner_infinite-spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
</style>
