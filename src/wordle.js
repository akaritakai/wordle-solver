import { all_words, solutions } from "./wordlist";

export class Game {
    constructor() {
        this.all_words = all_words;
        this.solutions = [...solutions];
    }

    applyGuess(guess) {
        // We want to build a filter that will remove words from 'solutions' that don't match our guess.
        const filter = word => {
            // Build up the known letter frequencies for the word.
            let freq = Array(26).fill(0);
            for (let i = 0; i < 5; i++) {
                freq[word.charCodeAt(i) - 97]++;
            }

            // Now we can test that the word matches against our guess types.
            for (let i = 0; i < 5; i++) {
                let c = guess.letter[i][0];
                switch (guess.evaluation[i]) {
                    case "correct":
                        if (word[i] !== c) {
                            return false; // We should have a letter in this position.
                        }
                        if (--freq[c.charCodeAt(0) - 97] < 0) {
                            return false; // Our guess marks this letter as , it's not in the word.
                        }
                        break;
                    case "present":
                        if (word[i] === c) {
                            return false; // We should not have a letter in this position
                        }
                        if (--freq[c.charCodeAt(0) - 97] < 0) {
                            return false; // Our guess marks this letter as present, but it's not in the word.
                        }
                        break;
                    case "absent":
                        if (freq[c.charCodeAt(0) - 97] > 0) {
                            return true; // We should have this letter
                        }
                        break;
                }
            }

            return true; // The word is compatible with the guess.
        };

        // Remove words from the solutions that don't match our guess.
        this.solutions = this.solutions.filter(filter);
    }
}

export class Guess {
    constructor() {
        this.letter = ['', '', '', '', ''];
        this.evalution = ['', '', '', '', ''];
    }

    isValid() {
        for (let i = 0; i < 5; i++) {
            if (this.letter[i] === '' || this.evalution[i] === '') {
                return false;
            }
        }
        return true;
    }
}