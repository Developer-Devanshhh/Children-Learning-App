/**
 * assessmentCorpus.ts — Research-Informed Stimulus Item Bank for Reading Screening
 *
 * Contains standardized, age-appropriate, phonotactically legal items for:
 *   - Stage 01: Letter Knowledge (Grapheme ID, Upper/Lower Match, Letter-Sound GPC)
 *   - Stage 02: Phonological Awareness (Rhyme, Initial/Final Sound, Blending, Deletion)
 *   - Stage 03: Phonological Decoding (Phonotactically Legal Pseudowords in English)
 *   - Stage 04: Word Recognition (High-Frequency Regular & Irregular Sight Words)
 *
 * All items follow English phonotactic and orthographic constraints.
 * Practice items are explicitly flagged (`isPractice: true`) and never scored.
 */

export interface AssessmentCorpusItem {
  id: string;
  stageId: 'stage_01' | 'stage_02' | 'stage_03' | 'stage_04' | 'stage_05' | 'stage_06' | 'stage_07' | 'stage_08' | 'stage_09' | 'stage_10';
  domain: string;
  taskType: string;
  difficultyTier: 'easy' | 'medium' | 'hard';
  isPractice: boolean;
  promptText: string;
  audioPromptText: string;
  displayStimulus?: string;
  options: Array<{
    id: string;
    label: string;
    subLabel?: string;
    icon?: string;
    isCorrect: boolean;
    errorType?: string;
  }>;
  expectedAnswerId: string;
  reversalDistractorPresent?: boolean;
}

// ── STAGE 01: LETTER KNOWLEDGE CORPUS ──────────────────────────────────────────
export const STAGE_01_ITEMS: AssessmentCorpusItem[] = [
  // Practice Item
  {
    id: 's01_p01',
    stageId: 'stage_01',
    domain: 'letter_knowledge',
    taskType: 'letter_identification',
    difficultyTier: 'easy',
    isPractice: true,
    promptText: "Tap the letter 'A'!",
    audioPromptText: "Tap the letter A!",
    options: [
      { id: 'opt_A', label: 'A', isCorrect: true },
      { id: 'opt_O', label: 'O', isCorrect: false },
      { id: 'opt_T', label: 'T', isCorrect: false },
    ],
    expectedAnswerId: 'opt_A',
  },
  // Easy Tier (High-frequency, distinct uppercase/lowercase)
  {
    id: 's01_e01',
    stageId: 'stage_01',
    domain: 'letter_knowledge',
    taskType: 'letter_identification',
    difficultyTier: 'easy',
    isPractice: false,
    promptText: "Find the letter that makes the /s/ sound, as in 'Sun'!",
    audioPromptText: "Find the letter that makes the sss sound, as in Sun!",
    options: [
      { id: 'opt_S', label: 'S', isCorrect: true },
      { id: 'opt_M', label: 'M', isCorrect: false, errorType: 'PHONIC_DISTRACTOR' },
      { id: 'opt_T', label: 'T', isCorrect: false, errorType: 'PHONIC_DISTRACTOR' },
      { id: 'opt_B', label: 'B', isCorrect: false, errorType: 'PHONIC_DISTRACTOR' },
    ],
    expectedAnswerId: 'opt_S',
  },
  {
    id: 's01_e02',
    stageId: 'stage_01',
    domain: 'letter_knowledge',
    taskType: 'letter_sound_association',
    difficultyTier: 'easy',
    isPractice: false,
    promptText: "Which letter makes the /m/ sound, as in 'Moon'?",
    audioPromptText: "Which letter makes the mmm sound, as in Moon?",
    options: [
      { id: 'opt_M', label: 'M', isCorrect: true },
      { id: 'opt_W', label: 'W', isCorrect: false, errorType: 'VISUAL_INVERSION_OBSERVATION' },
      { id: 'opt_N', label: 'N', isCorrect: false, errorType: 'ORTHOGRAPHIC_SIMILAR' },
      { id: 'opt_H', label: 'H', isCorrect: false, errorType: 'UNRELATED' },
    ],
    expectedAnswerId: 'opt_M',
  },
  // Medium Tier (Upper/Lowercase matching with dissimilar forms)
  {
    id: 's01_m01',
    stageId: 'stage_01',
    domain: 'letter_knowledge',
    taskType: 'case_matching',
    difficultyTier: 'medium',
    isPractice: false,
    promptText: "Find the small lowercase match for uppercase 'G'!",
    audioPromptText: "Find the small letter match for big letter G!",
    displayStimulus: 'G',
    options: [
      { id: 'opt_g', label: 'g', isCorrect: true },
      { id: 'opt_q', label: 'q', isCorrect: false, errorType: 'VISUAL_SIMILAR_REVERSAL' },
      { id: 'opt_j', label: 'j', isCorrect: false, errorType: 'ORTHOGRAPHIC_SIMILAR' },
      { id: 'opt_p', label: 'p', isCorrect: false, errorType: 'VISUAL_SIMILAR_REVERSAL' },
    ],
    expectedAnswerId: 'opt_g',
    reversalDistractorPresent: true,
  },
  {
    id: 's01_m02',
    stageId: 'stage_01',
    domain: 'letter_knowledge',
    taskType: 'case_matching',
    difficultyTier: 'medium',
    isPractice: false,
    promptText: "Find the small lowercase match for uppercase 'R'!",
    audioPromptText: "Find the small letter match for big letter R!",
    displayStimulus: 'R',
    options: [
      { id: 'opt_r', label: 'r', isCorrect: true },
      { id: 'opt_n', label: 'n', isCorrect: false, errorType: 'ORTHOGRAPHIC_SIMILAR' },
      { id: 'opt_h', label: 'h', isCorrect: false, errorType: 'ORTHOGRAPHIC_SIMILAR' },
      { id: 'opt_v', label: 'v', isCorrect: false, errorType: 'UNRELATED' },
    ],
    expectedAnswerId: 'opt_r',
  },
  // Hard Tier (Phonemic soft sounds / visually confusable pairs b/d/p/q)
  {
    id: 's01_h01',
    stageId: 'stage_01',
    domain: 'letter_knowledge',
    taskType: 'letter_identification',
    difficultyTier: 'hard',
    isPractice: false,
    promptText: "Find the small letter 'b' as in 'ball'!",
    audioPromptText: "Find the small letter b as in ball!",
    options: [
      { id: 'opt_b', label: 'b', isCorrect: true },
      { id: 'opt_d', label: 'd', isCorrect: false, errorType: 'ORTHOGRAPHIC_REVERSAL_OBSERVATION' },
      { id: 'opt_p', label: 'p', isCorrect: false, errorType: 'ORTHOGRAPHIC_REVERSAL_OBSERVATION' },
      { id: 'opt_q', label: 'q', isCorrect: false, errorType: 'ORTHOGRAPHIC_REVERSAL_OBSERVATION' },
    ],
    expectedAnswerId: 'opt_b',
    reversalDistractorPresent: true,
  },
  {
    id: 's01_h02',
    stageId: 'stage_01',
    domain: 'letter_knowledge',
    taskType: 'letter_sound_association',
    difficultyTier: 'hard',
    isPractice: false,
    promptText: "Which letter can make the soft /s/ sound as in 'City' or /k/ as in 'Cat'?",
    audioPromptText: "Which letter can make the soft sss sound in City and k sound in Cat?",
    options: [
      { id: 'opt_C', label: 'C', isCorrect: true },
      { id: 'opt_K', label: 'K', isCorrect: false, errorType: 'PHONIC_DISTRACTOR' },
      { id: 'opt_S', label: 'S', isCorrect: false, errorType: 'PHONIC_DISTRACTOR' },
      { id: 'opt_G', label: 'G', isCorrect: false, errorType: 'ORTHOGRAPHIC_SIMILAR' },
    ],
    expectedAnswerId: 'opt_C',
  },
];

// ── STAGE 02: PHONOLOGICAL AWARENESS CORPUS ────────────────────────────────────
export const STAGE_02_ITEMS: AssessmentCorpusItem[] = [
  // Practice Item
  {
    id: 's02_p01',
    stageId: 'stage_02',
    domain: 'phonological_awareness',
    taskType: 'rhyme_detection',
    difficultyTier: 'easy',
    isPractice: true,
    promptText: "Which word rhymes with 'CAT'?",
    audioPromptText: "Which word rhymes with cat? Bat or Dog?",
    options: [
      { id: 'opt_bat', label: 'BAT', icon: '🦇', isCorrect: true },
      { id: 'opt_dog', label: 'DOG', icon: '🐶', isCorrect: false },
    ],
    expectedAnswerId: 'opt_bat',
  },
  // Easy Tier (Rhyme identification & Initial sound isolation)
  {
    id: 's02_e01',
    stageId: 'stage_02',
    domain: 'phonological_awareness',
    taskType: 'rhyme_detection',
    difficultyTier: 'easy',
    isPractice: false,
    promptText: "Which word rhymes with 'STAR'?",
    audioPromptText: "Which word rhymes with star? Car, Sun, or Moon?",
    options: [
      { id: 'opt_car', label: 'CAR', icon: '🚗', isCorrect: true },
      { id: 'opt_sun', label: 'SUN', icon: '☀️', isCorrect: false, errorType: 'SEMANTIC_DISTRACTOR' },
      { id: 'opt_moon', label: 'MOON', icon: '🌙', isCorrect: false, errorType: 'SEMANTIC_DISTRACTOR' },
    ],
    expectedAnswerId: 'opt_car',
  },
  {
    id: 's02_e02',
    stageId: 'stage_02',
    domain: 'phonological_awareness',
    taskType: 'initial_sound_isolation',
    difficultyTier: 'easy',
    isPractice: false,
    promptText: "What is the FIRST sound you hear in 'FISH'?",
    audioPromptText: "What is the first sound you hear in fish? /f/, /sh/, or /p/?",
    options: [
      { id: 'opt_f', label: '/f/', subLabel: 'sound /f/', isCorrect: true },
      { id: 'opt_sh', label: '/sh/', subLabel: 'sound /sh/', isCorrect: false, errorType: 'FINAL_SOUND_CONFUSION' },
      { id: 'opt_p', label: '/p/', subLabel: 'sound /p/', isCorrect: false, errorType: 'LABIAL_DISTRACTOR' },
    ],
    expectedAnswerId: 'opt_f',
  },
  // Medium Tier (Phoneme blending 3 sounds CVC)
  {
    id: 's02_m01',
    stageId: 'stage_02',
    domain: 'phonological_awareness',
    taskType: 'phoneme_blending',
    difficultyTier: 'medium',
    isPractice: false,
    promptText: "Blend the sounds: /d/ - /o/ - /g/! What word is it?",
    audioPromptText: "Blend these sounds together: /d/ ... /o/ ... /g/. What word does it make?",
    options: [
      { id: 'opt_dog', label: 'DOG', icon: '🐶', isCorrect: true },
      { id: 'opt_dig', label: 'DIG', icon: '⛏️', isCorrect: false, errorType: 'VOWEL_CONFUSION' },
      { id: 'opt_dot', label: 'DOT', icon: '🔴', isCorrect: false, errorType: 'FINAL_CONSONANT_CONFUSION' },
    ],
    expectedAnswerId: 'opt_dog',
  },
  {
    id: 's02_m02',
    stageId: 'stage_02',
    domain: 'phonological_awareness',
    taskType: 'final_sound_isolation',
    difficultyTier: 'medium',
    isPractice: false,
    promptText: "What is the LAST sound you hear in 'CUP'?",
    audioPromptText: "What is the ending sound in cup? /p/, /k/, or /t/?",
    options: [
      { id: 'opt_p', label: '/p/', subLabel: 'sound /p/', isCorrect: true },
      { id: 'opt_k', label: '/k/', subLabel: 'sound /k/', isCorrect: false, errorType: 'INITIAL_SOUND_CONFUSION' },
      { id: 'opt_t', label: '/t/', subLabel: 'sound /t/', isCorrect: false, errorType: 'ALVEOLAR_DISTRACTOR' },
    ],
    expectedAnswerId: 'opt_p',
  },
  // Hard Tier (Phoneme deletion / 4-sound blending)
  {
    id: 's02_h01',
    stageId: 'stage_02',
    domain: 'phonological_awareness',
    taskType: 'phoneme_deletion',
    difficultyTier: 'hard',
    isPractice: false,
    promptText: "Say 'PARK' without the /p/ sound. What is left?",
    audioPromptText: "Say park without the /p/ sound. What word is left?",
    options: [
      { id: 'opt_ark', label: 'ARK', icon: '⛵', isCorrect: true },
      { id: 'opt_bark', label: 'BARK', icon: '🐕', isCorrect: false, errorType: 'SUBSTITUTION_ERROR' },
      { id: 'opt_pack', label: 'PACK', icon: '🎒', isCorrect: false, errorType: 'RHYME_ERROR' },
    ],
    expectedAnswerId: 'opt_ark',
  },
  {
    id: 's02_h02',
    stageId: 'stage_02',
    domain: 'phonological_awareness',
    taskType: 'phoneme_blending_complex',
    difficultyTier: 'hard',
    isPractice: false,
    promptText: "Blend these 4 sounds: /s/ - /p/ - /oo/ - /n/!",
    audioPromptText: "Blend these 4 sounds: /s/ ... /p/ ... /oo/ ... /n/. What word is it?",
    options: [
      { id: 'opt_spoon', label: 'SPOON', icon: '🥄', isCorrect: true },
      { id: 'opt_spin', label: 'SPIN', icon: '🌀', isCorrect: false, errorType: 'VOWEL_CONFUSION' },
      { id: 'opt_soon', label: 'SOON', icon: '⏳', isCorrect: false, errorType: 'CLUSTER_REDUCTION_ERROR' },
    ],
    expectedAnswerId: 'opt_spoon',
  },
];

// ── STAGE 03: PHONOLOGICAL DECODING (PSEUDOWORD) CORPUS ──────────────────────
// All pseudowords follow strictly legal English phonotactic syllable structures.
export const STAGE_03_ITEMS: AssessmentCorpusItem[] = [
  // Practice Item
  {
    id: 's03_p01',
    stageId: 'stage_03',
    domain: 'decoding',
    taskType: 'pseudoword_decoding',
    difficultyTier: 'easy',
    isPractice: true,
    promptText: "Read the alien word 'TUP'! Which audio matches it?",
    audioPromptText: "Read this alien word: T U P. Which audio matches it?",
    displayStimulus: 'TUP',
    options: [
      { id: 'opt_tup', label: 'TUP (/tʌp/)', isCorrect: true },
      { id: 'opt_top', label: 'TOP (/tɒp/)', isCorrect: false, errorType: 'VOWEL_SUBSTITUTION' },
      { id: 'opt_pup', label: 'PUP (/pʌp/)', isCorrect: false, errorType: 'INITIAL_CONSONANT_ERROR' },
    ],
    expectedAnswerId: 'opt_tup',
  },
  // Easy Tier (Regular CVC Pseudowords)
  {
    id: 's03_e01',
    stageId: 'stage_03',
    domain: 'decoding',
    taskType: 'pseudoword_decoding',
    difficultyTier: 'easy',
    isPractice: false,
    promptText: "Read the alien word 'MIP'! Which sound does it make?",
    audioPromptText: "Read this alien word: M I P. Which sound does it make?",
    displayStimulus: 'MIP',
    options: [
      { id: 'opt_mip', label: 'MIP (/mɪp/)', isCorrect: true },
      { id: 'opt_mop', label: 'MOP (/mɒp/)', isCorrect: false, errorType: 'VOWEL_SUBSTITUTION' },
      { id: 'opt_nip', label: 'NIP (/nɪp/)', isCorrect: false, errorType: 'NASAL_CONFUSION' },
      { id: 'opt_map', label: 'MAP (/mæp/)', isCorrect: false, errorType: 'VOWEL_SUBSTITUTION' },
    ],
    expectedAnswerId: 'opt_mip',
  },
  {
    id: 's03_e02',
    stageId: 'stage_03',
    domain: 'decoding',
    taskType: 'pseudoword_decoding',
    difficultyTier: 'easy',
    isPractice: false,
    promptText: "Read the alien word 'DAX'! Which sound does it make?",
    audioPromptText: "Read this alien word: D A X. Which sound does it make?",
    displayStimulus: 'DAX',
    options: [
      { id: 'opt_dax', label: 'DAX (/dæks/)', isCorrect: true },
      { id: 'opt_bax', label: 'BAX (/bæks/)', isCorrect: false, errorType: 'REVERSAL_CONFUSION_OBSERVATION' },
      { id: 'opt_dox', label: 'DOX (/dɒks/)', isCorrect: false, errorType: 'VOWEL_SUBSTITUTION' },
      { id: 'opt_tax', label: 'TAX (/tæks/)', isCorrect: false, errorType: 'VOICING_CONFUSION' },
    ],
    expectedAnswerId: 'opt_dax',
    reversalDistractorPresent: true,
  },
  // Medium Tier (CCVC / CVCC Blends Pseudowords)
  {
    id: 's03_m01',
    stageId: 'stage_03',
    domain: 'decoding',
    taskType: 'pseudoword_decoding',
    difficultyTier: 'medium',
    isPractice: false,
    promptText: "Read the alien word 'FLIM'! Which sound does it make?",
    audioPromptText: "Read this alien word: F L I M. Which sound does it make?",
    displayStimulus: 'FLIM',
    options: [
      { id: 'opt_flim', label: 'FLIM (/flɪm/)', isCorrect: true },
      { id: 'opt_slim', label: 'SLIM (/slɪm/)', isCorrect: false, errorType: 'CLUSTER_SUBSTITUTION' },
      { id: 'opt_flam', label: 'FLAM (/flæm/)', isCorrect: false, errorType: 'VOWEL_SUBSTITUTION' },
      { id: 'opt_film', label: 'FILM (/fɪlm/)', isCorrect: false, errorType: 'ANAGRAM_TRANSPOSITION' },
    ],
    expectedAnswerId: 'opt_flim',
  },
  {
    id: 's03_m02',
    stageId: 'stage_03',
    domain: 'decoding',
    taskType: 'pseudoword_decoding',
    difficultyTier: 'medium',
    isPractice: false,
    promptText: "Read the alien word 'BRUST'!",
    audioPromptText: "Read this alien word: B R U S T. Which sound does it make?",
    displayStimulus: 'BRUST',
    options: [
      { id: 'opt_brust', label: 'BRUST (/brʌst/)', isCorrect: true },
      { id: 'opt_drust', label: 'DRUST (/drʌst/)', isCorrect: false, errorType: 'REVERSAL_CONFUSION_OBSERVATION' },
      { id: 'opt_brast', label: 'BRAST (/bræst/)', isCorrect: false, errorType: 'VOWEL_SUBSTITUTION' },
      { id: 'opt_burst', label: 'BURST (/bɜːrst/)', isCorrect: false, errorType: 'REAL_WORD_INTRUSION' },
    ],
    expectedAnswerId: 'opt_brust',
    reversalDistractorPresent: true,
  },
  // Hard Tier (Consonant Digraphs & Vowel Teams Pseudowords)
  {
    id: 's03_h01',
    stageId: 'stage_03',
    domain: 'decoding',
    taskType: 'pseudoword_decoding',
    difficultyTier: 'hard',
    isPractice: false,
    promptText: "Read the alien word 'THAMP'!",
    audioPromptText: "Read this alien word: T H A M P. Which sound does it make?",
    displayStimulus: 'THAMP',
    options: [
      { id: 'opt_thamp', label: 'THAMP (/θæmp/)', isCorrect: true },
      { id: 'opt_tamp', label: 'TAMP (/tæmp/)', isCorrect: false, errorType: 'DIGRAPH_REDUCTION' },
      { id: 'opt_champ', label: 'CHAMP (/tʃæmp/)', isCorrect: false, errorType: 'DIGRAPH_SUBSTITUTION' },
      { id: 'opt_thomp', label: 'THOMP (/θɒmp/)', isCorrect: false, errorType: 'VOWEL_SUBSTITUTION' },
    ],
    expectedAnswerId: 'opt_thamp',
  },
  {
    id: 's03_h02',
    stageId: 'stage_03',
    domain: 'decoding',
    taskType: 'pseudoword_decoding',
    difficultyTier: 'hard',
    isPractice: false,
    promptText: "Read the alien word 'ZOUT'! It has a vowel team — what sound does it make?",
    audioPromptText: "Read this alien word with the ou team: Z O U T. Which sound does it make?",
    displayStimulus: 'ZOUT',
    options: [
      { id: 'opt_zout', label: 'ZOUT (/zaʊt/)', isCorrect: true },
      { id: 'opt_zoot', label: 'ZOOT (/zuːt/)', isCorrect: false, errorType: 'DIPHTHONG_CONFUSION' },
      { id: 'opt_sout', label: 'SOUT (/saʊt/)', isCorrect: false, errorType: 'VOICING_CONFUSION' },
      { id: 'opt_zot', label: 'ZOT (/zɒt/)', isCorrect: false, errorType: 'VOWEL_DIGRAPH_NEGLECT' },
    ],
    expectedAnswerId: 'opt_zout',
  },
];

// ── STAGE 04: REAL-WORD RECOGNITION CORPUS ────────────────────────────────────
// Measures sight-word identification, lexical access, and orthographic accuracy.
export const STAGE_04_ITEMS: AssessmentCorpusItem[] = [
  // Practice Item
  {
    id: 's04_p01',
    stageId: 'stage_04',
    domain: 'word_recognition',
    taskType: 'sight_word_recognition',
    difficultyTier: 'easy',
    isPractice: true,
    promptText: "Find the word 'CAT'!",
    audioPromptText: "Find the word: Cat!",
    options: [
      { id: 'opt_cat', label: 'CAT', icon: '🐱', isCorrect: true },
      { id: 'opt_bat', label: 'BAT', icon: '🦇', isCorrect: false },
      { id: 'opt_hat', label: 'HAT', icon: '🎩', isCorrect: false },
    ],
    expectedAnswerId: 'opt_cat',
  },
  // Easy Tier (Pre-primer / Primer high-frequency sight words)
  {
    id: 's04_e01',
    stageId: 'stage_04',
    domain: 'word_recognition',
    taskType: 'sight_word_recognition',
    difficultyTier: 'easy',
    isPractice: false,
    promptText: "Find the word: 'THE'!",
    audioPromptText: "Find the word: The! As in, the happy sun.",
    options: [
      { id: 'opt_the', label: 'THE', isCorrect: true },
      { id: 'opt_teh', label: 'TEH', isCorrect: false, errorType: 'TRANSPOSITION_ERROR' },
      { id: 'opt_they', label: 'THEY', isCorrect: false, errorType: 'VISUAL_EXTENSION' },
      { id: 'opt_that', label: 'THAT', isCorrect: false, errorType: 'ORTHOGRAPHIC_NEIGHBOR' },
    ],
    expectedAnswerId: 'opt_the',
  },
  {
    id: 's04_e02',
    stageId: 'stage_04',
    domain: 'word_recognition',
    taskType: 'sight_word_recognition',
    difficultyTier: 'easy',
    isPractice: false,
    promptText: "Find the word: 'LOOK'!",
    audioPromptText: "Find the word: Look! As in, look at the stars.",
    options: [
      { id: 'opt_look', label: 'LOOK', isCorrect: true },
      { id: 'opt_book', label: 'BOOK', isCorrect: false, errorType: 'ORTHOGRAPHIC_NEIGHBOR' },
      { id: 'opt_took', label: 'TOOK', isCorrect: false, errorType: 'ORTHOGRAPHIC_NEIGHBOR' },
      { id: 'opt_lock', label: 'LOCK', isCorrect: false, errorType: 'VOWEL_CONFUSION' },
    ],
    expectedAnswerId: 'opt_look',
  },
  // Medium Tier (Grade 1-2 irregular high-frequency words)
  {
    id: 's04_m01',
    stageId: 'stage_04',
    domain: 'word_recognition',
    taskType: 'sight_word_recognition',
    difficultyTier: 'medium',
    isPractice: false,
    promptText: "Find the word: 'SAID'!",
    audioPromptText: "Find the word: Said! As in, Lyra said hello.",
    options: [
      { id: 'opt_said', label: 'SAID', isCorrect: true },
      { id: 'opt_sed', label: 'SED', isCorrect: false, errorType: 'PHONETIC_MISPELLING' },
      { id: 'opt_paid', label: 'PAID', isCorrect: false, errorType: 'ORTHOGRAPHIC_NEIGHBOR' },
      { id: 'opt_sand', label: 'SAND', isCorrect: false, errorType: 'LETTER_INSERTION' },
    ],
    expectedAnswerId: 'opt_said',
  },
  {
    id: 's04_m02',
    stageId: 'stage_04',
    domain: 'word_recognition',
    taskType: 'sight_word_recognition',
    difficultyTier: 'medium',
    isPractice: false,
    promptText: "Find the word: 'WATER'!",
    audioPromptText: "Find the word: Water! As in, a glass of water.",
    options: [
      { id: 'opt_water', label: 'WATER', isCorrect: true },
      { id: 'opt_waiter', label: 'WAITER', isCorrect: false, errorType: 'ORTHOGRAPHIC_CONFUSION' },
      { id: 'opt_watar', label: 'WATAR', isCorrect: false, errorType: 'PHONETIC_MISPELLING' },
      { id: 'opt_watch', label: 'WATCH', isCorrect: false, errorType: 'ONSET_CONFUSION' },
    ],
    expectedAnswerId: 'opt_water',
  },
  // Hard Tier (Grade 3-4 orthographically complex irregular words)
  {
    id: 's04_h01',
    stageId: 'stage_04',
    domain: 'word_recognition',
    taskType: 'sight_word_recognition',
    difficultyTier: 'hard',
    isPractice: false,
    promptText: "Find the word: 'BECAUSE'!",
    audioPromptText: "Find the word: Because! As in, I smiled because I was happy.",
    options: [
      { id: 'opt_because', label: 'BECAUSE', isCorrect: true },
      { id: 'opt_becos', label: 'BECOS', isCorrect: false, errorType: 'PHONETIC_MISPELLING' },
      { id: 'opt_becuase', label: 'BECUASE', isCorrect: false, errorType: 'TRANSPOSITION_ERROR' },
      { id: 'opt_become', label: 'BECOME', isCorrect: false, errorType: 'MORPHOLOGICAL_CONFUSION' },
    ],
    expectedAnswerId: 'opt_because',
  },
  {
    id: 's04_h02',
    stageId: 'stage_04',
    domain: 'word_recognition',
    taskType: 'sight_word_recognition',
    difficultyTier: 'hard',
    isPractice: false,
    promptText: "Find the word: 'KNIGHT'!",
    audioPromptText: "Find the word: Knight! As in, the brave knight in shining armor.",
    options: [
      { id: 'opt_knight', label: 'KNIGHT', isCorrect: true },
      { id: 'opt_night', label: 'NIGHT', isCorrect: false, errorType: 'HOMOPHONE_ERROR' },
      { id: 'opt_nite', label: 'NITE', isCorrect: false, errorType: 'PHONETIC_COLLOQUIAL' },
      { id: 'opt_king', label: 'KING', isCorrect: false, errorType: 'SEMANTIC_DISTRACTOR' },
    ],
    expectedAnswerId: 'opt_knight',
  },
];
