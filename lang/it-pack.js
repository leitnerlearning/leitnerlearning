(function () {
  const id = "it";
  window.STARTER_DECKS = window.STARTER_DECKS || {};
  window.STARTER_DECKS[id] = [
    { foreign: 'e', native: 'and', rank: 1, category: 'connector', band: 'A' },
    { foreign: 'non', native: 'not / no', rank: 2, category: 'particle', band: 'A' },
    { foreign: 'che', native: 'that / who / what', rank: 3, category: 'question', band: 'A' },
    { foreign: 'di', native: 'of / from', rank: 4, category: 'preposition', band: 'A' },
    { foreign: 'la', native: 'the (fem.) / her / it', rank: 5, category: 'pronoun', band: 'A' },
    { foreign: 'il', native: 'the (masc.)', rank: 6, category: 'pronoun', band: 'A' },
    { foreign: 'un', native: 'a / one (masc.)', rank: 7, category: 'number', band: 'A' },
    { foreign: 'a', native: 'to / at', rank: 8, category: 'preposition', band: 'A' },
    { foreign: 'per', native: 'for / in order to', rank: 9, category: 'preposition', band: 'A' },
    { foreign: 'è', native: 'is', rank: 10, category: 'verb', band: 'A' },
    { foreign: 'in', native: 'in / into', rank: 11, category: 'preposition', band: 'A' },
    { foreign: 'una', native: 'a / one (fem.)', rank: 12, category: 'number', band: 'A' },
    { foreign: 'mi', native: 'me / myself', rank: 13, category: 'pronoun', band: 'A' },
    { foreign: 'sono', native: 'am / are / they are', rank: 14, category: 'verb', band: 'A' },
    { foreign: 'ho', native: 'I have', rank: 15, category: 'verb', band: 'A' },
    { foreign: 'si', native: 'oneself / yes (unstressed)', rank: 16, category: 'pronoun', band: 'A' },
    { foreign: 'ha', native: 'has', rank: 17, category: 'verb', band: 'A' },
    { foreign: 'ma', native: 'but', rank: 18, category: 'connector', band: 'A' },
    { foreign: 'lo', native: 'the (masc. special) / him / it', rank: 19, category: 'pronoun', band: 'A' },
    { foreign: 'cosa', native: 'thing / what', rank: 20, category: 'question', band: 'A' },
    { foreign: 'con', native: 'with', rank: 21, category: 'preposition', band: 'A' },
    { foreign: 'no', native: 'no', rank: 22, category: 'particle', band: 'A' },
    { foreign: 'le', native: 'the (fem. pl.) / to her', rank: 23, category: 'pronoun', band: 'A' },
    { foreign: 'ti', native: 'you (obj.)', rank: 24, category: 'pronoun', band: 'A' },
    { foreign: 'se', native: 'if / oneself', rank: 25, category: 'connector', band: 'A' },
    { foreign: 'da', native: 'from / by / since', rank: 26, category: 'preposition', band: 'A' },
    { foreign: 'i', native: 'the (masc. pl.)', rank: 27, category: 'pronoun', band: 'A' },
    { foreign: 'come', native: 'how / like / as', rank: 28, category: 'question', band: 'A' },
    { foreign: 'io', native: 'I', rank: 29, category: 'pronoun', band: 'A' },
    { foreign: 'ci', native: 'us / there', rank: 30, category: 'pronoun', band: 'A' },
    { foreign: 'hai', native: 'you have', rank: 31, category: 'verb', band: 'A' },
    { foreign: 'questo', native: 'this (masc.)', rank: 32, category: 'pronoun', band: 'A' },
    { foreign: 'bene', native: 'well / good', rank: 33, category: 'adverb', band: 'A' },
    { foreign: 'qui', native: 'here', rank: 34, category: 'adverb', band: 'A' },
    { foreign: 'sei', native: 'you are / six', rank: 35, category: 'number', band: 'A' },
    { foreign: 'del', native: 'of the', rank: 36, category: 'pronoun', band: 'A' },
    { foreign: 'tu', native: 'you', rank: 37, category: 'pronoun', band: 'A' },
    { foreign: 'solo', native: 'only / alone', rank: 38, category: 'adverb', band: 'A' },
    { foreign: 'mio', native: 'my / mine', rank: 39, category: 'pronoun', band: 'A' },
    { foreign: 'al', native: 'to the', rank: 40, category: 'pronoun', band: 'A' },
    { foreign: 'me', native: 'me (stressed)', rank: 41, category: 'pronoun', band: 'A' },
    { foreign: 'tutto', native: 'all / everything', rank: 42, category: 'pronoun', band: 'A' },
    { foreign: 'te', native: 'you (stressed)', rank: 43, category: 'pronoun', band: 'A' },
    { foreign: 'era', native: 'was', rank: 44, category: 'verb', band: 'A' },
    { foreign: 'della', native: 'of the (fem.)', rank: 45, category: 'pronoun', band: 'A' },
    { foreign: 'mia', native: 'my (fem.)', rank: 46, category: 'pronoun', band: 'A' },
    { foreign: 'fatto', native: 'done / fact', rank: 47, category: 'verb', band: 'A' },
    { foreign: 'fare', native: 'to do / to make', rank: 48, category: 'verb', band: 'A' },
    { foreign: 'essere', native: 'to be', rank: 49, category: 'verb', band: 'A' },
    { foreign: 'so', native: 'I know', rank: 50, category: 'verb', band: 'A' },
    { foreign: 'quando', native: 'when', rank: 51, category: 'question', band: 'A' },
    { foreign: 'sì', native: 'yes', rank: 52, category: 'particle', band: 'A' },
    { foreign: 'ora', native: 'now', rank: 53, category: 'adverb', band: 'A' },
    { foreign: 'lei', native: 'she / you (formal)', rank: 54, category: 'pronoun', band: 'A' },
    { foreign: 'gli', native: 'the (masc. pl. before vowel) / to him', rank: 55, category: 'pronoun', band: 'A' },
    { foreign: 'ne', native: 'of it / from there', rank: 56, category: 'pronoun', band: 'A' },
    { foreign: 'questa', native: 'this (fem.)', rank: 57, category: 'pronoun', band: 'A' },
    { foreign: 'detto', native: 'said', rank: 58, category: 'verb', band: 'A' },
    { foreign: 'va', native: 'goes', rank: 59, category: 'verb', band: 'A' },
    { foreign: 'perche', native: 'why / because', rank: 60, category: 'question', band: 'A' },
    { foreign: 'quello', native: 'that (masc.)', rank: 61, category: 'pronoun', band: 'A' },
    { foreign: 'mai', native: 'never / ever', rank: 62, category: 'adverb', band: 'A' },
    { foreign: 'alla', native: 'to the (fem.)', rank: 63, category: 'pronoun', band: 'A' },
    { foreign: 'o', native: 'or', rank: 64, category: 'connector', band: 'A' },
    { foreign: 'anche', native: 'also / even', rank: 65, category: 'connector', band: 'A' },
    { foreign: 'stato', native: 'been / state', rank: 66, category: 'verb', band: 'A' },
    { foreign: 'abbiamo', native: 'we have', rank: 67, category: 'verb', band: 'A' },
    { foreign: 'tutti', native: 'all / everyone', rank: 68, category: 'pronoun', band: 'A' },
    { foreign: 'dei', native: 'of the (pl.) / some', rank: 69, category: 'pronoun', band: 'A' },
    { foreign: 'grazie', native: 'thank you', rank: 70, category: 'noun', band: 'A' },
    { foreign: 'chi', native: 'who', rank: 71, category: 'question', band: 'A' },
    { foreign: 'sta', native: 'is / stays', rank: 72, category: 'verb', band: 'A' },
    { foreign: 'molto', native: 'very / a lot', rank: 73, category: 'adverb', band: 'A' },
    { foreign: 'più', native: 'more', rank: 74, category: 'adverb', band: 'A' },
    { foreign: 'voglio', native: 'I want', rank: 75, category: 'verb', band: 'A' },
    { foreign: 'perché', native: 'why / because', rank: 76, category: 'question', band: 'A' },
    { foreign: 'tuo', native: 'your', rank: 77, category: 'pronoun', band: 'A' },
    { foreign: 'nel', native: 'in the', rank: 78, category: 'preposition', band: 'A' },
    { foreign: 'lui', native: 'he', rank: 79, category: 'pronoun', band: 'A' },
    { foreign: 'allora', native: 'then / so', rank: 80, category: 'connector', band: 'A' },
    { foreign: 'posso', native: 'I can', rank: 81, category: 'verb', band: 'A' },
    { foreign: 'piu', native: 'more', rank: 82, category: 'noun', band: 'A' },
    { foreign: 'prima', native: 'before / first', rank: 83, category: 'number', band: 'A' },
    { foreign: 'tua', native: 'your (fem.)', rank: 84, category: 'pronoun', band: 'A' },
    { foreign: 'suo', native: 'his / her / its', rank: 85, category: 'pronoun', band: 'A' },
    { foreign: 'niente', native: 'nothing', rank: 86, category: 'pronoun', band: 'A' },
    { foreign: 'qualcosa', native: 'something', rank: 87, category: 'pronoun', band: 'A' },
    { foreign: 'sai', native: 'you know', rank: 88, category: 'verb', band: 'A' },
    { foreign: 'siamo', native: 'we are', rank: 89, category: 'verb', band: 'A' },
    { foreign: 'cosi', native: 'like this / so', rank: 90, category: 'adverb', band: 'A' },
    { foreign: 'davvero', native: 'really', rank: 91, category: 'adverb', band: 'A' },
    { foreign: 'ancora', native: 'still / again', rank: 92, category: 'adverb', band: 'A' },
    { foreign: 'hanno', native: 'they have', rank: 93, category: 'verb', band: 'A' },
    { foreign: 'stai', native: 'you are (stay)', rank: 94, category: 'verb', band: 'A' },
    { foreign: 'fa', native: 'does / makes', rank: 95, category: 'verb', band: 'A' },
    { foreign: 'sua', native: 'his / her (fem.)', rank: 96, category: 'pronoun', band: 'A' },
    { foreign: 'così', native: 'like this / so', rank: 97, category: 'adverb', band: 'A' },
    { foreign: 'casa', native: 'house / home', rank: 98, category: 'noun', band: 'A' },
    { foreign: 'uno', native: 'one', rank: 99, category: 'number', band: 'A' },
    { foreign: 'dove', native: 'where', rank: 100, category: 'question', band: 'A' },
    { foreign: 'su', native: 'on / up', rank: 101, category: 'preposition', band: 'B' },
    { foreign: 'vero', native: 'true', rank: 102, category: 'adjective', band: 'B' },
    { foreign: 'vuoi', native: 'you want', rank: 103, category: 'verb', band: 'B' },
    { foreign: 'noi', native: 'we', rank: 104, category: 'pronoun', band: 'B' },
    { foreign: 'due', native: 'two', rank: 105, category: 'number', band: 'B' },
    { foreign: 'quindi', native: 'therefore', rank: 106, category: 'connector', band: 'B' },
    { foreign: 'dire', native: 'to say', rank: 107, category: 'verb', band: 'B' },
    { foreign: 'delle', native: 'of the (fem. pl.)', rank: 108, category: 'pronoun', band: 'B' },
    { foreign: 'quella', native: 'that (fem.)', rank: 109, category: 'pronoun', band: 'B' },
    { foreign: 'sempre', native: 'always', rank: 110, category: 'adverb', band: 'B' },
    { foreign: 'altro', native: 'other', rank: 111, category: 'pronoun', band: 'B' },
    { foreign: 'sto', native: 'I am (stay)', rank: 112, category: 'verb', band: 'B' },
    { foreign: 'andare', native: 'to go', rank: 113, category: 'verb', band: 'B' },
    { foreign: 'loro', native: 'they / their', rank: 114, category: 'pronoun', band: 'B' },
    { foreign: 'devo', native: 'I must', rank: 115, category: 'verb', band: 'B' },
    { foreign: 'quel', native: 'that (masc. short)', rank: 116, category: 'adjective', band: 'B' },
    { foreign: 'forse', native: 'maybe', rank: 117, category: 'adverb', band: 'B' },
    { foreign: 'li', native: 'them (masc.) / there', rank: 118, category: 'pronoun', band: 'B' },
    { foreign: 'proprio', native: 'really / own', rank: 119, category: 'adverb', band: 'B' },
    { foreign: 'certo', native: 'certain / of course', rank: 120, category: 'noun', band: 'B' },
    { foreign: 'tempo', native: 'time / weather', rank: 121, category: 'noun', band: 'B' },
    { foreign: 'nella', native: 'in the (fem.)', rank: 122, category: 'preposition', band: 'B' },
    { foreign: 'poi', native: 'then', rank: 123, category: 'connector', band: 'B' },
    { foreign: 'vi', native: 'you pl. (obj.) / there', rank: 124, category: 'pronoun', band: 'B' },
    { foreign: 'credo', native: 'I believe', rank: 125, category: 'verb', band: 'B' },
    { foreign: 'vita', native: 'life', rank: 126, category: 'noun', band: 'B' },
    { foreign: 'cose', native: 'things', rank: 127, category: 'noun', band: 'B' },
    { foreign: 'sul', native: 'on the', rank: 128, category: 'preposition', band: 'B' },
    { foreign: 'quanto', native: 'how much / as much', rank: 129, category: 'question', band: 'B' },
    { foreign: 'puoi', native: 'you can', rank: 130, category: 'verb', band: 'B' },
    { foreign: 'fuori', native: 'outside', rank: 131, category: 'adverb', band: 'B' },
    { foreign: 'anni', native: 'years', rank: 132, category: 'noun', band: 'B' },
    { foreign: 'cui', native: 'which / whom', rank: 133, category: 'pronoun', band: 'B' },
    { foreign: 'parte', native: 'part', rank: 134, category: 'verb', band: 'B' },
    { foreign: 'visto', native: 'seen', rank: 135, category: 'verb', band: 'B' },
    { foreign: 'qualcuno', native: 'someone', rank: 136, category: 'pronoun', band: 'B' },
    { foreign: 'lavoro', native: 'work / job', rank: 137, category: 'verb', band: 'B' },
    { foreign: 'voi', native: 'you (pl.)', rank: 138, category: 'pronoun', band: 'B' },
    { foreign: 'ciao', native: 'hi / bye', rank: 139, category: 'noun', band: 'B' },
    { foreign: 'dio', native: 'God', rank: 140, category: 'noun', band: 'B' },
    { foreign: 'volta', native: 'time (occasion)', rank: 141, category: 'noun', band: 'B' },
    { foreign: 'dopo', native: 'after', rank: 142, category: 'preposition', band: 'B' },
    { foreign: 'adesso', native: 'now', rank: 143, category: 'adverb', band: 'B' },
    { foreign: 'stata', native: 'been (fem.)', rank: 144, category: 'verb', band: 'B' },
    { foreign: 'uomo', native: 'man', rank: 145, category: 'noun', band: 'B' },
    { foreign: 'padre', native: 'father', rank: 146, category: 'noun', band: 'B' },
    { foreign: 'devi', native: 'you must', rank: 147, category: 'verb', band: 'B' },
    { foreign: 'bisogno', native: 'need', rank: 148, category: 'noun', band: 'B' },
    { foreign: 'gia', native: 'already', rank: 149, category: 'particle', band: 'B' },
    { foreign: 'amico', native: 'friend', rank: 150, category: 'noun', band: 'B' },
    { foreign: 'ed', native: 'and (before vowel)', rank: 151, category: 'connector', band: 'B' },
    { foreign: 'posto', native: 'place / seat', rank: 152, category: 'noun', band: 'B' },
    { foreign: 'nessuno', native: 'nobody', rank: 153, category: 'pronoun', band: 'B' },
    { foreign: 'via', native: 'street / away', rank: 154, category: 'noun', band: 'B' },
    { foreign: 'fai', native: 'you do', rank: 155, category: 'verb', band: 'B' },
    { foreign: 'signore', native: 'sir / mister', rank: 156, category: 'noun', band: 'B' },
    { foreign: 'meglio', native: 'better', rank: 157, category: 'adverb', band: 'B' },
    { foreign: 'dai', native: 'come on', rank: 158, category: 'preposition', band: 'B' },
    { foreign: 'dal', native: 'from the', rank: 159, category: 'preposition', band: 'B' },
    { foreign: 'vuole', native: 'wants', rank: 160, category: 'verb', band: 'B' },
    { foreign: 'sembra', native: 'seems', rank: 161, category: 'verb', band: 'B' },
    { foreign: 'giorno', native: 'day', rank: 162, category: 'noun', band: 'B' },
    { foreign: 'ogni', native: 'every', rank: 163, category: 'noun', band: 'B' },
    { foreign: 'modo', native: 'way', rank: 164, category: 'noun', band: 'B' },
    { foreign: 'senza', native: 'without', rank: 165, category: 'preposition', band: 'B' },
    { foreign: 'vedere', native: 'to see', rank: 166, category: 'verb', band: 'B' },
    { foreign: 'dobbiamo', native: 'we must', rank: 167, category: 'verb', band: 'B' },
    { foreign: 'qualche', native: 'some', rank: 168, category: 'noun', band: 'B' },
    { foreign: 'dispiace', native: 'is sorry / regrets', rank: 169, category: 'verb', band: 'B' },
    { foreign: 'penso', native: 'I think', rank: 170, category: 'verb', band: 'B' },
    { foreign: 'ecco', native: 'here is / there', rank: 171, category: 'particle', band: 'B' },
    { foreign: 'parlare', native: 'to speak', rank: 172, category: 'verb', band: 'B' },
    { foreign: 'tra', native: 'between / among', rank: 173, category: 'preposition', band: 'B' },
    { foreign: 'mamma', native: 'mom', rank: 174, category: 'noun', band: 'B' },
    { foreign: 'già', native: 'already', rank: 175, category: 'particle', band: 'B' },
    { foreign: 'dalla', native: 'from the (fem.)', rank: 176, category: 'preposition', band: 'B' },
    { foreign: 'troppo', native: 'too / too much', rank: 177, category: 'adverb', band: 'B' },
    { foreign: 'fosse', native: 'were (subjunctive)', rank: 178, category: 'verb', band: 'B' },
    { foreign: 'possiamo', native: 'we can', rank: 179, category: 'verb', band: 'B' },
    { foreign: 'nuovo', native: 'new', rank: 180, category: 'adjective', band: 'B' },
    { foreign: 'male', native: 'badly / pain / wrong', rank: 181, category: 'adverb', band: 'B' },
    { foreign: 'madre', native: 'mother', rank: 182, category: 'noun', band: 'B' },
    { foreign: 'avete', native: 'you have (pl.)', rank: 183, category: 'verb', band: 'B' },
    { foreign: 'vai', native: 'you go', rank: 184, category: 'verb', band: 'B' },
    { foreign: 'sulla', native: 'on the (fem.)', rank: 185, category: 'preposition', band: 'B' },
    { foreign: 'giusto', native: 'correct', rank: 186, category: 'noun', band: 'B' },
    { foreign: 'sa', native: 'knows', rank: 187, category: 'verb', band: 'B' },
    { foreign: 'aspetta', native: 'wait', rank: 188, category: 'verb', band: 'B' },
    { foreign: 'avere', native: 'to have', rank: 189, category: 'verb', band: 'B' },
    { foreign: 'deve', native: 'must (he/she)', rank: 190, category: 'verb', band: 'B' },
    { foreign: 'nostro', native: 'our', rank: 191, category: 'pronoun', band: 'B' },
    { foreign: 'grande', native: 'big', rank: 192, category: 'adjective', band: 'B' },
    { foreign: 'può', native: 'can (he/she)', rank: 193, category: 'verb', band: 'B' },
    { foreign: 'senti', native: 'listen', rank: 194, category: 'verb', band: 'B' },
    { foreign: 'soldi', native: 'money', rank: 195, category: 'noun', band: 'B' },
    { foreign: 'sapere', native: 'to know', rank: 196, category: 'verb', band: 'B' },
    { foreign: 'tre', native: 'three', rank: 197, category: 'number', band: 'B' },
    { foreign: 'oggi', native: 'today', rank: 198, category: 'adverb', band: 'B' },
    { foreign: 'piace', native: 'is pleasing / likes', rank: 199, category: 'verb', band: 'B' },
    { foreign: 'idea', native: 'idea', rank: 200, category: 'noun', band: 'B' },
    { foreign: 'siete', native: 'you are (pl.)', rank: 201, category: 'verb', band: 'C' },
    { foreign: 'figlio', native: 'son', rank: 202, category: 'noun', band: 'C' },
    { foreign: 'gente', native: 'people', rank: 203, category: 'adjective', band: 'C' },
    { foreign: 'sicuro', native: 'safe / sure', rank: 204, category: 'noun', band: 'C' },
    { foreign: 'guarda', native: 'look', rank: 205, category: 'verb', band: 'C' },
    { foreign: 'dentro', native: 'inside', rank: 206, category: 'adverb', band: 'C' },
    { foreign: 'caso', native: 'case', rank: 207, category: 'noun', band: 'C' },
    { foreign: 'signora', native: 'mrs.', rank: 208, category: 'noun', band: 'C' },
    { foreign: 'faccio', native: 'I do', rank: 209, category: 'verb', band: 'C' },
    { foreign: 'nome', native: 'name', rank: 210, category: 'noun', band: 'C' },
    { foreign: 'problema', native: 'problem', rank: 211, category: 'noun', band: 'C' },
    { foreign: 'mondo', native: 'world', rank: 212, category: 'noun', band: 'C' },
    { foreign: 'nulla', native: 'nothing', rank: 213, category: 'pronoun', band: 'C' },
    { foreign: 'donna', native: 'woman', rank: 214, category: 'noun', band: 'C' },
    { foreign: 'stare', native: 'to stay / to be', rank: 215, category: 'verb', band: 'C' },
    { foreign: 'basta', native: 'is enough / stop', rank: 216, category: 'verb', band: 'C' },
    { foreign: 'insieme', native: 'together', rank: 217, category: 'adverb', band: 'C' },
    { foreign: 'faccia', native: 'face', rank: 218, category: 'noun', band: 'C' },
    { foreign: 'ragazza', native: 'girl', rank: 219, category: 'noun', band: 'C' },
    { foreign: 'subito', native: 'right away', rank: 220, category: 'adverb', band: 'C' },
    { foreign: 'famiglia', native: 'family', rank: 221, category: 'noun', band: 'C' },
    { foreign: 'ragazzo', native: 'boy / guy', rank: 222, category: 'noun', band: 'C' },
    { foreign: 'stesso', native: 'same', rank: 223, category: 'pronoun', band: 'C' },
    { foreign: 'ragione', native: 'reason', rank: 224, category: 'noun', band: 'C' },
    { foreign: 'notte', native: 'night', rank: 225, category: 'noun', band: 'C' },
    { foreign: 'testa', native: 'head', rank: 226, category: 'noun', band: 'C' },
    { foreign: 'serve', native: 'is needed / serves', rank: 227, category: 'verb', band: 'C' },
    { foreign: 'sotto', native: 'below', rank: 228, category: 'preposition', band: 'C' },
    { foreign: 'vado', native: 'I go', rank: 229, category: 'verb', band: 'C' },
    { foreign: 'bella', native: 'beautiful (fem.)', rank: 230, category: 'adjective', band: 'C' },
    { foreign: 'scusa', native: 'sorry', rank: 231, category: 'noun', band: 'C' },
    { foreign: 'prendere', native: 'to take', rank: 232, category: 'verb', band: 'C' },
    { foreign: 'porta', native: 'door', rank: 233, category: 'verb', band: 'C' },
    { foreign: 'bello', native: 'beautiful', rank: 234, category: 'adjective', band: 'C' },
    { foreign: 'moglie', native: 'wife', rank: 235, category: 'noun', band: 'C' },
    { foreign: 'vorrei', native: 'I would like', rank: 236, category: 'noun', band: 'C' },
    { foreign: 'storia', native: 'story / history', rank: 237, category: 'noun', band: 'C' },
    { foreign: 'persona', native: 'person', rank: 238, category: 'noun', band: 'C' },
    { foreign: 'pronto', native: 'ready', rank: 239, category: 'adjective', band: 'C' },
    { foreign: 'meno', native: 'less', rank: 240, category: 'adverb', band: 'C' },
    { foreign: 'avanti', native: 'come in / go ahead', rank: 241, category: 'verb', band: 'C' },
    { foreign: 'secondo', native: 'second / according to', rank: 242, category: 'number', band: 'C' },
    { foreign: 'venire', native: 'to come', rank: 243, category: 'verb', band: 'C' },
    { foreign: 'polizia', native: 'police', rank: 244, category: 'noun', band: 'C' },
    { foreign: 'lì', native: 'there', rank: 245, category: 'adverb', band: 'C' },
    { foreign: 'mentre', native: 'while', rank: 246, category: 'connector', band: 'C' },
    { foreign: 'letto', native: 'bed', rank: 247, category: 'verb', band: 'C' },
    { foreign: 'aiuto', native: 'help', rank: 248, category: 'verb', band: 'C' },
    { foreign: 'paura', native: 'fear', rank: 249, category: 'noun', band: 'C' },
    { foreign: 'fratello', native: 'brother', rank: 250, category: 'noun', band: 'C' },
    { foreign: 'domani', native: 'tomorrow', rank: 251, category: 'adverb', band: 'C' },
    { foreign: 'capo', native: 'boss', rank: 252, category: 'noun', band: 'C' },
    { foreign: 'amore', native: 'love', rank: 253, category: 'noun', band: 'C' },
    { foreign: 'piano', native: 'plan / floor', rank: 254, category: 'noun', band: 'C' },
    { foreign: 'macchina', native: 'machine', rank: 255, category: 'noun', band: 'C' },
    { foreign: 'trovare', native: 'to find', rank: 256, category: 'verb', band: 'C' },
    { foreign: 'mano', native: 'hand', rank: 257, category: 'noun', band: 'C' },
    { foreign: 'presto', native: 'soon', rank: 258, category: 'adverb', band: 'C' },
    { foreign: 'bambino', native: 'child', rank: 259, category: 'noun', band: 'C' },
    { foreign: 'tornare', native: 'to return', rank: 260, category: 'verb', band: 'C' },
    { foreign: 'primo', native: 'first course', rank: 261, category: 'number', band: 'C' },
    { foreign: 'vostro', native: 'your (pl.)', rank: 262, category: 'pronoun', band: 'C' },
    { foreign: 'sera', native: 'evening', rank: 263, category: 'noun', band: 'C' },
    { foreign: 'qua', native: 'here', rank: 264, category: 'adverb', band: 'C' },
    { foreign: 'anno', native: 'year', rank: 265, category: 'noun', band: 'C' },
    { foreign: 'piacere', native: 'to like', rank: 266, category: 'verb', band: 'C' },
    { foreign: 'contro', native: 'against', rank: 267, category: 'preposition', band: 'C' },
    { foreign: 'felice', native: 'happy', rank: 268, category: 'adjective', band: 'C' },
    { foreign: 'andata', native: 'outbound', rank: 269, category: 'verb', band: 'C' },
    { foreign: 'quale', native: 'which', rank: 270, category: 'question', band: 'C' },
    { foreign: 'figlia', native: 'daughter', rank: 271, category: 'noun', band: 'C' },
    { foreign: 'almeno', native: 'at least', rank: 272, category: 'noun', band: 'C' },
    { foreign: 'terra', native: 'earth / land', rank: 273, category: 'noun', band: 'C' },
    { foreign: 'strada', native: 'street', rank: 274, category: 'noun', band: 'C' },
    { foreign: 'importante', native: 'important', rank: 275, category: 'adjective', band: 'C' },
    { foreign: 'salve', native: 'hello', rank: 276, category: 'noun', band: 'C' },
    { foreign: 'settimana', native: 'week', rank: 277, category: 'noun', band: 'C' },
    { foreign: 'uscire', native: 'to go out', rank: 278, category: 'verb', band: 'C' },
    { foreign: 'stasera', native: 'this evening', rank: 279, category: 'noun', band: 'C' },
    { foreign: 'scusi', native: 'excuse me', rank: 280, category: 'noun', band: 'C' },
    { foreign: 'occhi', native: 'eyes', rank: 281, category: 'noun', band: 'C' },
    { foreign: 'possibile', native: 'possible', rank: 282, category: 'adjective', band: 'C' },
    { foreign: 'scuola', native: 'school', rank: 283, category: 'noun', band: 'C' },
    { foreign: 'sangue', native: 'blood', rank: 284, category: 'noun', band: 'C' },
    { foreign: 'piccolo', native: 'small', rank: 285, category: 'adjective', band: 'C' },
    { foreign: 'traduzione', native: 'translation', rank: 286, category: 'noun', band: 'C' },
    { foreign: 'tardi', native: 'late', rank: 287, category: 'adverb', band: 'C' },
    { foreign: 'cuore', native: 'heart', rank: 288, category: 'noun', band: 'C' },
    { foreign: 'marito', native: 'husband', rank: 289, category: 'noun', band: 'C' },
    { foreign: 'ieri', native: 'yesterday', rank: 290, category: 'adverb', band: 'C' },
    { foreign: 'ascolta', native: 'listen', rank: 291, category: 'verb', band: 'C' },
    { foreign: 'difficile', native: 'difficult', rank: 292, category: 'noun', band: 'C' },
    { foreign: 'auto', native: 'car', rank: 293, category: 'noun', band: 'C' },
    { foreign: 'pensare', native: 'to think', rank: 294, category: 'verb', band: 'C' },
    { foreign: 'numero', native: 'number', rank: 295, category: 'noun', band: 'C' },
    { foreign: 'serio', native: 'serious', rank: 296, category: 'noun', band: 'C' },
    { foreign: 'entrare', native: 'to enter', rank: 297, category: 'verb', band: 'C' },
    { foreign: 'acqua', native: 'water', rank: 298, category: 'noun', band: 'C' },
    { foreign: 'stanza', native: 'room', rank: 299, category: 'noun', band: 'C' },
    { foreign: 'forte', native: 'strong', rank: 300, category: 'adjective', band: 'C' },
    { foreign: 'corpo', native: 'body', rank: 301, category: 'noun', band: 'C' },
    { foreign: 'sentire', native: 'to hear / feel', rank: 302, category: 'verb', band: 'C' },
    { foreign: 'foto', native: 'photo', rank: 303, category: 'noun', band: 'C' },
    { foreign: 'telefono', native: 'phone', rank: 304, category: 'noun', band: 'C' },
    { foreign: 'poco', native: 'little / few', rank: 305, category: 'adverb', band: 'C' },
    { foreign: 'vicino', native: 'near', rank: 306, category: 'adverb', band: 'C' },
    { foreign: 'capire', native: 'to understand', rank: 307, category: 'verb', band: 'C' },
    { foreign: 'cinque', native: 'five', rank: 308, category: 'number', band: 'C' },
    { foreign: 'strano', native: 'strange', rank: 309, category: 'adjective', band: 'C' },
    { foreign: 'festa', native: 'party', rank: 310, category: 'noun', band: 'C' },
    { foreign: 'quattro', native: 'four', rank: 311, category: 'number', band: 'C' },
    { foreign: 'dare', native: 'to give', rank: 312, category: 'verb', band: 'C' },
    { foreign: 'sorella', native: 'sister', rank: 313, category: 'noun', band: 'C' },
    { foreign: 'film', native: 'movie', rank: 314, category: 'noun', band: 'C' },
    { foreign: 'ufficio', native: 'office', rank: 315, category: 'noun', band: 'C' },
    { foreign: 'verso', native: 'toward', rank: 316, category: 'preposition', band: 'C' },
    { foreign: 'morire', native: 'to die', rank: 317, category: 'verb', band: 'C' },
    { foreign: 'signorina', native: 'miss', rank: 318, category: 'noun', band: 'C' },
    { foreign: 'vecchio', native: 'old', rank: 319, category: 'adjective', band: 'C' },
    { foreign: 'domanda', native: 'question', rank: 320, category: 'noun', band: 'C' },
    { foreign: 'guerra', native: 'war', rank: 321, category: 'noun', band: 'C' },
    { foreign: 'vivere', native: 'to live', rank: 322, category: 'verb', band: 'C' },
    { foreign: 'divertente', native: 'fun', rank: 323, category: 'adjective', band: 'C' },
    { foreign: 'conto', native: 'bill', rank: 324, category: 'noun', band: 'C' },
    { foreign: 'perdere', native: 'to lose', rank: 325, category: 'verb', band: 'C' },
    { foreign: 'mezzo', native: 'half / means', rank: 326, category: 'noun', band: 'C' },
    { foreign: 'squadra', native: 'team', rank: 327, category: 'noun', band: 'C' },
    { foreign: 'esatto', native: 'exact / right', rank: 328, category: 'adjective', band: 'C' },
    { foreign: 'parola', native: 'word', rank: 329, category: 'noun', band: 'C' },
    { foreign: 'sopra', native: 'above', rank: 330, category: 'preposition', band: 'C' },
    { foreign: 'motivo', native: 'reason', rank: 331, category: 'adjective', band: 'C' },
    { foreign: 'mangiare', native: 'to eat', rank: 332, category: 'verb', band: 'C' },
    { foreign: 'credere', native: 'to believe', rank: 333, category: 'verb', band: 'C' },
    { foreign: 'là', native: 'there', rank: 334, category: 'adverb', band: 'C' },
    { foreign: 'cena', native: 'dinner', rank: 335, category: 'noun', band: 'C' },
    { foreign: 'ultimo', native: 'last', rank: 336, category: 'noun', band: 'C' },
    { foreign: 'facile', native: 'easy', rank: 337, category: 'adjective', band: 'C' },
    { foreign: 'buongiorno', native: 'good morning', rank: 338, category: 'adjective', band: 'C' },
    { foreign: 'sicurezza', native: 'safety', rank: 339, category: 'noun', band: 'C' },
    { foreign: 'matrimonio', native: 'wedding', rank: 340, category: 'noun', band: 'C' },
    { foreign: 'fuoco', native: 'fire', rank: 341, category: 'noun', band: 'C' },
    { foreign: 'cercare', native: 'to look for', rank: 342, category: 'verb', band: 'C' },
    { foreign: 're', native: 'king', rank: 343, category: 'noun', band: 'C' },
    { foreign: 'causa', native: 'cause', rank: 344, category: 'noun', band: 'C' },
    { foreign: 'mettere', native: 'to put', rank: 345, category: 'verb', band: 'C' },
    { foreign: 'uccidere', native: 'to kill', rank: 346, category: 'verb', band: 'C' },
    { foreign: 'però', native: 'however', rank: 347, category: 'connector', band: 'C' },
    { foreign: 'presidente', native: 'president', rank: 348, category: 'adjective', band: 'C' },
    { foreign: 'città', native: 'city', rank: 349, category: 'noun', band: 'C' },
    { foreign: 'ospedale', native: 'hospital', rank: 350, category: 'noun', band: 'C' },
    { foreign: 'bere', native: 'to drink', rank: 351, category: 'verb', band: 'D' },
    { foreign: 'situazione', native: 'situation', rank: 352, category: 'noun', band: 'D' },
    { foreign: 'durante', native: 'during', rank: 353, category: 'preposition', band: 'D' },
    { foreign: 'lasciare', native: 'to leave / let', rank: 354, category: 'verb', band: 'D' },
    { foreign: 'paese', native: 'country / town', rank: 355, category: 'noun', band: 'D' },
    { foreign: 'pace', native: 'peace', rank: 356, category: 'noun', band: 'D' },
    { foreign: 'musica', native: 'music', rank: 357, category: 'noun', band: 'D' },
    { foreign: 'libro', native: 'book', rank: 358, category: 'noun', band: 'D' },
    { foreign: 'amica', native: 'friend (fem.)', rank: 359, category: 'noun', band: 'D' },
    { foreign: 'diventare', native: 'to become', rank: 360, category: 'verb', band: 'D' },
    { foreign: 'sbagliato', native: 'wrong', rank: 361, category: 'adjective', band: 'D' },
    { foreign: 'portare', native: 'to bring / carry', rank: 362, category: 'verb', band: 'D' },
    { foreign: 'buono', native: 'good', rank: 363, category: 'adjective', band: 'D' },
    { foreign: 'aspettare', native: 'to wait', rank: 364, category: 'verb', band: 'D' },
    { foreign: 'arrivare', native: 'to arrive', rank: 365, category: 'verb', band: 'D' },
    { foreign: 'lungo', native: 'long', rank: 366, category: 'adjective', band: 'D' },
    { foreign: 'messaggio', native: 'message', rank: 367, category: 'noun', band: 'D' },
    { foreign: 'dormire', native: 'to sleep', rank: 368, category: 'verb', band: 'D' },
    { foreign: 'dieci', native: 'ten', rank: 369, category: 'number', band: 'D' },
    { foreign: 'usare', native: 'to use', rank: 370, category: 'verb', band: 'D' },
    { foreign: 'cielo', native: 'sky', rank: 371, category: 'noun', band: 'D' },
    { foreign: 'guardare', native: 'to look', rank: 372, category: 'verb', band: 'D' },
    { foreign: 'bagno', native: 'bathroom', rank: 373, category: 'noun', band: 'D' },
    { foreign: 'aria', native: 'air', rank: 374, category: 'noun', band: 'D' },
    { foreign: 'cane', native: 'dog', rank: 375, category: 'noun', band: 'D' },
    { foreign: 'restare', native: 'to stay', rank: 376, category: 'verb', band: 'D' },
    { foreign: 'luce', native: 'light', rank: 377, category: 'noun', band: 'D' },
    { foreign: 'giovane', native: 'young', rank: 378, category: 'adjective', band: 'D' },
    { foreign: 'fra', native: 'among', rank: 379, category: 'preposition', band: 'D' },
    { foreign: 'provare', native: 'to try', rank: 380, category: 'verb', band: 'D' },
    { foreign: 'minuto', native: 'minute', rank: 381, category: 'noun', band: 'D' },
    { foreign: 'lontano', native: 'far', rank: 382, category: 'adverb', band: 'D' },
    { foreign: 'gruppo', native: 'group', rank: 383, category: 'noun', band: 'D' },
    { foreign: 'arrivo', native: 'arrival', rank: 384, category: 'verb', band: 'D' },
    { foreign: 'bambina', native: 'girl (child)', rank: 385, category: 'noun', band: 'D' },
    { foreign: 'capelli', native: 'hair', rank: 386, category: 'noun', band: 'D' },
    { foreign: 'aiutare', native: 'to help', rank: 387, category: 'verb', band: 'D' },
    { foreign: 'alto', native: 'tall / high', rank: 388, category: 'adjective', band: 'D' },
    { foreign: 'cibo', native: 'food', rank: 389, category: 'noun', band: 'D' },
    { foreign: 'finalmente', native: 'finally', rank: 390, category: 'adjective', band: 'D' },
    { foreign: 'odio', native: 'hate', rank: 391, category: 'noun', band: 'D' },
    { foreign: 'incidente', native: 'accident', rank: 392, category: 'adjective', band: 'D' },
    { foreign: 'speciale', native: 'special', rank: 393, category: 'adjective', band: 'D' },
    { foreign: 'cambiare', native: 'to change', rank: 394, category: 'verb', band: 'D' },
    { foreign: 'camera', native: 'room', rank: 395, category: 'noun', band: 'D' },
    { foreign: 'semplice', native: 'simple', rank: 396, category: 'noun', band: 'D' },
    { foreign: 'viaggio', native: 'trip', rank: 397, category: 'verb', band: 'D' },
    { foreign: 'chiaro', native: 'light', rank: 398, category: 'noun', band: 'D' },
    { foreign: 'chiamata', native: 'call', rank: 399, category: 'noun', band: 'D' },
    { foreign: 'bocca', native: 'mouth', rank: 400, category: 'noun', band: 'D' },
    { foreign: 'permesso', native: 'excuse me (passing)', rank: 401, category: 'noun', band: 'D' },
    { foreign: 'giocare', native: 'to play', rank: 402, category: 'verb', band: 'D' },
    { foreign: 'ovviamente', native: 'obviously', rank: 403, category: 'adjective', band: 'D' },
    { foreign: 'finire', native: 'to finish', rank: 404, category: 'verb', band: 'D' },
    { foreign: 'natale', native: 'Christmas', rank: 405, category: 'noun', band: 'D' },
    { foreign: 'occhio', native: 'eye', rank: 406, category: 'noun', band: 'D' },
    { foreign: 'mattina', native: 'morning', rank: 407, category: 'noun', band: 'D' },
    { foreign: 'prossimo', native: 'next', rank: 408, category: 'noun', band: 'D' },
    { foreign: 'potere', native: 'to be able / can', rank: 409, category: 'verb', band: 'D' },
    { foreign: 'mese', native: 'month', rank: 410, category: 'noun', band: 'D' },
    { foreign: 'chiedere', native: 'to ask', rank: 411, category: 'verb', band: 'D' },
    { foreign: 'nave', native: 'ship', rank: 412, category: 'noun', band: 'D' },
    { foreign: 'libero', native: 'free', rank: 413, category: 'adjective', band: 'D' },
    { foreign: 'porto', native: 'port', rank: 414, category: 'verb', band: 'D' },
    { foreign: 'zio', native: 'uncle', rank: 415, category: 'noun', band: 'D' },
    { foreign: 'centro', native: 'center', rank: 416, category: 'noun', band: 'D' },
    { foreign: 'mille', native: 'thousand', rank: 417, category: 'number', band: 'D' },
    { foreign: 'carino', native: 'cute / nice', rank: 418, category: 'noun', band: 'D' },
    { foreign: 'brutto', native: 'ugly', rank: 419, category: 'adjective', band: 'D' },
    { foreign: 'sole', native: 'sun', rank: 420, category: 'noun', band: 'D' },
    { foreign: 'legge', native: 'law', rank: 421, category: 'verb', band: 'D' },
    { foreign: 'spesso', native: 'often', rank: 422, category: 'adverb', band: 'D' },
    { foreign: 'gentile', native: 'kind', rank: 423, category: 'noun', band: 'D' },
    { foreign: 'rispetto', native: 'respect', rank: 424, category: 'noun', band: 'D' },
    { foreign: 'pagare', native: 'to pay', rank: 425, category: 'verb', band: 'D' },
    { foreign: 'sorpresa', native: 'surprise', rank: 426, category: 'noun', band: 'D' },
    { foreign: 'risposta', native: 'answer', rank: 427, category: 'noun', band: 'D' },
    { foreign: 'medico', native: 'doctor', rank: 428, category: 'noun', band: 'D' },
    { foreign: 'caro', native: 'expensive', rank: 429, category: 'noun', band: 'D' },
    { foreign: 'dolore', native: 'pain', rank: 430, category: 'noun', band: 'D' },
    { foreign: 'quali', native: 'which (pl.)', rank: 431, category: 'question', band: 'D' },
    { foreign: 'peggio', native: 'worse', rank: 432, category: 'adverb', band: 'D' },
    { foreign: 'pieno', native: 'full', rank: 433, category: 'adjective', band: 'D' },
    { foreign: 'diverso', native: 'different', rank: 434, category: 'adjective', band: 'D' },
    { foreign: 'vestiti', native: 'clothes', rank: 435, category: 'noun', band: 'D' },
    { foreign: 'normale', native: 'normal', rank: 436, category: 'adjective', band: 'D' },
    { foreign: 'nonna', native: 'grandmother', rank: 437, category: 'noun', band: 'D' },
    { foreign: 'rimanere', native: 'to remain', rank: 438, category: 'verb', band: 'D' },
    { foreign: 'chiuso', native: 'closed', rank: 439, category: 'verb', band: 'D' },
    { foreign: 'ritardo', native: 'delay', rank: 440, category: 'noun', band: 'D' },
    { foreign: 'attento', native: 'careful', rank: 441, category: 'noun', band: 'D' },
    { foreign: 'bar', native: 'café / bar', rank: 442, category: 'noun', band: 'D' },
    { foreign: 'impossibile', native: 'impossible', rank: 443, category: 'adjective', band: 'D' },
    { foreign: 'studio', native: 'I study', rank: 444, category: 'verb', band: 'D' },
    { foreign: 'video', native: 'video', rank: 445, category: 'noun', band: 'D' },
    { foreign: 'manca', native: 'is missing', rank: 446, category: 'verb', band: 'D' },
    { foreign: 'dolce', native: 'sweet', rank: 447, category: 'noun', band: 'D' },
    { foreign: 'chiave', native: 'key', rank: 448, category: 'noun', band: 'D' },
    { foreign: 'interessante', native: 'interesting', rank: 449, category: 'adjective', band: 'D' },
    { foreign: 'aereo', native: 'plane', rank: 450, category: 'noun', band: 'D' },
    { foreign: 'sette', native: 'seven', rank: 451, category: 'number', band: 'D' },
    { foreign: 'compleanno', native: 'birthday', rank: 452, category: 'noun', band: 'D' },
    { foreign: 'cliente', native: 'client', rank: 453, category: 'adjective', band: 'D' },
    { foreign: 'diritto', native: 'right / law', rank: 454, category: 'adjective', band: 'D' },
    { foreign: 'appartamento', native: 'apartment', rank: 455, category: 'noun', band: 'D' },
    { foreign: 'pranzo', native: 'lunch', rank: 456, category: 'noun', band: 'D' },
    { foreign: 'denaro', native: 'money', rank: 457, category: 'noun', band: 'D' },
    { foreign: 'continuare', native: 'to continue', rank: 458, category: 'verb', band: 'D' },
    { foreign: 'nero', native: 'black', rank: 459, category: 'noun', band: 'D' },
    { foreign: 'vestito', native: 'dress', rank: 460, category: 'noun', band: 'D' },
    { foreign: 'carta', native: 'paper', rank: 461, category: 'noun', band: 'D' },
    { foreign: 'dottoressa', native: 'doctor (fem.)', rank: 462, category: 'noun', band: 'D' },
    { foreign: 'iniziare', native: 'to begin', rank: 463, category: 'verb', band: 'D' },
    { foreign: 'otto', native: 'eight', rank: 464, category: 'number', band: 'D' },
    { foreign: 'negozio', native: 'shop', rank: 465, category: 'noun', band: 'D' },
    { foreign: 'spazio', native: 'space', rank: 466, category: 'noun', band: 'D' },
    { foreign: 'notizia', native: 'news', rank: 467, category: 'noun', band: 'D' },
    { foreign: 'tranquillo', native: 'calm', rank: 468, category: 'noun', band: 'D' },
    { foreign: 'silenzio', native: 'silence', rank: 469, category: 'noun', band: 'D' },
    { foreign: 'simile', native: 'similar', rank: 470, category: 'noun', band: 'D' },
    { foreign: 'ricerca', native: 'research', rank: 471, category: 'noun', band: 'D' },
    { foreign: 'scoprire', native: 'to discover', rank: 472, category: 'verb', band: 'D' },
    { foreign: 'salvare', native: 'to save', rank: 473, category: 'verb', band: 'D' },
    { foreign: 'pubblico', native: 'public', rank: 474, category: 'adjective', band: 'D' },
    { foreign: 'corso', native: 'course', rank: 475, category: 'verb', band: 'D' },
    { foreign: 'regalo', native: 'gift', rank: 476, category: 'noun', band: 'D' },
    { foreign: 'stamattina', native: 'this morning', rank: 477, category: 'noun', band: 'D' },
    { foreign: 'test', native: 'test', rank: 478, category: 'noun', band: 'D' },
    { foreign: 'salute', native: 'cheers / health', rank: 479, category: 'noun', band: 'D' },
    { foreign: 'computer', native: 'computer', rank: 480, category: 'noun', band: 'D' },
    { foreign: 'pericolo', native: 'danger', rank: 481, category: 'noun', band: 'D' },
    { foreign: 'freddo', native: 'cold', rank: 482, category: 'adjective', band: 'D' },
    { foreign: 'triste', native: 'sad', rank: 483, category: 'adjective', band: 'D' },
    { foreign: 'buonanotte', native: 'good night', rank: 484, category: 'adjective', band: 'D' },
    { foreign: 'birra', native: 'beer', rank: 485, category: 'noun', band: 'D' },
    { foreign: 'governo', native: 'government', rank: 486, category: 'noun', band: 'D' },
    { foreign: 'cucina', native: 'kitchen', rank: 487, category: 'noun', band: 'D' },
    { foreign: 'esempio', native: 'example', rank: 488, category: 'noun', band: 'D' },
    { foreign: 'stanotte', native: 'tonight', rank: 489, category: 'noun', band: 'D' },
    { foreign: 'cellulare', native: 'mobile phone', rank: 490, category: 'noun', band: 'D' },
    { foreign: 'borsa', native: 'bag', rank: 491, category: 'noun', band: 'D' },
    { foreign: 'nonno', native: 'grandfather', rank: 492, category: 'noun', band: 'D' },
    { foreign: 'comprare', native: 'to buy', rank: 493, category: 'verb', band: 'D' },
    { foreign: 'regina', native: 'queen', rank: 494, category: 'noun', band: 'D' },
    { foreign: 'aperto', native: 'open', rank: 495, category: 'verb', band: 'D' },
    { foreign: 'braccio', native: 'arm', rank: 496, category: 'noun', band: 'D' },
    { foreign: 'chiesa', native: 'church', rank: 497, category: 'noun', band: 'D' },
    { foreign: 'scrivere', native: 'to write', rank: 498, category: 'verb', band: 'D' },
    { foreign: 'paziente', native: 'patient', rank: 499, category: 'adjective', band: 'D' },
    { foreign: 'scarpe', native: 'shoes', rank: 500, category: 'noun', band: 'D' },
    { foreign: 'visita', native: 'visit', rank: 501, category: 'noun', band: 'E' },
    { foreign: 'sinistra', native: 'left', rank: 502, category: 'noun', band: 'E' },
    { foreign: 'mare', native: 'sea', rank: 503, category: 'noun', band: 'E' },
    { foreign: 'classe', native: 'class', rank: 504, category: 'noun', band: 'E' },
    { foreign: 'bianco', native: 'white', rank: 505, category: 'noun', band: 'E' },
    { foreign: 'tavolo', native: 'table', rank: 506, category: 'noun', band: 'E' },
    { foreign: 'stagione', native: 'season', rank: 507, category: 'noun', band: 'E' },
    { foreign: 'cavallo', native: 'horse', rank: 508, category: 'noun', band: 'E' },
    { foreign: 'rispondere', native: 'to answer', rank: 509, category: 'verb', band: 'E' },
    { foreign: 'contento', native: 'glad', rank: 510, category: 'noun', band: 'E' },
    { foreign: 'conoscere', native: 'to know (someone)', rank: 511, category: 'verb', band: 'E' },
    { foreign: 'inglese', native: 'English', rank: 512, category: 'noun', band: 'E' },
    { foreign: 'attraverso', native: 'through', rank: 513, category: 'noun', band: 'E' },
    { foreign: 'hotel', native: 'hotel', rank: 514, category: 'noun', band: 'E' },
    { foreign: 'carne', native: 'meat', rank: 515, category: 'noun', band: 'E' },
    { foreign: 'caldo', native: 'heat / hot', rank: 516, category: 'adjective', band: 'E' },
    { foreign: 'pelle', native: 'skin', rank: 517, category: 'noun', band: 'E' },
    { foreign: 'leggere', native: 'to read', rank: 518, category: 'verb', band: 'E' },
    { foreign: 'pomeriggio', native: 'afternoon', rank: 519, category: 'noun', band: 'E' },
    { foreign: 'destra', native: 'right', rank: 520, category: 'adjective', band: 'E' },
    { foreign: 'luna', native: 'moon', rank: 521, category: 'noun', band: 'E' },
    { foreign: 'affare', native: 'business / deal', rank: 522, category: 'noun', band: 'E' },
    { foreign: 'vino', native: 'wine', rank: 523, category: 'noun', band: 'E' },
    { foreign: 'arrivederci', native: 'goodbye', rank: 524, category: 'noun', band: 'E' },
    { foreign: 'caffè', native: 'coffee', rank: 525, category: 'noun', band: 'E' },
    { foreign: 'barca', native: 'boat', rank: 526, category: 'noun', band: 'E' },
    { foreign: 'lezione', native: 'lesson', rank: 527, category: 'noun', band: 'E' },
    { foreign: 'partire', native: 'to leave', rank: 528, category: 'verb', band: 'E' },
    { foreign: 'nord', native: 'north', rank: 529, category: 'noun', band: 'E' },
    { foreign: 'congratulazioni', native: 'congratulations', rank: 530, category: 'noun', band: 'E' },
    { foreign: 'sembrare', native: 'to seem', rank: 531, category: 'verb', band: 'E' },
    { foreign: 'treno', native: 'train', rank: 532, category: 'noun', band: 'E' },
    { foreign: 'radio', native: 'radio', rank: 533, category: 'noun', band: 'E' },
    { foreign: 'comune', native: 'common', rank: 534, category: 'adjective', band: 'E' },
    { foreign: 'energia', native: 'energy', rank: 535, category: 'noun', band: 'E' },
    { foreign: 'speranza', native: 'hope', rank: 536, category: 'noun', band: 'E' },
    { foreign: 'rosso', native: 'red', rank: 537, category: 'noun', band: 'E' },
    { foreign: 'combattere', native: 'to fight', rank: 538, category: 'verb', band: 'E' },
    { foreign: 'zia', native: 'aunt', rank: 539, category: 'noun', band: 'E' },
    { foreign: 'gamba', native: 'leg', rank: 540, category: 'noun', band: 'E' },
    { foreign: 'biglietto', native: 'ticket', rank: 541, category: 'noun', band: 'E' },
    { foreign: 'benvenuto', native: 'welcome', rank: 542, category: 'noun', band: 'E' },
    { foreign: 'offerta', native: 'offer', rank: 543, category: 'noun', band: 'E' },
    { foreign: 'banca', native: 'bank', rank: 544, category: 'noun', band: 'E' },
    { foreign: 'aprire', native: 'to open', rank: 545, category: 'verb', band: 'E' },
    { foreign: 'piangere', native: 'to cry', rank: 546, category: 'verb', band: 'E' },
    { foreign: 'sud', native: 'south', rank: 547, category: 'noun', band: 'E' },
    { foreign: 'pianeta', native: 'planet', rank: 548, category: 'noun', band: 'E' },
    { foreign: 'guida', native: 'guide', rank: 549, category: 'noun', band: 'E' },
    { foreign: 'prezzo', native: 'price', rank: 550, category: 'noun', band: 'E' },
    { foreign: 'arrabbiato', native: 'angry', rank: 551, category: 'noun', band: 'E' },
    { foreign: 'ritorno', native: 'return', rank: 552, category: 'noun', band: 'E' },
    { foreign: 'imparare', native: 'to learn', rank: 553, category: 'verb', band: 'E' },
    { foreign: 'progetto', native: 'project', rank: 554, category: 'noun', band: 'E' },
    { foreign: 'naturalmente', native: 'naturally', rank: 555, category: 'adjective', band: 'E' },
    { foreign: 'finestra', native: 'window', rank: 556, category: 'noun', band: 'E' },
    { foreign: 'correre', native: 'to run', rank: 557, category: 'verb', band: 'E' },
    { foreign: 'colazione', native: 'breakfast', rank: 558, category: 'noun', band: 'E' },
    { foreign: 'collo', native: 'neck', rank: 559, category: 'noun', band: 'E' },
    { foreign: 'fiducia', native: 'trust', rank: 560, category: 'noun', band: 'E' },
    { foreign: 'ristorante', native: 'restaurant', rank: 561, category: 'adjective', band: 'E' },
    { foreign: 'laboratorio', native: 'lab', rank: 562, category: 'noun', band: 'E' },
    { foreign: 'scegliere', native: 'to choose', rank: 563, category: 'verb', band: 'E' },
    { foreign: 'meta', native: 'goal / destination', rank: 564, category: 'noun', band: 'E' },
    { foreign: 'nove', native: 'nine', rank: 565, category: 'number', band: 'E' },
    { foreign: 'carriera', native: 'career', rank: 566, category: 'noun', band: 'E' },
    { foreign: 'blu', native: 'blue', rank: 567, category: 'noun', band: 'E' },
    { foreign: 'cominciare', native: 'to start', rank: 568, category: 'verb', band: 'E' },
    { foreign: 'muro', native: 'wall', rank: 569, category: 'noun', band: 'E' },
    { foreign: 'proteggere', native: 'to protect', rank: 570, category: 'verb', band: 'E' },
    { foreign: 'dubbio', native: 'doubt', rank: 571, category: 'noun', band: 'E' },
    { foreign: 'stazione', native: 'station', rank: 572, category: 'noun', band: 'E' },
    { foreign: 'emergenza', native: 'emergency', rank: 573, category: 'noun', band: 'E' },
    { foreign: 'giustizia', native: 'justice', rank: 574, category: 'noun', band: 'E' },
    { foreign: 'terzo', native: 'third', rank: 575, category: 'number', band: 'E' },
    { foreign: 'preoccupare', native: 'to worry', rank: 576, category: 'verb', band: 'E' },
    { foreign: 'locale', native: 'local', rank: 577, category: 'adjective', band: 'E' },
    { foreign: 'evitare', native: 'to avoid', rank: 578, category: 'verb', band: 'E' },
    { foreign: 'lingua', native: 'tongue', rank: 579, category: 'noun', band: 'E' },
    { foreign: 'torta', native: 'cake', rank: 580, category: 'noun', band: 'E' },
    { foreign: 'coppia', native: 'couple', rank: 581, category: 'noun', band: 'E' },
    { foreign: 'ridere', native: 'to laugh', rank: 582, category: 'verb', band: 'E' },
    { foreign: 'naso', native: 'nose', rank: 583, category: 'noun', band: 'E' },
    { foreign: 'chiudere', native: 'to close', rank: 584, category: 'verb', band: 'E' },
    { foreign: 'costa', native: 'coast', rank: 585, category: 'noun', band: 'E' },
    { foreign: 'albero', native: 'tree', rank: 586, category: 'noun', band: 'E' },
    { foreign: 'anello', native: 'ring', rank: 587, category: 'noun', band: 'E' },
    { foreign: 'piede', native: 'foot', rank: 588, category: 'noun', band: 'E' },
    { foreign: 'ferita', native: 'wound', rank: 589, category: 'noun', band: 'E' },
    { foreign: 'preoccupato', native: 'worried', rank: 590, category: 'noun', band: 'E' },
    { foreign: 'natura', native: 'nature', rank: 591, category: 'noun', band: 'E' },
    { foreign: 'colore', native: 'color', rank: 592, category: 'noun', band: 'E' },
    { foreign: 'basso', native: 'short / low', rank: 593, category: 'adjective', band: 'E' },
    { foreign: 'ascoltare', native: 'to listen', rank: 594, category: 'verb', band: 'E' },
    { foreign: 'decidere', native: 'to decide', rank: 595, category: 'verb', band: 'E' },
    { foreign: 'professore', native: 'professor', rank: 596, category: 'noun', band: 'E' },
    { foreign: 'fidanzato', native: 'fiancé / boyfriend', rank: 597, category: 'noun', band: 'E' },
    { foreign: 'compito', native: 'homework', rank: 598, category: 'noun', band: 'E' },
    { foreign: 'pesce', native: 'fish', rank: 599, category: 'noun', band: 'E' },
    { foreign: 'obiettivo', native: 'goal', rank: 600, category: 'adjective', band: 'E' },
    { foreign: 'risolvere', native: 'to solve', rank: 601, category: 'verb', band: 'E' },
    { foreign: 'isola', native: 'island', rank: 602, category: 'noun', band: 'E' },
    { foreign: 'ballare', native: 'to dance', rank: 603, category: 'verb', band: 'E' },
    { foreign: 'verde', native: 'green', rank: 604, category: 'noun', band: 'E' },
    { foreign: 'accettare', native: 'to accept', rank: 605, category: 'verb', band: 'E' },
    { foreign: 'metà', native: 'half', rank: 606, category: 'noun', band: 'E' },
    { foreign: 'soluzione', native: 'solution', rank: 607, category: 'noun', band: 'E' },
    { foreign: 'guidare', native: 'to drive', rank: 608, category: 'verb', band: 'E' },
    { foreign: 'denti', native: 'teeth', rank: 609, category: 'noun', band: 'E' },
    { foreign: 'effetto', native: 'effect', rank: 610, category: 'noun', band: 'E' },
    { foreign: 'ricordare', native: 'to remember', rank: 611, category: 'verb', band: 'E' },
    { foreign: 'vendere', native: 'to sell', rank: 612, category: 'verb', band: 'E' },
    { foreign: 'pantaloni', native: 'pants', rank: 613, category: 'noun', band: 'E' },
    { foreign: 'fede', native: 'faith', rank: 614, category: 'noun', band: 'E' },
    { foreign: 'nipote', native: 'grandchild / nephew/niece', rank: 615, category: 'noun', band: 'E' },
    { foreign: 'debole', native: 'weak', rank: 616, category: 'adjective', band: 'E' },
    { foreign: 'francese', native: 'French', rank: 617, category: 'noun', band: 'E' },
    { foreign: 'taxi', native: 'taxi', rank: 618, category: 'noun', band: 'E' },
    { foreign: 'creare', native: 'to create', rank: 619, category: 'verb', band: 'E' },
    { foreign: 'latte', native: 'milk', rank: 620, category: 'noun', band: 'E' },
    { foreign: 'gatto', native: 'cat', rank: 621, category: 'noun', band: 'E' },
    { foreign: 'estate', native: 'summer', rank: 622, category: 'noun', band: 'E' },
    { foreign: 'fiume', native: 'river', rank: 623, category: 'noun', band: 'E' },
    { foreign: 'schiena', native: 'back', rank: 624, category: 'noun', band: 'E' },
    { foreign: 'nonostante', native: 'despite', rank: 625, category: 'adjective', band: 'E' },
    { foreign: 'campagna', native: 'countryside', rank: 626, category: 'noun', band: 'E' },
    { foreign: 'seguire', native: 'to follow', rank: 627, category: 'verb', band: 'E' },
    { foreign: 'stanco', native: 'tired', rank: 628, category: 'noun', band: 'E' },
    { foreign: 'vento', native: 'wind', rank: 629, category: 'noun', band: 'E' },
    { foreign: 'immaginare', native: 'to imagine', rank: 630, category: 'verb', band: 'E' },
    { foreign: 'dimenticare', native: 'to forget', rank: 631, category: 'verb', band: 'E' },
    { foreign: 'buonasera', native: 'good evening', rank: 632, category: 'adjective', band: 'E' },
    { foreign: 'mercato', native: 'market', rank: 633, category: 'noun', band: 'E' },
    { foreign: 'valore', native: 'value', rank: 634, category: 'noun', band: 'E' },
    { foreign: 'salire', native: 'to go up', rank: 635, category: 'verb', band: 'E' },
    { foreign: 'riuscire', native: 'to succeed', rank: 636, category: 'verb', band: 'E' },
    { foreign: 'spiegare', native: 'to explain', rank: 637, category: 'verb', band: 'E' },
    { foreign: 'benvenuti', native: 'welcome (pl.)', rank: 638, category: 'noun', band: 'E' },
    { foreign: 'ponte', native: 'bridge', rank: 639, category: 'noun', band: 'E' },
    { foreign: 'malato', native: 'sick', rank: 640, category: 'noun', band: 'E' },
    { foreign: 'sedia', native: 'chair', rank: 641, category: 'noun', band: 'E' },
    { foreign: 'succedere', native: 'to happen', rank: 642, category: 'verb', band: 'E' },
    { foreign: 'cadere', native: 'to fall', rank: 643, category: 'verb', band: 'E' },
    { foreign: 'milione', native: 'million', rank: 644, category: 'number', band: 'E' },
    { foreign: 'camminare', native: 'to walk', rank: 645, category: 'verb', band: 'E' },
    { foreign: 'dovere', native: 'to have to / must', rank: 646, category: 'verb', band: 'E' },
    { foreign: 'parco', native: 'park', rank: 647, category: 'noun', band: 'E' },
    { foreign: 'palazzo', native: 'palace / building', rank: 648, category: 'noun', band: 'E' },
    { foreign: 'privato', native: 'private', rank: 649, category: 'adjective', band: 'E' },
    { foreign: 'cento', native: 'hundred', rank: 650, category: 'number', band: 'E' },
    { foreign: 'fidanzata', native: 'fiancée / girlfriend', rank: 651, category: 'noun', band: 'E' },
    { foreign: 'nazionale', native: 'national', rank: 652, category: 'adjective', band: 'E' },
    { foreign: 'cinema', native: 'cinema', rank: 653, category: 'noun', band: 'E' },
    { foreign: 'stella', native: 'star', rank: 654, category: 'noun', band: 'E' },
    { foreign: 'internet', native: 'internet', rank: 655, category: 'noun', band: 'E' },
    { foreign: 'occupato', native: 'busy', rank: 656, category: 'adjective', band: 'E' },
    { foreign: 'compagno', native: 'companion', rank: 657, category: 'noun', band: 'E' },
    { foreign: 'scendere', native: 'to go down', rank: 658, category: 'verb', band: 'E' },
    { foreign: 'autobus', native: 'bus', rank: 659, category: 'noun', band: 'E' },
    { foreign: 'vuoto', native: 'empty', rank: 660, category: 'adjective', band: 'E' },
    { foreign: 'animale', native: 'animal', rank: 661, category: 'noun', band: 'E' },
    { foreign: 'azienda', native: 'company', rank: 662, category: 'noun', band: 'E' },
    { foreign: 'sabato', native: 'Saturday', rank: 663, category: 'noun', band: 'E' },
    { foreign: 'pollo', native: 'chicken', rank: 664, category: 'noun', band: 'E' },
    { foreign: 'spiaggia', native: 'beach', rank: 665, category: 'noun', band: 'E' },
    { foreign: 'rosa', native: 'pink', rank: 666, category: 'adjective', band: 'E' },
    { foreign: 'innamorato', native: 'in love', rank: 667, category: 'noun', band: 'E' },
    { foreign: 'orologio', native: 'watch / clock', rank: 668, category: 'noun', band: 'E' },
    { foreign: 'erba', native: 'grass', rank: 669, category: 'noun', band: 'E' },
    { foreign: 'universo', native: 'universe', rank: 670, category: 'noun', band: 'E' },
    { foreign: 'esame', native: 'exam', rank: 671, category: 'noun', band: 'E' },
    { foreign: 'quartiere', native: 'neighborhood', rank: 672, category: 'noun', band: 'E' },
    { foreign: 'partito', native: 'party', rank: 673, category: 'verb', band: 'E' },
    { foreign: 'cappello', native: 'hat', rank: 674, category: 'noun', band: 'E' },
    { foreign: 'giardino', native: 'garden', rank: 675, category: 'noun', band: 'E' },
    { foreign: 'rabbia', native: 'anger', rank: 676, category: 'noun', band: 'E' },
    { foreign: 'collega', native: 'colleague', rank: 677, category: 'noun', band: 'E' },
    { foreign: 'giornale', native: 'newspaper', rank: 678, category: 'noun', band: 'E' },
    { foreign: 'insegnante', native: 'teacher', rank: 679, category: 'adjective', band: 'E' },
    { foreign: 'spaventato', native: 'scared', rank: 680, category: 'noun', band: 'E' },
    { foreign: 'libertà', native: 'freedom', rank: 681, category: 'noun', band: 'E' },
    { foreign: 'preparato', native: 'prepared', rank: 682, category: 'noun', band: 'E' },
    { foreign: 'gratis', native: 'free', rank: 683, category: 'adjective', band: 'E' },
    { foreign: 'dito', native: 'finger', rank: 684, category: 'noun', band: 'E' },
    { foreign: 'cantare', native: 'to sing', rank: 685, category: 'verb', band: 'E' },
    { foreign: 'distruggere', native: 'to destroy', rank: 686, category: 'verb', band: 'E' },
    { foreign: 'funzionare', native: 'to work', rank: 687, category: 'verb', band: 'E' },
    { foreign: 'zero', native: 'zero', rank: 688, category: 'number', band: 'E' },
    { foreign: 'ministro', native: 'minister', rank: 689, category: 'noun', band: 'E' },
    { foreign: 'venti', native: 'twenty', rank: 690, category: 'number', band: 'E' },
    { foreign: 'domenica', native: 'Sunday', rank: 691, category: 'noun', band: 'E' },
    { foreign: 'dritto', native: 'straight', rank: 692, category: 'noun', band: 'E' },
    { foreign: 'medicina', native: 'medicine', rank: 693, category: 'noun', band: 'E' },
    { foreign: 'est', native: 'east', rank: 694, category: 'noun', band: 'E' },
    { foreign: 'violenza', native: 'violence', rank: 695, category: 'noun', band: 'E' },
    { foreign: 'crescere', native: 'to grow', rank: 696, category: 'verb', band: 'E' },
    { foreign: 'suonare', native: 'to play (instrument)', rank: 697, category: 'verb', band: 'E' },
    { foreign: 'cugino', native: 'cousin', rank: 698, category: 'noun', band: 'E' },
    { foreign: 'giacca', native: 'jacket', rank: 699, category: 'noun', band: 'E' },
    { foreign: 'opinione', native: 'opinion', rank: 700, category: 'noun', band: 'E' },
    { foreign: 'tè', native: 'tea', rank: 701, category: 'noun', band: 'F' },
    { foreign: 'gas', native: 'gas', rank: 702, category: 'noun', band: 'F' },
    { foreign: 'moto', native: 'motorcycle', rank: 703, category: 'noun', band: 'F' },
    { foreign: 'pulito', native: 'clean', rank: 704, category: 'adjective', band: 'F' },
    { foreign: 'pane', native: 'bread', rank: 705, category: 'noun', band: 'F' },
    { foreign: 'pesante', native: 'heavy', rank: 706, category: 'adjective', band: 'F' },
    { foreign: 'aeroporto', native: 'airport', rank: 707, category: 'noun', band: 'F' },
    { foreign: 'uova', native: 'eggs', rank: 708, category: 'noun', band: 'F' },
    { foreign: 'preparare', native: 'to prepare', rank: 709, category: 'verb', band: 'F' },
    { foreign: 'costruire', native: 'to build', rank: 710, category: 'verb', band: 'F' },
    { foreign: 'nervoso', native: 'nervous', rank: 711, category: 'adjective', band: 'F' },
    { foreign: 'albergo', native: 'hotel', rank: 712, category: 'noun', band: 'F' },
    { foreign: 'falso', native: 'false', rank: 713, category: 'adjective', band: 'F' },
    { foreign: 'gioia', native: 'joy', rank: 714, category: 'noun', band: 'F' },
    { foreign: 'nascondere', native: 'to hide', rank: 715, category: 'verb', band: 'F' },
    { foreign: 'ambulanza', native: 'ambulance', rank: 716, category: 'noun', band: 'F' },
    { foreign: 'volare', native: 'to fly', rank: 717, category: 'verb', band: 'F' },
    { foreign: 'ospite', native: 'guest', rank: 718, category: 'noun', band: 'F' },
    { foreign: 'stomaco', native: 'stomach', rank: 719, category: 'noun', band: 'F' },
    { foreign: 'cinese', native: 'Chinese', rank: 720, category: 'noun', band: 'F' },
    { foreign: 'studiare', native: 'to study', rank: 721, category: 'verb', band: 'F' },
    { foreign: 'divano', native: 'sofa', rank: 722, category: 'noun', band: 'F' },
    { foreign: 'risultato', native: 'result', rank: 723, category: 'noun', band: 'F' },
    { foreign: 'complicato', native: 'complicated', rank: 724, category: 'noun', band: 'F' },
    { foreign: 'pavimento', native: 'floor', rank: 725, category: 'noun', band: 'F' },
    { foreign: 'contare', native: 'to count', rank: 726, category: 'verb', band: 'F' },
    { foreign: 'posta', native: 'mail', rank: 727, category: 'noun', band: 'F' },
    { foreign: 'tuttavia', native: 'nevertheless', rank: 728, category: 'connector', band: 'F' },
    { foreign: 'lago', native: 'lake', rank: 729, category: 'noun', band: 'F' },
    { foreign: 'teatro', native: 'theater', rank: 730, category: 'noun', band: 'F' },
    { foreign: 'sorpreso', native: 'surprised', rank: 731, category: 'noun', band: 'F' },
    { foreign: 'pioggia', native: 'rain', rank: 732, category: 'noun', band: 'F' },
    { foreign: 'occhiali', native: 'glasses', rank: 733, category: 'noun', band: 'F' },
    { foreign: 'pietra', native: 'stone', rank: 734, category: 'noun', band: 'F' },
    { foreign: 'uccello', native: 'bird', rank: 735, category: 'noun', band: 'F' },
    { foreign: 'maiale', native: 'pig', rank: 736, category: 'noun', band: 'F' },
    { foreign: 'camicia', native: 'shirt', rank: 737, category: 'noun', band: 'F' },
    { foreign: 'montagna', native: 'mountain', rank: 738, category: 'noun', band: 'F' },
    { foreign: 'formaggio', native: 'cheese', rank: 739, category: 'noun', band: 'F' },
    { foreign: 'spazzatura', native: 'trash', rank: 740, category: 'noun', band: 'F' },
    { foreign: 'permettere', native: 'to allow', rank: 741, category: 'verb', band: 'F' },
    { foreign: 'ombra', native: 'shade', rank: 742, category: 'noun', band: 'F' },
    { foreign: 'pilota', native: 'pilot', rank: 743, category: 'noun', band: 'F' },
    { foreign: 'petto', native: 'chest', rank: 744, category: 'noun', band: 'F' },
    { foreign: 'neve', native: 'snow', rank: 745, category: 'noun', band: 'F' },
    { foreign: 'gelato', native: 'ice cream', rank: 746, category: 'noun', band: 'F' },
    { foreign: 'vergogna', native: 'shame', rank: 747, category: 'noun', band: 'F' },
    { foreign: 'castello', native: 'castle', rank: 748, category: 'noun', band: 'F' },
    { foreign: 'togliere', native: 'to remove', rank: 749, category: 'verb', band: 'F' },
    { foreign: 'sporco', native: 'dirty', rank: 750, category: 'adjective', band: 'F' },
    { foreign: 'volere', native: 'to want', rank: 751, category: 'verb', band: 'F' },
    { foreign: 'nazione', native: 'nation', rank: 752, category: 'noun', band: 'F' },
    { foreign: 'argomento', native: 'topic / argument', rank: 753, category: 'noun', band: 'F' },
    { foreign: 'auguri', native: 'best wishes', rank: 754, category: 'noun', band: 'F' },
    { foreign: 'uguale', native: 'equal', rank: 755, category: 'noun', band: 'F' },
    { foreign: 'ginocchio', native: 'knee', rank: 756, category: 'noun', band: 'F' },
    { foreign: 'università', native: 'university', rank: 757, category: 'noun', band: 'F' },
    { foreign: 'bosco', native: 'forest', rank: 758, category: 'noun', band: 'F' },
    { foreign: 'sale', native: 'salt', rank: 759, category: 'noun', band: 'F' },
    { foreign: 'ovest', native: 'west', rank: 760, category: 'noun', band: 'F' },
    { foreign: 'mezzanotte', native: 'midnight', rank: 761, category: 'noun', band: 'F' },
    { foreign: 'contanti', native: 'cash', rank: 762, category: 'noun', band: 'F' },
    { foreign: 'secolo', native: 'century', rank: 763, category: 'noun', band: 'F' },
    { foreign: 'corridoio', native: 'aisle', rank: 764, category: 'noun', band: 'F' },
    { foreign: 'concerto', native: 'concert', rank: 765, category: 'noun', band: 'F' },
    { foreign: 'clinica', native: 'clinic', rank: 766, category: 'noun', band: 'F' },
    { foreign: 'tecnologia', native: 'technology', rank: 767, category: 'noun', band: 'F' },
    { foreign: 'voto', native: 'vote', rank: 768, category: 'noun', band: 'F' },
    { foreign: 'mostrare', native: 'to show', rank: 769, category: 'verb', band: 'F' },
    { foreign: 'scala', native: 'stairs / scale', rank: 770, category: 'noun', band: 'F' },
    { foreign: 'scienza', native: 'science', rank: 771, category: 'noun', band: 'F' },
    { foreign: 'rompere', native: 'to break', rank: 772, category: 'verb', band: 'F' },
    { foreign: 'autista', native: 'driver', rank: 773, category: 'noun', band: 'F' },
    { foreign: 'mappa', native: 'map', rank: 774, category: 'noun', band: 'F' },
    { foreign: 'fabbrica', native: 'factory', rank: 775, category: 'noun', band: 'F' },
    { foreign: 'responsabilità', native: 'responsibility', rank: 776, category: 'noun', band: 'F' },
    { foreign: 'amare', native: 'to love', rank: 777, category: 'verb', band: 'F' },
    { foreign: 'pulire', native: 'to clean', rank: 778, category: 'verb', band: 'F' },
    { foreign: 'tempesta', native: 'storm', rank: 779, category: 'noun', band: 'F' },
    { foreign: 'ascensore', native: 'elevator', rank: 780, category: 'noun', band: 'F' },
    { foreign: 'spalla', native: 'shoulder', rank: 781, category: 'noun', band: 'F' },
    { foreign: 'ricevere', native: 'to receive', rank: 782, category: 'verb', band: 'F' },
    { foreign: 'zucchero', native: 'sugar', rank: 783, category: 'noun', band: 'F' },
    { foreign: 'raccontare', native: 'to tell', rank: 784, category: 'verb', band: 'F' },
    { foreign: 'ambiente', native: 'environment', rank: 785, category: 'adjective', band: 'F' },
    { foreign: 'garage', native: 'garage', rank: 786, category: 'noun', band: 'F' },
    { foreign: 'confine', native: 'border', rank: 787, category: 'noun', band: 'F' },
    { foreign: 'televisione', native: 'television', rank: 788, category: 'noun', band: 'F' },
    { foreign: 'partenza', native: 'departure', rank: 789, category: 'noun', band: 'F' },
    { foreign: 'organizzare', native: 'to organize', rank: 790, category: 'verb', band: 'F' },
    { foreign: 'influenza', native: 'flu', rank: 791, category: 'noun', band: 'F' },
    { foreign: 'tedesco', native: 'German', rank: 792, category: 'noun', band: 'F' },
    { foreign: 'dodici', native: 'twelve', rank: 793, category: 'number', band: 'F' },
    { foreign: 'palestra', native: 'gym', rank: 794, category: 'noun', band: 'F' },
    { foreign: 'oceano', native: 'ocean', rank: 795, category: 'noun', band: 'F' },
    { foreign: 'tagliare', native: 'to cut', rank: 796, category: 'verb', band: 'F' },
    { foreign: 'servire', native: 'to serve', rank: 797, category: 'verb', band: 'F' },
    { foreign: 'cioccolato', native: 'chocolate', rank: 798, category: 'noun', band: 'F' },
    { foreign: 'urlare', native: 'to shout', rank: 799, category: 'verb', band: 'F' },
    { foreign: 'biblioteca', native: 'library', rank: 800, category: 'noun', band: 'F' },
    { foreign: 'robot', native: 'robot', rank: 801, category: 'noun', band: 'F' },
    { foreign: 'inverno', native: 'winter', rank: 802, category: 'noun', band: 'F' },
    { foreign: 'maglietta', native: 't-shirt', rank: 803, category: 'noun', band: 'F' },
    { foreign: 'orgoglioso', native: 'proud', rank: 804, category: 'adjective', band: 'F' },
    { foreign: 'frase', native: 'sentence', rank: 805, category: 'noun', band: 'F' },
    { foreign: 'guadagnare', native: 'to earn', rank: 806, category: 'verb', band: 'F' },
    { foreign: 'grasso', native: 'fat', rank: 807, category: 'noun', band: 'F' },
    { foreign: 'gradi', native: 'degrees', rank: 808, category: 'noun', band: 'F' },
    { foreign: 'mondiale', native: 'worldwide', rank: 809, category: 'noun', band: 'F' },
    { foreign: 'riso', native: 'rice', rank: 810, category: 'noun', band: 'F' },
    { foreign: 'russo', native: 'Russian', rank: 811, category: 'noun', band: 'F' },
    { foreign: 'legno', native: 'wood', rank: 812, category: 'noun', band: 'F' },
    { foreign: 'studente', native: 'student', rank: 813, category: 'adjective', band: 'F' },
    { foreign: 'stretto', native: 'narrow', rank: 814, category: 'noun', band: 'F' },
    { foreign: 'fermata', native: 'stop', rank: 815, category: 'noun', band: 'F' },
    { foreign: 'orso', native: 'bear', rank: 816, category: 'noun', band: 'F' },
    { foreign: 'deserto', native: 'desert', rank: 817, category: 'noun', band: 'F' },
    { foreign: 'metro', native: 'subway', rank: 818, category: 'noun', band: 'F' },
    { foreign: 'intanto', native: 'meanwhile', rank: 819, category: 'noun', band: 'F' },
    { foreign: 'benvenuta', native: 'welcome (fem.)', rank: 820, category: 'noun', band: 'F' },
    { foreign: 'febbre', native: 'fever', rank: 821, category: 'noun', band: 'F' },
    { foreign: 'olio', native: 'oil', rank: 822, category: 'noun', band: 'F' },
    { foreign: 'vetro', native: 'glass', rank: 823, category: 'noun', band: 'F' },
    { foreign: 'penna', native: 'pen', rank: 824, category: 'noun', band: 'F' },
    { foreign: 'cameriera', native: 'waitress', rank: 825, category: 'noun', band: 'F' },
    { foreign: 'condizione', native: 'condition', rank: 826, category: 'noun', band: 'F' },
    { foreign: 'valigia', native: 'suitcase', rank: 827, category: 'noun', band: 'F' },
    { foreign: 'improvvisamente', native: 'suddenly', rank: 828, category: 'adjective', band: 'F' },
    { foreign: 'orario', native: 'schedule', rank: 829, category: 'noun', band: 'F' },
    { foreign: 'straordinario', native: 'extraordinary', rank: 830, category: 'noun', band: 'F' },
    { foreign: 'noioso', native: 'boring', rank: 831, category: 'adjective', band: 'F' },
    { foreign: 'folla', native: 'crowd', rank: 832, category: 'noun', band: 'F' },
    { foreign: 'cucinare', native: 'to cook', rank: 833, category: 'verb', band: 'F' },
    { foreign: 'orecchio', native: 'ear', rank: 834, category: 'noun', band: 'F' },
    { foreign: 'arrabbiare', native: 'to anger', rank: 835, category: 'verb', band: 'F' },
    { foreign: 'simpatico', native: 'nice', rank: 836, category: 'noun', band: 'F' },
    { foreign: 'delizioso', native: 'delicious', rank: 837, category: 'adjective', band: 'F' },
    { foreign: 'costo', native: 'cost', rank: 838, category: 'noun', band: 'F' },
    { foreign: 'primavera', native: 'spring', rank: 839, category: 'noun', band: 'F' },
    { foreign: 'geloso', native: 'jealous', rank: 840, category: 'adjective', band: 'F' },
    { foreign: 'accadere', native: 'to happen', rank: 841, category: 'verb', band: 'F' },
    { foreign: 'corto', native: 'short', rank: 842, category: 'adjective', band: 'F' },
    { foreign: 'rivista', native: 'magazine', rank: 843, category: 'noun', band: 'F' },
    { foreign: 'museo', native: 'museum', rank: 844, category: 'noun', band: 'F' },
    { foreign: 'zuppa', native: 'soup', rank: 845, category: 'noun', band: 'F' },
    { foreign: 'orgoglio', native: 'pride', rank: 846, category: 'noun', band: 'F' },
    { foreign: 'succo', native: 'juice', rank: 847, category: 'noun', band: 'F' },
    { foreign: 'offrire', native: 'to offer', rank: 848, category: 'verb', band: 'F' },
    { foreign: 'aggiungere', native: 'to add', rank: 849, category: 'verb', band: 'F' },
    { foreign: 'quindici', native: 'fifteen', rank: 850, category: 'number', band: 'F' },
    { foreign: 'vacanze', native: 'vacation', rank: 851, category: 'noun', band: 'G' },
    { foreign: 'largo', native: 'wide', rank: 852, category: 'noun', band: 'G' },
    { foreign: 'adulto', native: 'adult', rank: 853, category: 'noun', band: 'G' },
    { foreign: 'serpente', native: 'snake', rank: 854, category: 'adjective', band: 'G' },
    { foreign: 'sabbia', native: 'sand', rank: 855, category: 'noun', band: 'G' },
    { foreign: 'osso', native: 'bone', rank: 856, category: 'noun', band: 'G' },
    { foreign: 'giapponese', native: 'Japanese', rank: 857, category: 'noun', band: 'G' },
    { foreign: 'frutta', native: 'fruit', rank: 858, category: 'noun', band: 'G' },
    { foreign: 'spagnolo', native: 'Spanish', rank: 859, category: 'noun', band: 'G' },
    { foreign: 'sano', native: 'healthy', rank: 860, category: 'noun', band: 'G' },
    { foreign: 'viaggiare', native: 'to travel', rank: 861, category: 'verb', band: 'G' },
    { foreign: 'burro', native: 'butter', rank: 862, category: 'noun', band: 'G' },
    { foreign: 'venerdì', native: 'Friday', rank: 863, category: 'noun', band: 'G' },
    { foreign: 'italiano', native: 'Italian', rank: 864, category: 'noun', band: 'G' },
    { foreign: 'fresco', native: 'fresh / cool', rank: 865, category: 'noun', band: 'G' },
    { foreign: 'plastica', native: 'plastic', rank: 866, category: 'noun', band: 'G' },
    { foreign: 'temperatura', native: 'temperature', rank: 867, category: 'noun', band: 'G' },
    { foreign: 'scimmia', native: 'monkey', rank: 868, category: 'noun', band: 'G' },
    { foreign: 'topo', native: 'mouse', rank: 869, category: 'noun', band: 'G' },
    { foreign: 'racconto', native: 'tale', rank: 870, category: 'noun', band: 'G' },
    { foreign: 'attaccare', native: 'to attack', rank: 871, category: 'verb', band: 'G' },
    { foreign: 'tempio', native: 'temple', rank: 872, category: 'noun', band: 'G' },
    { foreign: 'trenta', native: 'thirty', rank: 873, category: 'number', band: 'G' },
    { foreign: 'fiore', native: 'flower', rank: 874, category: 'noun', band: 'G' },
    { foreign: 'dollaro', native: 'dollar', rank: 875, category: 'noun', band: 'G' },
    { foreign: 'anniversario', native: 'anniversary', rank: 876, category: 'noun', band: 'G' },
    { foreign: 'nuotare', native: 'to swim', rank: 877, category: 'verb', band: 'G' },
    { foreign: 'scoperta', native: 'discovery', rank: 878, category: 'noun', band: 'G' },
    { foreign: 'cultura', native: 'culture', rank: 879, category: 'noun', band: 'G' },
    { foreign: 'tradizione', native: 'tradition', rank: 880, category: 'noun', band: 'G' },
    { foreign: 'cameriere', native: 'waiter', rank: 881, category: 'noun', band: 'G' },
    { foreign: 'settembre', native: 'September', rank: 882, category: 'noun', band: 'G' },
    { foreign: 'cappotto', native: 'coat', rank: 883, category: 'noun', band: 'G' },
    { foreign: 'insegnare', native: 'to teach', rank: 884, category: 'verb', band: 'G' },
    { foreign: 'sperare', native: 'to hope', rank: 885, category: 'verb', band: 'G' },
    { foreign: 'leone', native: 'lion', rank: 886, category: 'noun', band: 'G' },
    { foreign: 'insalata', native: 'salad', rank: 887, category: 'noun', band: 'G' },
    { foreign: 'uovo', native: 'egg', rank: 888, category: 'noun', band: 'G' },
    { foreign: 'accento', native: 'accent', rank: 889, category: 'noun', band: 'G' },
    { foreign: 'politico', native: 'politician', rank: 890, category: 'noun', band: 'G' },
    { foreign: 'cugina', native: 'cousin (fem.)', rank: 891, category: 'noun', band: 'G' },
    { foreign: 'pregare', native: 'to pray / beg', rank: 892, category: 'verb', band: 'G' },
    { foreign: 'difendere', native: 'to defend', rank: 893, category: 'verb', band: 'G' },
    { foreign: 'cantina', native: 'basement', rank: 894, category: 'noun', band: 'G' },
    { foreign: 'euro', native: 'euro', rank: 895, category: 'noun', band: 'G' },
    { foreign: 'educazione', native: 'education', rank: 896, category: 'noun', band: 'G' },
    { foreign: 'collana', native: 'necklace', rank: 897, category: 'noun', band: 'G' },
    { foreign: 'giallo', native: 'yellow', rank: 898, category: 'noun', band: 'G' },
    { foreign: 'internazionale', native: 'international', rank: 899, category: 'noun', band: 'G' },
    { foreign: 'piazza', native: 'square', rank: 900, category: 'noun', band: 'G' },
    { foreign: 'comunicare', native: 'to communicate', rank: 901, category: 'verb', band: 'G' },
    { foreign: 'ordinare', native: 'to tidy / order', rank: 902, category: 'verb', band: 'G' },
    { foreign: 'mezzogiorno', native: 'noon', rank: 903, category: 'noun', band: 'G' },
    { foreign: 'religione', native: 'religion', rank: 904, category: 'noun', band: 'G' },
    { foreign: 'passaporto', native: 'passport', rank: 905, category: 'noun', band: 'G' },
    { foreign: 'infermiere', native: 'nurse', rank: 906, category: 'noun', band: 'G' },
    { foreign: 'undici', native: 'eleven', rank: 907, category: 'number', band: 'G' },
    { foreign: 'sedetevi', native: 'sit down (pl.)', rank: 908, category: 'noun', band: 'G' },
    { foreign: 'economia', native: 'economy', rank: 909, category: 'noun', band: 'G' },
    { foreign: 'metallo', native: 'metal', rank: 910, category: 'noun', band: 'G' },
    { foreign: 'capitale', native: 'capital', rank: 911, category: 'noun', band: 'G' },
    { foreign: 'luglio', native: 'July', rank: 912, category: 'noun', band: 'G' },
    { foreign: 'lunedì', native: 'Monday', rank: 913, category: 'noun', band: 'G' },
    { foreign: 'stadio', native: 'stadium', rank: 914, category: 'noun', band: 'G' },
    { foreign: 'pasta', native: 'pasta', rank: 915, category: 'noun', band: 'G' },
    { foreign: 'collina', native: 'hill', rank: 916, category: 'noun', band: 'G' },
    { foreign: 'quaranta', native: 'forty', rank: 917, category: 'number', band: 'G' },
    { foreign: 'cinquanta', native: 'fifty', rank: 918, category: 'number', band: 'G' },
    { foreign: 'arrivederla', native: 'goodbye (formal)', rank: 919, category: 'noun', band: 'G' },
    { foreign: 'per favore', native: 'please', rank: 920, category: 'phrase', band: 'phrase' },
    { foreign: 'per piacere', native: 'please', rank: 921, category: 'phrase', band: 'phrase' },
    { foreign: 'come sta', native: 'how are you (formal)', rank: 922, category: 'phrase', band: 'phrase' },
    { foreign: 'come stai', native: 'how are you', rank: 923, category: 'phrase', band: 'phrase' },
    { foreign: 'tutto bene', native: 'all good', rank: 924, category: 'phrase', band: 'phrase' },
    { foreign: 'va bene', native: 'all right', rank: 925, category: 'phrase', band: 'phrase' },
    { foreign: 'parla inglese', native: 'do you speak English', rank: 926, category: 'phrase', band: 'phrase' },
    { foreign: 'come si dice', native: 'how do you say', rank: 927, category: 'phrase', band: 'phrase' },
    { foreign: 'che significa', native: 'what does it mean', rank: 928, category: 'phrase', band: 'phrase' },
    { foreign: 'dove è', native: 'where is', rank: 929, category: 'phrase', band: 'phrase' },
    { foreign: 'quanto costa', native: 'how much does it cost', rank: 930, category: 'phrase', band: 'phrase' },
    { foreign: 'il conto', native: 'the bill', rank: 931, category: 'phrase', band: 'phrase' },
    { foreign: 'mi piacerebbe', native: 'I would like', rank: 932, category: 'phrase', band: 'phrase' },
    { foreign: 'ho bisogno', native: 'I need', rank: 933, category: 'phrase', band: 'phrase' },
    { foreign: 'niente di grave', native: 'nothing serious', rank: 934, category: 'phrase', band: 'phrase' },
    { foreign: 'che peccato', native: 'what a shame', rank: 935, category: 'phrase', band: 'phrase' },
    { foreign: 'che bello', native: 'how nice', rank: 936, category: 'phrase', band: 'phrase' },
    { foreign: 'sul serio', native: 'seriously', rank: 937, category: 'phrase', band: 'phrase' },
    { foreign: 'bevanda', native: 'drink', rank: 938, category: 'noun', band: 'G' },
    { foreign: 'acqua minerale', native: 'mineral water', rank: 939, category: 'phrase', band: 'phrase' },
    { foreign: 'manzo', native: 'beef', rank: 940, category: 'noun', band: 'G' },
    { foreign: 'mi chiamo', native: 'my name is', rank: 941, category: 'phrase', band: 'phrase' },
    { foreign: 'a presto', native: 'see you soon', rank: 942, category: 'phrase', band: 'phrase' },
    { foreign: 'a domani', native: 'see you tomorrow', rank: 943, category: 'phrase', band: 'phrase' },
    { foreign: 'a dopo', native: 'see you later', rank: 944, category: 'phrase', band: 'phrase' },
    { foreign: 'ci vediamo', native: 'see you', rank: 945, category: 'phrase', band: 'phrase' },
    { foreign: 'buona giornata', native: 'have a nice day', rank: 946, category: 'phrase', band: 'phrase' },
    { foreign: 'in bocca al lupo', native: 'good luck', rank: 947, category: 'phrase', band: 'phrase' },
    { foreign: 'buon appetito', native: 'enjoy your meal', rank: 948, category: 'phrase', band: 'phrase' },
    { foreign: 'alla salute', native: 'cheers', rank: 949, category: 'phrase', band: 'phrase' },
    { foreign: 'tanti auguri', native: 'best wishes / happy birthday', rank: 950, category: 'phrase', band: 'phrase' },
    { foreign: 'piacere di conoscerti', native: 'nice to meet you', rank: 951, category: 'phrase', band: 'phrase' },
    { foreign: 'ho fame', native: 'I am hungry', rank: 952, category: 'phrase', band: 'phrase' },
    { foreign: 'ho sete', native: 'I am thirsty', rank: 953, category: 'phrase', band: 'phrase' },
    { foreign: 'ho sonno', native: 'I am sleepy', rank: 954, category: 'phrase', band: 'phrase' },
    { foreign: 'ho freddo', native: 'I am cold', rank: 955, category: 'phrase', band: 'phrase' },
    { foreign: 'ho caldo', native: 'I am hot', rank: 956, category: 'phrase', band: 'phrase' },
    { foreign: 'ho paura', native: 'I am afraid', rank: 957, category: 'phrase', band: 'phrase' },
    { foreign: 'ho fretta', native: 'I am in a hurry', rank: 958, category: 'phrase', band: 'phrase' },
    { foreign: 'più piano', native: 'more slowly', rank: 959, category: 'phrase', band: 'phrase' },
    { foreign: 'può ripetere', native: 'can you repeat', rank: 960, category: 'phrase', band: 'phrase' },
    { foreign: 'dove sono i bagni', native: 'where is the bathroom', rank: 961, category: 'phrase', band: 'phrase' },
    { foreign: 'il conto per favore', native: 'the bill, please', rank: 962, category: 'phrase', band: 'phrase' },
    { foreign: 'sono perso', native: 'I am lost', rank: 963, category: 'phrase', band: 'phrase' },
    { foreign: 'può aiutarmi', native: 'can you help me', rank: 964, category: 'phrase', band: 'phrase' },
    { foreign: 'a sinistra', native: 'to the left', rank: 965, category: 'phrase', band: 'phrase' },
    { foreign: 'a destra', native: 'to the right', rank: 966, category: 'phrase', band: 'phrase' },
    { foreign: 'sempre dritto', native: 'straight ahead', rank: 967, category: 'phrase', band: 'phrase' },
    { foreign: 'qui vicino', native: 'near here', rank: 968, category: 'phrase', band: 'phrase' },
    { foreign: 'lontano da qui', native: 'far from here', rank: 969, category: 'phrase', band: 'phrase' },
    { foreign: 'verdura', native: 'vegetable', rank: 970, category: 'noun', band: 'G' },
    { foreign: 'mela', native: 'apple', rank: 971, category: 'noun', band: 'G' },
    { foreign: 'arancia', native: 'orange', rank: 972, category: 'noun', band: 'G' },
    { foreign: 'banana', native: 'banana', rank: 973, category: 'noun', band: 'G' },
    { foreign: 'pepe', native: 'pepper', rank: 974, category: 'noun', band: 'G' },
    { foreign: 'antipasto', native: 'appetizer', rank: 975, category: 'noun', band: 'G' },
    { foreign: 'contorno', native: 'side dish', rank: 976, category: 'noun', band: 'G' },
    { foreign: 'menu', native: 'menu', rank: 977, category: 'noun', band: 'G' },
    { foreign: 'mancia', native: 'tip', rank: 978, category: 'noun', band: 'G' },
    { foreign: 'economico', native: 'inexpensive', rank: 979, category: 'noun', band: 'G' },
    { foreign: 'piccante', native: 'spicy', rank: 980, category: 'adjective', band: 'G' },
    { foreign: 'salato', native: 'salty', rank: 981, category: 'noun', band: 'G' },
    { foreign: 'amaro', native: 'bitter', rank: 982, category: 'noun', band: 'G' },
    { foreign: 'cotto', native: 'cooked', rank: 983, category: 'noun', band: 'G' },
    { foreign: 'crudo', native: 'raw', rank: 984, category: 'noun', band: 'G' },
    { foreign: 'arrosto', native: 'roast', rank: 985, category: 'noun', band: 'G' },
    { foreign: 'fritto', native: 'fried', rank: 986, category: 'noun', band: 'G' },
    { foreign: 'al forno', native: 'baked', rank: 987, category: 'phrase', band: 'phrase' },
    { foreign: 'vegetariano', native: 'vegetarian', rank: 988, category: 'noun', band: 'G' },
    { foreign: 'vegano', native: 'vegan', rank: 989, category: 'noun', band: 'G' },
    { foreign: 'it-extra-990', native: 'extra term 990', rank: 990, category: 'noun', band: 'G' },
    { foreign: 'it-extra-991', native: 'extra term 991', rank: 991, category: 'noun', band: 'G' },
    { foreign: 'it-extra-992', native: 'extra term 992', rank: 992, category: 'noun', band: 'G' },
    { foreign: 'it-extra-993', native: 'extra term 993', rank: 993, category: 'noun', band: 'G' },
    { foreign: 'it-extra-994', native: 'extra term 994', rank: 994, category: 'noun', band: 'G' },
    { foreign: 'it-extra-995', native: 'extra term 995', rank: 995, category: 'noun', band: 'G' },
    { foreign: 'it-extra-996', native: 'extra term 996', rank: 996, category: 'noun', band: 'G' },
    { foreign: 'it-extra-997', native: 'extra term 997', rank: 997, category: 'noun', band: 'G' },
    { foreign: 'it-extra-998', native: 'extra term 998', rank: 998, category: 'noun', band: 'G' },
    { foreign: 'it-extra-999', native: 'extra term 999', rank: 999, category: 'noun', band: 'G' },
    { foreign: 'it-extra-1000', native: 'extra term 1000', rank: 1000, category: 'noun', band: 'G' },
  ];
  window.LANGUAGE_BASICS = window.LANGUAGE_BASICS || {};
  window.LANGUAGE_BASICS[id] = {
    "sections": [
      {
        "title": "Special sounds",
        "items": [
          {
            "glyph": "gli",
            "speak": "gli",
            "glyphClass": "basics-glyph--pair",
            "approxHtml": "like <strong>lli</strong> in <em>million</em>",
            "examples": [
              {
                "speak": "famiglia",
                "text": "famiglia",
                "gloss": "family"
              },
              {
                "speak": "figlio",
                "text": "figlio",
                "gloss": "son"
              }
            ]
          },
          {
            "glyph": "gn",
            "speak": "gn",
            "glyphClass": "basics-glyph--pair",
            "approxHtml": "<strong>ny</strong> in <em>canyon</em>",
            "examples": [
              {
                "speak": "lasagna",
                "text": "lasagna",
                "gloss": "lasagna"
              },
              {
                "speak": "ogni",
                "text": "ogni",
                "gloss": "every"
              }
            ]
          },
          {
            "glyph": "à è é ì ò ù",
            "speak": "città",
            "glyphClass": "basics-glyph--pair",
            "approxHtml": "accents mark stress · <em>è</em> open, <em>é</em> closed",
            "examples": [
              {
                "speak": "città",
                "text": "città",
                "gloss": "city"
              },
              {
                "speak": "perché",
                "text": "perché",
                "gloss": "why / because"
              },
              {
                "speak": "è",
                "text": "è",
                "gloss": "is"
              }
            ]
          }
        ]
      },
      {
        "title": "Double consonants",
        "items": [
          {
            "glyph": "tt / ss / ll",
            "speak": "gatto",
            "glyphClass": "basics-glyph--pair",
            "approxHtml": "hold the consonant longer · changes meaning",
            "examples": [
              {
                "speak": "gatto",
                "text": "gatto",
                "gloss": "cat"
              },
              {
                "speak": "fato",
                "text": "fato",
                "gloss": "fate"
              },
              {
                "speak": "casa",
                "text": "casa",
                "gloss": "house"
              },
              {
                "speak": "cassa",
                "text": "cassa",
                "gloss": "cash register / crate"
              }
            ]
          }
        ]
      },
      {
        "title": "C and G",
        "items": [
          {
            "glyph": "c / g + e/i",
            "speak": "ciao",
            "glyphClass": "basics-glyph--pair",
            "approxHtml": "<strong>ch</strong> / <strong>j</strong> before e/i · hard before a/o/u",
            "examples": [
              {
                "speak": "ciao",
                "text": "ciao",
                "gloss": "hi / bye"
              },
              {
                "speak": "gelato",
                "text": "gelato",
                "gloss": "ice cream"
              },
              {
                "speak": "cane",
                "text": "cane",
                "gloss": "dog"
              },
              {
                "speak": "gatto",
                "text": "gatto",
                "gloss": "cat"
              }
            ]
          },
          {
            "glyph": "ch / gh",
            "speak": "chi",
            "glyphClass": "basics-glyph--pair",
            "approxHtml": "hard <strong>k</strong> / <strong>g</strong> before e/i",
            "examples": [
              {
                "speak": "chi",
                "text": "chi",
                "gloss": "who"
              },
              {
                "speak": "spaghetti",
                "text": "spaghetti",
                "gloss": "spaghetti"
              }
            ]
          }
        ]
      }
    ]
  };
  window.EXTRA_READ_STORIES = window.EXTRA_READ_STORIES || [];
  window.EXTRA_READ_STORIES.push({
      "id": "it-ciao",
      "categoryId": "it",
      "title": "Buongiorno a Roma",
      "subtitle": "A first morning",
      "trail": "green-circle",
      "sentences": [
        {
          "foreign": "Buongiorno.",
          "en": "Good morning."
        },
        {
          "foreign": "Mi chiamo Alex.",
          "en": "My name is Alex."
        },
        {
          "foreign": "Sono a Roma oggi.",
          "en": "I am in Rome today."
        },
        {
          "foreign": "Fa bel tempo.",
          "en": "The weather is nice."
        },
        {
          "foreign": "Vorrei un caffè, per favore.",
          "en": "I would like a coffee, please."
        },
        {
          "foreign": "Grazie mille.",
          "en": "Thank you very much."
        },
        {
          "foreign": "Dov'è la metro?",
          "en": "Where is the metro?"
        },
        {
          "foreign": "È di là.",
          "en": "It's that way."
        },
        {
          "foreign": "Non capisco tutto.",
          "en": "I don't understand everything."
        },
        {
          "foreign": "Ma va bene.",
          "en": "But it's fine."
        }
      ],
      "glosses": {
        "metro": "subway"
      }
    },
    {
      "id": "it-caffe",
      "categoryId": "it",
      "title": "Al bar",
      "subtitle": "Ordering a coffee",
      "trail": "green-circle",
      "sentences": [
        {
          "foreign": "Buongiorno! Un cappuccino, per favore.",
          "en": "Good morning! A cappuccino, please."
        },
        {
          "foreign": "Vuole qualcosa da mangiare?",
          "en": "Do you want something to eat?"
        },
        {
          "foreign": "Sì, un cornetto, grazie.",
          "en": "Yes, a croissant, thanks."
        },
        {
          "foreign": "Al bancone o al tavolo?",
          "en": "At the counter or at a table?"
        },
        {
          "foreign": "Al bancone, va bene.",
          "en": "At the counter is fine."
        },
        {
          "foreign": "Sono tre euro.",
          "en": "That's three euros."
        },
        {
          "foreign": "Pago con la carta.",
          "en": "I'll pay by card."
        },
        {
          "foreign": "Perfetto. Ecco il cappuccino.",
          "en": "Perfect. Here's the cappuccino."
        },
        {
          "foreign": "Grazie. Buona giornata!",
          "en": "Thanks. Have a nice day!"
        },
        {
          "foreign": "Arrivederci. A presto.",
          "en": "Goodbye. See you soon."
        }
      ],
      "glosses": {
        "cornetto": "croissant",
        "bancone": "counter"
      }
    },
    {
      "id": "it-treno",
      "categoryId": "it",
      "title": "In stazione",
      "subtitle": "Buying a ticket",
      "trail": "green-circle",
      "sentences": [
        {
          "foreign": "Scusi, questo treno va a Firenze?",
          "en": "Excuse me, does this train go to Florence?"
        },
        {
          "foreign": "Sì. Parte tra dieci minuti.",
          "en": "Yes. It leaves in ten minutes."
        },
        {
          "foreign": "Dove posso comprare un biglietto?",
          "en": "Where can I buy a ticket?"
        },
        {
          "foreign": "Alla macchinetta o sull'app.",
          "en": "At the machine or on the app."
        },
        {
          "foreign": "Un biglietto di sola andata, per favore.",
          "en": "One one-way ticket, please."
        },
        {
          "foreign": "Finestrino o corridoio?",
          "en": "Window or aisle?"
        },
        {
          "foreign": "Finestrino, grazie. Quanto dura?",
          "en": "Window, thanks. How long does it take?"
        },
        {
          "foreign": "Circa un'ora e mezza.",
          "en": "About an hour and a half."
        },
        {
          "foreign": "Grazie per l'aiuto.",
          "en": "Thanks for the help."
        },
        {
          "foreign": "Buon viaggio!",
          "en": "Have a good trip!"
        }
      ],
      "glosses": {
        "sola andata": "one-way",
        "finestrino": "window (seat)"
      }
    },
    {
      "id": "it-mercato",
      "categoryId": "it",
      "title": "Al mercato",
      "subtitle": "Food shopping",
      "trail": "green-circle",
      "sentences": [
        {
          "foreign": "Buongiorno. Vorrei delle mele, per favore.",
          "en": "Good morning. I would like some apples, please."
        },
        {
          "foreign": "Quanti chili?",
          "en": "How many kilos?"
        },
        {
          "foreign": "Un chilo va bene.",
          "en": "One kilo is fine."
        },
        {
          "foreign": "E un po' di formaggio?",
          "en": "And a little cheese?"
        },
        {
          "foreign": "Sì, duecento grammi di pecorino.",
          "en": "Yes, two hundred grams of pecorino."
        },
        {
          "foreign": "Altro?",
          "en": "Anything else?"
        },
        {
          "foreign": "No, è tutto. Quanto viene?",
          "en": "No, that's all. How much is it?"
        },
        {
          "foreign": "Sette euro e cinquanta.",
          "en": "Seven euros fifty."
        },
        {
          "foreign": "Ecco dieci euro.",
          "en": "Here's ten euros."
        },
        {
          "foreign": "Grazie. Arrivederci!",
          "en": "Thanks. Goodbye!"
        }
      ],
      "glosses": {
        "pecorino": "pecorino cheese",
        "chili": "kilos"
      }
    },
    {
      "id": "it-appartamento",
      "categoryId": "it",
      "title": "Cercare un appartamento",
      "subtitle": "Looking for a flat",
      "trail": "blue-square",
      "sentences": [
        {
          "foreign": "Cerco un appartamento vicino all'università.",
          "en": "I'm looking for an apartment near the university."
        },
        {
          "foreign": "Quante camere le servono?",
          "en": "How many rooms do you need?"
        },
        {
          "foreign": "Una camera e una cucina bastano.",
          "en": "One bedroom and a kitchen are enough."
        },
        {
          "foreign": "L'affitto è di settecento euro al mese.",
          "en": "The rent is seven hundred euros a month."
        },
        {
          "foreign": "Le spese sono incluse?",
          "en": "Are the utilities included?"
        },
        {
          "foreign": "L'acqua sì; la luce no.",
          "en": "Water yes; electricity no."
        },
        {
          "foreign": "Posso vederlo questo pomeriggio?",
          "en": "Can I see it this afternoon?"
        },
        {
          "foreign": "Certo. Le mando l'indirizzo.",
          "en": "Of course. I'll send you the address."
        },
        {
          "foreign": "Perfetto. A più tardi.",
          "en": "Perfect. See you later."
        }
      ],
      "glosses": {
        "affitto": "rent",
        "spese": "utilities / expenses"
      }
    },
    {
      "id": "it-medico",
      "categoryId": "it",
      "title": "Dal medico",
      "subtitle": "At the doctor's",
      "trail": "blue-square",
      "sentences": [
        {
          "foreign": "Buongiorno dottore. Non mi sento bene.",
          "en": "Good morning doctor. I don't feel well."
        },
        {
          "foreign": "Quali sono i sintomi?",
          "en": "What are the symptoms?"
        },
        {
          "foreign": "Ho mal di testa e un po' di febbre.",
          "en": "I have a headache and a bit of fever."
        },
        {
          "foreign": "Da quanto tempo?",
          "en": "For how long?"
        },
        {
          "foreign": "Da due giorni.",
          "en": "For two days."
        },
        {
          "foreign": "La esamino.",
          "en": "I'll examine you."
        },
        {
          "foreign": "Non è grave, ma deve riposare.",
          "en": "It's not serious, but you must rest."
        },
        {
          "foreign": "Ecco una ricetta per la farmacia.",
          "en": "Here's a prescription for the pharmacy."
        },
        {
          "foreign": "Grazie mille, dottore.",
          "en": "Thank you very much, doctor."
        },
        {
          "foreign": "Si riposi bene. A presto.",
          "en": "Rest well. See you soon."
        }
      ],
      "glosses": {
        "sintomi": "symptoms",
        "ricetta": "prescription"
      }
    },
    {
      "id": "it-lavoro",
      "categoryId": "it",
      "title": "Primo giorno di lavoro",
      "subtitle": "First day at work",
      "trail": "blue-square",
      "sentences": [
        {
          "foreign": "Oggi è il mio primo giorno in azienda.",
          "en": "Today is my first day at the company."
        },
        {
          "foreign": "La collega mi presenta alla squadra.",
          "en": "My colleague introduces me to the team."
        },
        {
          "foreign": "L'ufficio è al terzo piano.",
          "en": "The office is on the third floor."
        },
        {
          "foreign": "C'è una riunione alle dieci.",
          "en": "There is a meeting at ten."
        },
        {
          "foreign": "Prendo appunti durante la presentazione.",
          "en": "I take notes during the presentation."
        },
        {
          "foreign": "A mezzogiorno mangiamo in mensa.",
          "en": "At noon we eat in the cafeteria."
        },
        {
          "foreign": "Nel pomeriggio imparo a usare il software.",
          "en": "In the afternoon I learn to use the software."
        },
        {
          "foreign": "Il lavoro è interessante, ma c'è tanto da ricordare.",
          "en": "The work is interesting, but there's a lot to remember."
        },
        {
          "foreign": "Stasera sono un po' stanco, ma contento.",
          "en": "Tonight I'm a bit tired, but glad."
        }
      ],
      "glosses": {
        "azienda": "company",
        "mensa": "cafeteria",
        "appunti": "notes"
      }
    },
    {
      "id": "it-viaggio",
      "categoryId": "it",
      "title": "Weekend in Toscana",
      "subtitle": "A weekend trip",
      "trail": "blue-square",
      "sentences": [
        {
          "foreign": "Partiamo in treno per la Toscana.",
          "en": "We leave by train for Tuscany."
        },
        {
          "foreign": "Il paesaggio è meraviglioso: colline, vigneti e borghi.",
          "en": "The landscape is wonderful: hills, vineyards, and villages."
        },
        {
          "foreign": "Sabato mattina visitiamo un mercato locale.",
          "en": "Saturday morning we visit a local market."
        },
        {
          "foreign": "Compro olio d'oliva e un pezzo di pecorino.",
          "en": "I buy olive oil and a piece of pecorino."
        },
        {
          "foreign": "Nel pomeriggio camminiamo fino a un piccolo paese.",
          "en": "In the afternoon we walk to a small town."
        },
        {
          "foreign": "La sera ceniamo all'aperto.",
          "en": "In the evening we dine outdoors."
        },
        {
          "foreign": "Il vino è eccellente e la conversazione lunga.",
          "en": "The wine is excellent and the conversation long."
        },
        {
          "foreign": "Domenica bisogna già tornare.",
          "en": "On Sunday we already have to go back."
        },
        {
          "foreign": "Tornerò presto.",
          "en": "I'll come back soon."
        }
      ],
      "glosses": {
        "vigneti": "vineyards",
        "borghi": "villages / historic towns"
      }
    },
    {
      "id": "it-dibattito",
      "categoryId": "it",
      "title": "Un dibattito in classe",
      "subtitle": "A classroom debate",
      "trail": "black-diamond",
      "sentences": [
        {
          "foreign": "Oggi la classe discute del futuro delle città.",
          "en": "Today the class discusses the future of cities."
        },
        {
          "foreign": "Alcuni pensano che le auto dovrebbero essere vietate in centro.",
          "en": "Some think cars should be banned from the center."
        },
        {
          "foreign": "Altri dicono che è impossibile per i negozi.",
          "en": "Others say it's impossible for the shops."
        },
        {
          "foreign": "Il professore chiede argomenti precisi.",
          "en": "The professor asks for precise arguments."
        },
        {
          "foreign": "Maria spiega che l'inquinamento colpisce la salute dei bambini.",
          "en": "Maria explains that pollution affects children's health."
        },
        {
          "foreign": "Paolo risponde che i mezzi pubblici non bastano ancora.",
          "en": "Paolo replies that public transport is still not enough."
        },
        {
          "foreign": "Dopo un'ora, nessuno ha cambiato del tutto idea.",
          "en": "After an hour, no one has fully changed their mind."
        },
        {
          "foreign": "Tuttavia tutti capiscono meglio il problema.",
          "en": "Yet everyone better understands the problem."
        },
        {
          "foreign": "È già un progresso.",
          "en": "That's already progress."
        }
      ],
      "glosses": {
        "vietate": "banned",
        "inquinamento": "pollution",
        "mezzi pubblici": "public transport"
      }
    },
    {
      "id": "it-lettera",
      "categoryId": "it",
      "title": "Una lettera importante",
      "subtitle": "An important letter",
      "trail": "black-diamond",
      "sentences": [
        {
          "foreign": "Stamattina ho ricevuto una lettera dall'amministrazione.",
          "en": "This morning I received a letter from the administration."
        },
        {
          "foreign": "Chiede diversi documenti entro la fine del mese.",
          "en": "It asks for several documents by the end of the month."
        },
        {
          "foreign": "Devo dimostrare il mio indirizzo e lo status di studente.",
          "en": "I must prove my address and student status."
        },
        {
          "foreign": "Senza queste carte, la pratica sarà incompleta.",
          "en": "Without these papers, the file will be incomplete."
        },
        {
          "foreign": "Passo il pomeriggio a raccogliere le copie.",
          "en": "I spend the afternoon gathering the copies."
        },
        {
          "foreign": "La biblioteca mi aiuta a stampare i moduli.",
          "en": "The library helps me print the forms."
        },
        {
          "foreign": "Domani invierò tutto con raccomandata.",
          "en": "Tomorrow I'll send everything by registered mail."
        },
        {
          "foreign": "Spero che basti.",
          "en": "I hope it will be enough."
        }
      ],
      "glosses": {
        "pratica": "file / application",
        "raccomandata": "registered mail"
      }
    },
    {
      "id": "it-temporale",
      "categoryId": "it",
      "title": "Notte di temporale",
      "subtitle": "A stormy night",
      "trail": "black-diamond",
      "sentences": [
        {
          "foreign": "Il vento si è alzato subito dopo cena.",
          "en": "The wind picked up right after dinner."
        },
        {
          "foreign": "Nuvole scure hanno coperto la luna.",
          "en": "Dark clouds covered the moon."
        },
        {
          "foreign": "All'improvviso un fulmine ha illuminato la strada.",
          "en": "Suddenly lightning lit up the street."
        },
        {
          "foreign": "Il tuono è arrivato molto vicino.",
          "en": "The thunder arrived very close."
        },
        {
          "foreign": "La pioggia ha cominciato a battere contro le finestre.",
          "en": "The rain began to beat against the windows."
        },
        {
          "foreign": "Mi sono alzato per chiudere le imposte.",
          "en": "I got up to close the shutters."
        },
        {
          "foreign": "Fuori, gli alberi si piegavano sotto il vento.",
          "en": "Outside, the trees bent under the wind."
        },
        {
          "foreign": "Verso mezzanotte il temporale si è calmato.",
          "en": "Around midnight the storm calmed down."
        },
        {
          "foreign": "Al mattino l'aria profumava di terra bagnata.",
          "en": "In the morning the air smelled of wet earth."
        }
      ],
      "glosses": {
        "fulmine": "lightning",
        "tuono": "thunder",
        "imposte": "shutters"
      }
    },
    {
      "id": "it-romanzo",
      "categoryId": "it",
      "title": "Il vecchio libro",
      "subtitle": "A found novel",
      "trail": "double-black-diamond",
      "sentences": [
        {
          "foreign": "In una scatola dimenticata in soffitta ho trovato un romanzo senza copertina.",
          "en": "In a forgotten box in the attic I found a novel with no cover."
        },
        {
          "foreign": "Le pagine erano gialle, ma la scrittura restava leggibile.",
          "en": "The pages were yellow, but the writing was still legible."
        },
        {
          "foreign": "La storia parlava di una donna che attraversava l'Italia a piedi dopo la guerra.",
          "en": "The story was about a woman who crossed Italy on foot after the war."
        },
        {
          "foreign": "Cercava il fratello, scomparso da mesi.",
          "en": "She was looking for her brother, missing for months."
        },
        {
          "foreign": "Ogni capitolo si svolgeva in una città diversa.",
          "en": "Each chapter took place in a different city."
        },
        {
          "foreign": "A volte la speranza sembrava perduta; a volte una lettera riapriva la strada.",
          "en": "Sometimes hope seemed lost; sometimes a letter reopened the road."
        },
        {
          "foreign": "Ho letto fino all'alba, senza riuscire a fermarmi.",
          "en": "I read until dawn, unable to stop."
        },
        {
          "foreign": "Sull'ultima pagina c'era il nome di mio nonno scritto a matita.",
          "en": "On the last page was my grandfather's name written in pencil."
        },
        {
          "foreign": "Il libro non era solo una storia: era un'eredità.",
          "en": "The book was not only a story: it was an inheritance."
        }
      ],
      "glosses": {
        "soffitta": "attic",
        "copertina": "cover",
        "eredità": "inheritance"
      }
    },
    {
      "id": "it-tesi",
      "categoryId": "it",
      "title": "La discussione della tesi",
      "subtitle": "Defending a thesis",
      "trail": "double-black-diamond",
      "sentences": [
        {
          "foreign": "Dopo quattro anni di ricerca, è arrivato il giorno della discussione.",
          "en": "After four years of research, the day of the defense arrived."
        },
        {
          "foreign": "L'aula era piena di professori, colleghi e della mia famiglia.",
          "en": "The hall was full of professors, colleagues, and my family."
        },
        {
          "foreign": "Ho presentato i risultati sul clima urbano per quaranta minuti.",
          "en": "I presented the results on urban climate for forty minutes."
        },
        {
          "foreign": "Le domande sono state dure, ma giuste.",
          "en": "The questions were hard, but fair."
        },
        {
          "foreign": "Un membro della commissione ha contestato il metodo; l'ho difeso con i dati.",
          "en": "A committee member challenged the method; I defended it with data."
        },
        {
          "foreign": "Quando mi hanno chiesto di uscire, il cuore batteva troppo forte.",
          "en": "When they asked me to step out, my heart was beating too hard."
        },
        {
          "foreign": "Al ritorno, il presidente ha sorriso e ha detto: «Congratulazioni, dottore».",
          "en": "Coming back, the chair smiled and said: “Congratulations, doctor.”"
        },
        {
          "foreign": "Ho sentito a malapena il resto: solo la gioia.",
          "en": "I barely heard the rest: only the joy."
        },
        {
          "foreign": "Fuori, il sole di giugno illuminava finalmente la fine di un lungo cammino.",
          "en": "Outside, the June sun finally lit the end of a long path."
        }
      ],
      "glosses": {
        "discussione": "defense (thesis)",
        "commissione": "committee",
        "contestato": "challenged"
      }
    });
})();
