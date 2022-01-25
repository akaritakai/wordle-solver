<template>
  <div id="root">
    <h1><a href="https://www.powerlanguage.co.uk/wordle/">Wordle</a> Solver</h1>
    <div id="previous">
      <template v-for="guess in previous">
        <div class="tile-row">
          <template v-for="i in 5">
            <tile :guess="guess" :index="i - 1"/>
          </template>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
  import Tile from './Tile.vue';
  import {Guess} from "./wordle";

  export default {
    name: 'App',
    components: {
      Tile
    },
    data() {
      return {
        previous: [],
        current: new Wordle(),
        solution: null
      }
    },
    mounted() {
      // This builds up the data for debugging
      let guess = new Guess();
      guess.letter = ['r', 'a', 'i', 's', 'e'];
      guess.evaluation = ['absent', 'correct', 'present', 'absent', 'absent'];
      this.previous.push(guess);
      for (let i = 0; i < 4; i++) {
        guess = new Guess();
        guess.letter = ['r', 'a', 'i', 's', 'e'];
        guess.evaluation = ['absent', 'absent', 'absent', 'absent', 'absent'];
        this.previous.push(guess);
      }
    }
  }
</script>

<style lang="scss">
body {
  background-color: #121213;
  color: #d7dadc;
}
#root {
  display: flex;
  flex-direction: column;
  font-family: 'Clear Sans', 'Helvetica Neue', Arial, sans-serif;
  text-align: center;
}
a {
  color: inherit;
}
#previous {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.tile-row {
  display: flex;
  justify-content: center;
  gap: 5px;
}
</style>
