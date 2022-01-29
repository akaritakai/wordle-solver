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
    <template v-if="remainingSolutions > 1">
      <div>
        <p>{{ remainingSolutions }} potential words left</p>
        <p><b>This is your best possible guess:</b></p>
      </div>
      <div id="current">
        <div class="tile-row">
          <template v-for="i in 5">
            <tile :guess="current" :index="i - 1" :allow_input="true"/>
          </template>
        </div>
        <button class="next" v-bind:disabled="!current.isValid()" @click="onClick">Next</button>
      </div>
    </template>
    <template v-else-if="remainingSolutions === 1">
      <div>
        <p>Solved!</p>
      </div>
      <div class="tile-row">
        <template v-for="i in 5">
          <tile :guess="solution()" :index="i - 1"/>
        </template>
      </div>
    </template>
    <template v-else>
      <div>
        <p>No solutions found</p>
      </div>
    </template>
  </div>
</template>

<script>
  import Tile from './Tile.vue';
  import {Game, Guess} from "./wordle";

  export default {
    name: 'App',
    components: {
      Tile
    },
    data() {
      return {
        previous: [],
        current: new Guess(),
        game: new Game()
      }
    },
    computed: {
      remainingSolutions() {
        return this.game.solutions.length;
      }
    },
    methods: {
      solution() {
        let guess = new Guess();
        let word = this.game.solutions[0];
        for (let i = 0; i < 5; i++) {
          guess.letter[i] = word[i];
          guess.evaluation[i] = 'correct';
        }
        return guess;
      },
      onClick() {
        // Apply the guess to the game
        this.game.applyGuess(this.current);

        // Add the guess to the previous guesses
        let guess = new Guess();
        guess.letter = Array.from(this.current.letter);
        guess.evaluation = Array.from(this.current.evaluation);
        this.previous.push(guess);

        // Reset the current guess with the new guess
        this.current.letter = ['', '', '', '', ''];
        this.current.evaluation = ['', '', '', '', ''];
        let next = this.game.findBestWord();
        this.current.letter = [next[0], next[1], next[2], next[3], next[4]];
      }
    },
    mounted() {
      this.current.letter = ['r', 'a', 'i', 's', 'e']; // RAISE is the optimal guess (if all_words = solutions)
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
#current {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 24px;
}
.next {
  background-color: #883bb5;
  border-radius: 8px;
  border: 0;
  color: inherit;
  font-size: 18px;
  width: 72px;
  height: 50px;
}
.next:disabled {
  background-color: #808080;
}
</style>
