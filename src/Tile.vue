<template>
  <div class="tile-container">
    <input class="tile"
           pattern="[A-Za-z]"
           :aria-label="'The ' + ordinalName + ' letter of the guess'"
           v-model="letter"
           v-bind:disabled="!allow_input"
           v-bind:class="{
             absent: evaluation === 'absent',
             correct: evaluation === 'correct',
             present: evaluation === 'present'
           }">
    <div v-if="allow_input" class="tile-buttons">
      <button :aria-label='"Mark " + ordinalName + " letter as absent"'
              class="tile-button absent"
              @click="evaluation = 'absent'"></button>
      <button :aria-label='"Mark " + ordinalName + " letter as present"'
              class="tile-button present"
              @click="evaluation = 'present'"></button>
      <button :aria-label='"Mark " + ordinalName + " letter as correct"'
              class="tile-button correct"
              @click="evaluation = 'correct'"></button>
    </div>
  </div>
</template>

<script>
import { Guess } from './wordle';

export default {
  name: "tile",
  props: {
    guess: {
      type: Guess,
      required: true
    },
    index: {
      type: Number,
      required: true
    },
    allow_input: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    ordinalName() {
      if (this.index === 0) {
        return "first";
      } else if (this.index === 1) {
        return "second";
      } else if (this.index === 2) {
        return "third";
      } else if (this.index === 3) {
        return "fourth";
      } else if (this.index === 4) {
        return "fifth";
      }
    },
    letter: {
      get: function() {
        return this.guess.letter[this.index];
      },
      set: function(value) {
        this.$set(this.guess.letter, this.index, value.trim()[0].toLowerCase());
      }
    },
    evaluation: {
      get: function() {
        return this.guess.evaluation[this.index];
      },
      set: function(value) {
        this.$set(this.guess.evaluation, this.index, value);
      }
    }
  }
}
</script>

<style lang="scss">
.tile-container {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.tile {
  border: 0;
  font-size: 2rem;
  font-weight: bold;
  height: 62px;
  padding: 0;
  text-align: center;
  text-transform: capitalize;
  width: 62px;
}
.tile-buttons  {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  justify-content: center;
}
.tile-button {
  border: 0;
  height: 16px;
  padding: 0;
  width: 16px;
}
.absent {
  background-color: #3a3a3c;
  color: #d7dadc;
}
.correct {
  background-color: #538d4e;
  color: #d7dadc;
}
.present {
  background-color: #b59f3b;
  color: #d7dadc;
}
</style>