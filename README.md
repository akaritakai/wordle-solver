Wordle Solver
=============

Wordle Solver is a dark-mode implementation of [this solver's interface](https://notfunatparties.com/wordle-solver)
which is designed to solve daily [Wordle](https://www.powerlanguage.co.uk/wordle/) puzzles.

The idea is to have the solver make human-possible guesses while still solving the puzzle in as few guesses as possible.

Build and Host
--------------

### Prerequisite
Both Yarn and Node.js must be installed on the host.

To build, run `yarn build`. This will create a `dist` directory with the compiled files. Then, open the
`dist/index.html`file in your browser.

To host, upload the files to a web server and make the files in `dist` available at the root with `index.html` as the
default.

Strategy
--------

### Choosing a word list

Wordle is backed by two lists. One list is all the possible words that could ever be solutions (2,315 words). The other
is all the possible guesses that could ever be made (12,972 words).

Most of the words in the second list are unlikely to ever be guessed by a human (e.g. 'SERAI' which is a synonym for an
old term: caravansaries, which were inns that catered to caravans in the Middle East of centuries past).

Yet, not all the words in the second list are inhuman. For example, the second list contains 'WINGS', a perfectly
natural guess.

This Wordle solver uses all the words in the first list (and knows that only words in the first list will ever be our
solution), plus some hand-picked words from the second list.

To perform the hand-picking, the second list (minus the first list) was sorted by frequency using the
[WordFrequencyData](https://reference.wolfram.com/language/ref/WordFrequencyData.html) API in Mathematica. Then, words
were examined by hand to see if they were common words, with uncommon words being manually removed. When a run of 20-50
words was encountered that were all uncommon, all remaining words were assumed to be uncommon and discarded.

### Choosing the best word

Every round, the solver will look at the words that could possibly be the solution, and use the word that removes the
most [entropy](https://en.wikipedia.org/wiki/Entropy_(information_theory)) from the puzzle. The solver uses these
tie-breaks in order if two words would remove the same amount of entropy:
- The number of eliminations made in the worst case
- The number of squares matched as present or correct across all possible solutions
- The number of squares matched as correct across all possible solutions
- Lexicographic order
