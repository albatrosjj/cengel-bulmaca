export interface Word {
  number: number;
  direction: 'across' | 'down';
  row: number;
  col: number;
  answer: string;
  clue: string;
}

export interface Puzzle {
  id: string;
  title: string;
  size: number;
  words: Word[];
}

export const puzzle1: Puzzle = {
  id: 'tarih-11-unite-1-2',
  title: '11. Sinif Tarih - Unite 1-2',
  size: 15,
  words: [
    { number: 1, direction: 'across', row: 7, col: 3, answer: 'TANZIMAT', clue: 'Osmanli\'da batili anlamda duzenleme getiren ferman donemi' },
    { number: 2, direction: 'down', row: 5, col: 10, answer: 'ISTIKLAL', clue: 'Bagimsizlik, bir baska devlete bagli olmama durumu' },
    { number: 3, direction: 'across', row: 11, col: 4, answer: 'TEŞKILAT', clue: 'Belirli bir amac icin olusturulmus duzenli yapilanma' },
    { number: 4, direction: 'across', row: 8, col: 6, answer: 'HURRIYET', clue: 'Ozgurluk, kisinin istedigini yapabilme hakki' },
    { number: 5, direction: 'across', row: 10, col: 5, answer: 'OSMANLI', clue: 'Anadolu\'dan dunyaya yayilan buyuk imparatorlugun adi' },
    { number: 6, direction: 'down', row: 4, col: 4, answer: 'ISLAHAT', clue: '1856\'da hukuki esitlik saglayan duzenleme hareketi' },
    { number: 7, direction: 'down', row: 1, col: 9, answer: 'ANAYASA', clue: 'Devletin temel hukuk kurallarini iceren belge' },
    { number: 8, direction: 'across', row: 3, col: 8, answer: 'PADISAH', clue: 'Osmanli devletinin en yuksek yoneticisinin unvani' },
    { number: 9, direction: 'across', row: 1, col: 6, answer: 'MUDAFAA', clue: 'Vatanin dusmanlara karsi korunmasi eylemi' },
    { number: 10, direction: 'across', row: 2, col: 8, answer: 'INKILAP', clue: 'Koklu ve ani degisim, toplumsal donusum' },
    { number: 11, direction: 'across', row: 4, col: 1, answer: 'ITTIHAK', clue: 'Birlesme, ayni amac etrafinda toplanma' },
    { number: 12, direction: 'across', row: 12, col: 6, answer: 'ESITLIK', clue: 'Herkesin ayni haklara sahip olma durumu' },
    { number: 13, direction: 'across', row: 9, col: 0, answer: 'FERMAN', clue: 'Padisahin halka yonelik resmi buyrugunun adi' },
    { number: 14, direction: 'across', row: 6, col: 1, answer: 'MECLIS', clue: 'Temsilcilerin bir araya geldigi karar organi' },
    { number: 15, direction: 'across', row: 7, col: 0, answer: 'SULTAN', clue: 'Osmanli hukumdari icin kullanilan bir diger unvan' },
    { number: 16, direction: 'down', row: 3, col: 14, answer: 'HALIFE', clue: 'Islam dunyasinin dini lideri unvani' },
    { number: 17, direction: 'down', row: 0, col: 1, answer: 'TEVHIT', clue: 'Birlestirme, tek cati altinda toplama' },
    { number: 18, direction: 'down', row: 8, col: 1, answer: 'DEVLET', clue: 'Belirli bir toprak parcasi uzerinde duzen saglayan kurum' },
    { number: 19, direction: 'across', row: 13, col: 0, answer: 'ITILAF', clue: 'Birbirine yardim sozu veren devletler grubu' },
    { number: 20, direction: 'down', row: 4, col: 12, answer: 'MILLET', clue: 'Ayni vatani paylasan insan toplulugu' },
    { number: 21, direction: 'down', row: 3, col: 13, answer: 'ADALET', clue: 'Hakki yerine getirme, dogruyu bulma erdemi' },
    { number: 22, direction: 'down', row: 8, col: 14, answer: 'EGITIM', clue: 'Bireyin bilgi ve beceri kazanmasini saglayan surec' },
    { number: 23, direction: 'across', row: 2, col: 1, answer: 'VATAN', clue: 'Vatandaslarin bagli oldugu topraklarin tumu' },
    { number: 24, direction: 'down', row: 3, col: 0, answer: 'SAVAS', clue: 'Devletler arasindaki silahli catsma durumu' },
    { number: 25, direction: 'across', row: 0, col: 1, answer: 'TARIH', clue: 'Gecmiste olup biten olaylarin bilimi' },
    { number: 26, direction: 'down', row: 8, col: 2, answer: 'ORDU', clue: 'Devletin askeri gucunu olusturan birliklerin tumu' },
  ],
};

export function buildGrid(puzzle: Puzzle): (string | null)[][] {
  const grid: (string | null)[][] = Array.from(
    { length: puzzle.size },
    () => Array(puzzle.size).fill(null)
  );
  for (const word of puzzle.words) {
    for (let i = 0; i < word.answer.length; i++) {
      const r = word.direction === 'across' ? word.row : word.row + i;
      const c = word.direction === 'across' ? word.col + i : word.col;
      grid[r][c] = word.answer[i];
    }
  }
  return grid;
}

export function getCellNumbers(puzzle: Puzzle): Map<string, number> {
  const map = new Map<string, number>();
  for (const word of puzzle.words) {
    const key = `${word.row},${word.col}`;
    if (!map.has(key)) {
      map.set(key, word.number);
    }
  }
  return map;
}
