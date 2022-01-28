import { /* all_words, */ solutions } from "./wordlist";

export class Game {
    constructor() {
        // all_words contains all the potential guesses we could ever do.
        // The problem with all_words is that it generates a lot of inhuman words.
        // I haven't found a good way to filter out words from all_words that are possibly guessable by a human.
        // I tried at least the following:
        // - Google Book nGram scoring (how common is the word in the English corpus)
        // - English Wikipedia frequency (how common is the word in the English Wikipedia)
        // Both approaches yielded kind of garbage data still. It also elevated names, which I wasn't thrilled with
        // (why are those guessable anyway?).
        // So until I can do a proper filtering, I'm just going to use the solutions list as my word list.

        // this.all_words = all_words;
        this.all_words = solutions;
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
                            return false; // We should have this letter
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
        // Finds the highest scoring word (the word that will eliminate the most words in the worst case).
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
        // [ABS, ABS, ABS, ABS, ABS] -> ...all other words...

        // If the word is 'aaaaa', then we've guessed it in 1, but otherwise we still have n-1 words left to guess.
        // That is: in the worst case, we eliminated 1 word -- so that is the score for this word.
        let max = -1;
        let bin_freq = Array(3 * 3 * 3 * 3 * 3).fill(0);
        for (let word of this.solutions) {
            let bin = this.guessBin(guess, word);
            let freq = ++bin_freq[bin];
            if (freq > max) {
                max = freq;
            }
        }
        return this.solutions.length - max;
    }

    guessBin(guess, word) {
        // We want to find the evaluation this guess has (e.g. correct, present, absent for each letter)

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

        // Now we can return the hash of the evaluation between 0 and 3^5.
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