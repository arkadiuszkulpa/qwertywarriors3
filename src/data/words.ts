export interface WordLists {
  easy: string[];
  medium: string[];
  hard: string[];
  expert: string[];
}

export const WORD_LISTS: WordLists = {
  easy: [
    'cat', 'dog', 'run', 'hit', 'sky', 'sun', 'red', 'big',
    'car', 'bus', 'top', 'new', 'old', 'hot', 'ice', 'fly',
    'map', 'box', 'cup', 'pen', 'key', 'bag', 'hat', 'bed',
    'ant', 'bee', 'cow', 'egg', 'fox', 'jam', 'log', 'nut',
    'owl', 'pie', 'rat', 'sea', 'tea', 'van', 'web', 'yak',
    'ape', 'bat', 'cub', 'den', 'elm', 'fig', 'gem', 'hen',
    'ink', 'jet', 'kit', 'lid', 'mud', 'nap', 'oar', 'paw',
    'ram', 'saw', 'tan', 'urn', 'vet', 'wax', 'yam', 'zip',
    'ace', 'bud', 'cap', 'dim', 'eve', 'fan', 'gap', 'hum',
    'ivy', 'jaw', 'keg', 'lap', 'mob', 'nod', 'oak', 'pod',
  ],

  medium: [
    'alpha', 'bravo', 'delta', 'gamma', 'ninja', 'robot',
    'storm', 'flame', 'ghost', 'laser', 'pixel', 'quest',
    'shield', 'sword', 'tower', 'virus', 'wizard', 'zombie',
    'arrow', 'blade', 'chain', 'drill', 'eagle', 'frost',
    'grape', 'hover', 'ivory', 'joker', 'karma', 'lemon',
    'metal', 'north', 'ocean', 'piano', 'quilt', 'river',
    'snake', 'tiger', 'ultra', 'vapor', 'whale', 'xenon',
    'yacht', 'zebra', 'amber', 'blaze', 'coral', 'drift',
    'ember', 'flock', 'gleam', 'haste', 'inlet', 'jolly',
    'kneel', 'lunar', 'maple', 'noble', 'orbit', 'prism',
  ],

  hard: [
    'captain', 'destroy', 'explode', 'fortress', 'general',
    'hazard', 'invader', 'justice', 'kingdom', 'liberty',
    'mission', 'nuclear', 'outpost', 'phantom', 'quantum',
    'reactor', 'soldier', 'thunder', 'uranium', 'vanguard',
    'warship', 'zephyr', 'ancient', 'beneath', 'chamber',
    'dormant', 'eclipse', 'furnace', 'gateway', 'horizon',
    'implant', 'journal', 'kinetic', 'lantern', 'marshal',
    'neutron', 'optimal', 'platoon', 'quarrel', 'rampart',
    'sentinel', 'triumph', 'uniform', 'voltage', 'warlord',
  ],

  expert: [
    'artillery', 'battalion', 'commander', 'devastate',
    'eliminate', 'firepower', 'grenadier', 'helicopter',
    'infiltrate', 'juggernaut', 'kilometer', 'lieutenant',
    'magnitude', 'neutralize', 'obliterate', 'paratrooper',
    'quicksand', 'reinforcement', 'stronghold', 'turbulence',
    'undertake', 'vigilante', 'wavelength', 'xenophobia',
  ],
};

export function getWordListForDifficulty(level: number): string[] {
  if (level <= 2) {
    return WORD_LISTS.easy;
  }
  if (level <= 5) {
    return [...WORD_LISTS.easy, ...WORD_LISTS.medium];
  }
  if (level <= 8) {
    return [...WORD_LISTS.medium, ...WORD_LISTS.hard];
  }
  return [...WORD_LISTS.hard, ...WORD_LISTS.expert];
}

export function getRandomWord(wordList: string[]): string {
  return wordList[Math.floor(Math.random() * wordList.length)];
}
