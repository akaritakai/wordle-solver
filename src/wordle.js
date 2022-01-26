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

    findBestWord() {
        let max = -1;
        let best = '';
        for (let word of this.all_words) {
            let score = this.scoreWord(word);
            if (score > max) {
                max = score;
                best = word;
            }
        }
        return best;
    }

    scoreWord(guess) {
        // As an example, if we guess 'aaaaa' and our solutions include:
        //   ['aaaaa' + ...all words that don't contain 'a'...]
        // Then possible guess results we can get are:
        // [COR, COR, COR, COR, COR] -> 'aaaaa'
        // [NP, NP, NP, NP, NP] -> ...all other words...
        // So we can calculate the score as solutions - guess results and pick the lowest of those.

        // And our solutions include:
        // 'aaaaa' + ...all words that don't contain 'a'...
        // Then by guessing it, we can eliminate n-1 words in the BEST case, but in the worst case,
        // we only eliminate 1.

        let max = -1;
        let bin_freq = Array(3 * 3 * 3 * 3 * 3).fill(0);
        for (let word of this.solutions) {
            let bin = this.guessBin(guess, word);
            let freq = bin_freq[bin]++;
            if (freq > max) {
                max = freq;
            }
        }
        return solutions.length - max;
    }

    guessBin(guess, word) {
        // We want to build up frequencies based on the word
        let freq = Array(26).fill(0);
        for (let i = 0; i < 5; i++) {
            freq[word.charCodeAt(i) - 97]++;
        }

        let result = Array(5).fill('');

        // Now let's iterate through the guess and mark correctly placed/missing letters
        for (let i = 0; i < 5; i++) {
            if (guess[i] === word[i]) {
                // The guess is correct
                result[i] = "correct";
                freq[guess[i].charCodeAt(0) - 97]--;
            }
        }

        // Now we've scored all that we can, and can fill in the present/absent guesses
        for (let i = 0; i < 5; i++) {
            if (result[i] === '') {
                if (freq[guess[i].charCodeAt(0) - 97] > 0) {
                    result[i] = "present";
                    freq[guess[i].charCodeAt(0) - 97]--;
                } else {
                    result[i] = "absent";
                }
            }
        }

        // Now we can return the bin
        let bin = 0;
        for (let i = 0; i < 5; i++) {
            bin *= 3;
            if (result[i] === "correct") {
                bin += 2;
            } else if (result[i] === "present") {
                bin += 1;
            }
        }
        return bin;
    }
}

export class Guess {
    constructor() {
        this.letter = ['', '', '', '', ''];
        this.evaluation = ['', '', '', '', ''];
    }

    isValid() {
        for (let i = 0; i < 5; i++) {
            if (this.letter[i] === '' || this.evaluation[i] === '') {
                return false;
            }
        }
        return true;
    }
}