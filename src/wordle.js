import { extra, solutions, skip } from "./wordlist";

export class Game {
    constructor() {
        // Let's say all_words contains all the potential guesses we could ever do.
        // The problem with all_words is that it generates a lot of inhuman words.
        // I haven't found a good way to filter out words from all_words that are possibly guessable by a human.
        // I tried at least the following:
        // - Google Book nGram scoring (how common is the word in the English corpus)
        // - English Wikipedia frequency (how common is the word in the English Wikipedia)
        // Both approaches yielded kind of garbage data still. It also elevated names, which I wasn't thrilled with
        // (why are those guessable anyway?).

        // I did end up doing a manual filtering of the solution list based on the WordFrequencyData function in
        // Mathematica. These extra curated words are present in "extra", so the total words we should be guessing is
        // extra + solutions.

        // There are also words in our solution list that are really uncommon (e.g. 'BETEL' that are guessable words,
        // but we don't want to guess them until we have to). These are present in "skip".

        this.all_words = [...new Set([...solutions, ...extra])];
        this.solutions = [...solutions];
        this.guesses = [];
    }

    applyGuess(guess) {
        // We want to build a filter that will remove words from 'solutions' that don't match our guess.
        const filter = word => {
            // Build up the known letter frequencies for the word.
            let freq = Array(26).fill(0);
            for (let i = 0; i < 5; i++) {
                freq[word.charCodeAt(i) - 97]++;
            }

            // First remove correctly placed guesses
            for (let i = 0; i < 5; i++) {
                if (guess.evaluation[i] === "correct") {
                    let c = guess.letter[i][0];
                    if (c !== word[i]) {
                        return false; // We should have a letter in this position
                    }
                    freq[c.charCodeAt(0) - 97]--;
                }
            }

            // Then, remove other types of guesses
            for (let i = 0; i < 5; i++) {
                let c = guess.letter[i][0];
                switch (guess.evaluation[i]) {
                    case "present":
                        if (c === word[i]) {
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

        // Indicate that we have made a guess with this word
        this.guesses.push(guess);
    }

    findBestWord() {
        // Finds the highest scoring word (the word that removes the most entropy).
        // On ties, we break in the following order:
        // - Number of eliminations made in the worst case
        // - Number of matched (correct or present) letters over all possibilities
        // - Number of correct letters over all possibilities
        // - Lexicographic order
        let max_common = -1;
        let max_entropy = -1;
        let max_eliminations = -1;
        let max_matched = -1;
        let max_correct = -1;
        let best = '';
        for (let word of this.all_words) {
            // We don't want to guess an already guessed word, since it would yield no new info.
            // This is mostly sanity checking.
            if (this.guesses.includes(word)) {
                continue;
            }
            let score = this.scoreWord(word);
            if (score.common > max_common) {
                max_common = score.common;
                max_entropy = score.entropy;
                max_eliminations = score.eliminations;
                max_matched = score.matched;
                max_correct = score.correct;
                best = word;
            } else if (score.common === max_common) {
                if (score.entropy > max_entropy) {
                    max_entropy = score.entropy;
                    max_eliminations = score.eliminations;
                    max_matched = score.matched;
                    max_correct = score.correct;
                    best = word;
                } else if (score.entropy === max_entropy) {
                    if (score.eliminations > max_eliminations) {
                        max_eliminations = score.eliminations;
                        max_matched = score.matched;
                        max_correct = score.correct;
                        best = word;
                    } else if (score.eliminations === max_eliminations) {
                        if (score.matched > max_matched) {
                            max_matched = score.matched;
                            max_correct = score.correct;
                            best = word;
                        } else if (score.matched === max_matched) {
                            if (score.correct > max_correct) {
                                max_correct = score.correct;
                                best = word;
                            }
                        }
                    }
                }
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
        // That is: in the worst case, we eliminated 1 word -- so that is the max eliminated for this word.

        // We want to build up this idea of how many words are eliminated by this guess on average into the expected
        // entropy of the guess.

        let hash_freq = Array(3 * 3 * 3 * 3 * 3).fill(0);
        let eliminations = 0;
        let matched = 0;
        let correct = 0;
        for (let word of this.solutions) {
            let data = this.guessData(guess, word);
            let freq = ++hash_freq[data.hash];
            if (freq > eliminations) {
                eliminations = freq;
            }
            matched += data.correct + data.present;
            correct += data.correct;
        }

        let entropy = 0;
        for (let i = 0; i < hash_freq.length; i++) {
            if (hash_freq[i] > 0) {
                let p = hash_freq[i] / this.solutions.length;
                entropy -= p * Math.log2(p);
            }
        }

        return {
            common: skip.contains(guess) ? 0 : 1,
            entropy: entropy,
            eliminations: this.solutions.length - eliminations,
            matched: matched,
            correct: correct
        }
    }

    guessData(guess, word) {
        // We want to find the evaluation this guess has (e.g. correct, present, absent for each letter)

        // We want to build up frequencies based on the word
        let freq = Array(26).fill(0);
        for (let i = 0; i < 5; i++) {
            freq[word.charCodeAt(i) - 97]++;
        }

        let result = Array(5).fill('');
        let num_correct = 0;
        let num_present = 0;
        let num_absent = 0;

        // Now let's iterate through the guess and mark correctly placed/missing letters
        for (let i = 0; i < 5; i++) {
            if (guess[i] === word[i]) {
                // The guess is correct
                result[i] = "correct";
                freq[guess[i].charCodeAt(0) - 97]--;
                num_correct++;
            }
        }

        // Now we've scored all that we can, and can fill in the present/absent guesses
        for (let i = 0; i < 5; i++) {
            if (result[i] === '') {
                if (freq[guess[i].charCodeAt(0) - 97] > 0) {
                    result[i] = "present";
                    freq[guess[i].charCodeAt(0) - 97]--;
                    num_present++;
                } else {
                    result[i] = "absent";
                    num_absent++;
                }
            }
        }

        // Now we can return the hash of the evaluation between 0 and 3^5.
        let hash = 0;
        for (let i = 0; i < 5; i++) {
            hash *= 3;
            if (result[i] === "correct") {
                hash += 2;
            } else if (result[i] === "present") {
                hash += 1;
            }
        }

        return {
            hash: hash,
            correct: num_correct,
            present: num_present,
            absent: num_absent
        };
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