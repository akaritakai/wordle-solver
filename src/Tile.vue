<template>
  <div class="tile-container">
    <input class="tile"
           v-model="guess.letter[index]"
           :disabled="!allow_input"
           v-bind:class="{
             absent: guess.evalution[index] === 'absent',
             correct: guess.evalution[index] === 'correct',
             present: guess.evalution[index] === 'present'
           }">
    <div v-if="allow_input" class="tile-buttons">
      <button class="tile-button absent" @click="guess.evalution[index] = 'absent'"></button>
      <button class="tile-button present" @click="guess.evalution[index] = 'correct'"></button>
      <button class="tile-button correct" @click="guess.evalution[index] = 'present'"></button>
    </div>
  </div>
</template>

<script>
import { Guess } from './wordle';

export default {
  name: "tile",
  props: {
    guess: Guess,
    index: Number,
    allow_input: Boolean // If input is allowed for this tile
  }
}
</script>

<style lang="scss" scoped>
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