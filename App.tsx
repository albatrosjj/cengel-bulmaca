import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import {
  StyleSheet, View, Text, TouchableOpacity, Dimensions,
  TextInput, ScrollView, SafeAreaView, KeyboardAvoidingView,
  Platform, Alert
} from 'react-native';
import { puzzle1, buildGrid, getCellNumbers, Word, Puzzle } from './constants/puzzles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_PADDING = 16;
const CELL_SIZE = Math.floor((SCREEN_WIDTH - GRID_PADDING * 2) / puzzle1.size);

function turkishUpper(str: string): string {
  return str
    .replace(/i/g, 'İ')
    .replace(/ı/g, 'I')
    .replace(/ç/g, 'Ç')
    .replace(/ğ/g, 'Ğ')
    .replace(/ö/g, 'Ö')
    .replace(/ş/g, 'Ş')
    .replace(/ü/g, 'Ü')
    .toUpperCase();
}

export default function App() {
  const [screen, setScreen] = useState<'home' | 'game'>('home');

  if (screen === 'home') {
    return <HomeScreen onStart={() => setScreen('game')} />;
  }
  return <GameScreen onBack={() => setScreen('home')} />;
}

function HomeScreen({ onStart }: { onStart: () => void }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.homeContent}>
        <Text style={styles.title}>ÇENGEL BULMACA</Text>
        <Text style={styles.subtitle}>11. Sınıf Tarih</Text>
        <Text style={styles.description}>PDF ders kitabından hazırlanmış tarih kelimeleri ile zihin jimnastiği yap!</Text>
        <TouchableOpacity style={styles.button} onPress={onStart}>
          <Text style={styles.buttonText}>OYNA</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function GameScreen({ onBack }: { onBack: () => void }) {
  const puzzle = puzzle1;
  const solutionGrid = useMemo(() => buildGrid(puzzle), [puzzle]);
  const cellNumbers = useMemo(() => getCellNumbers(puzzle), [puzzle]);

  const [userGrid, setUserGrid] = useState<(string | null)[][]>(
    Array.from({ length: puzzle.size }, () => Array(puzzle.size).fill(null))
  );
  const [selected, setSelected] = useState({ row: 7, col: 3 });
  const [direction, setDirection] = useState<'across' | 'down'>('across');
  const [inputKey, setInputKey] = useState(0);
  const inputRef = useRef<TextInput>(null);

  const activeWord = useMemo(() => {
    return puzzle.words.find(w => {
      if (w.direction !== direction) return false;
      if (w.direction === 'across') {
        return w.row === selected.row && selected.col >= w.col && selected.col < w.col + w.answer.length;
      }
      return w.col === selected.col && selected.row >= w.row && selected.row < w.row + w.answer.length;
    });
  }, [selected, direction, puzzle.words]);

  const isCompleted = useMemo(() => {
    for (let r = 0; r < puzzle.size; r++) {
      for (let c = 0; c < puzzle.size; c++) {
        if (solutionGrid[r][c] !== null && userGrid[r][c] !== solutionGrid[r][c]) {
          return false;
        }
      }
    }
    return true;
  }, [userGrid, solutionGrid, puzzle.size]);

  useEffect(() => {
    if (isCompleted) {
      Alert.alert('Tebrikler!', 'Bulmacayı başarıyla tamamladınız!');
    }
  }, [isCompleted]);

  const isInActiveWord = useCallback((r: number, c: number) => {
    if (!activeWord) return false;
    if (activeWord.direction === 'across') {
      return r === activeWord.row && c >= activeWord.col && c < activeWord.col + activeWord.answer.length;
    }
    return c === activeWord.col && r >= activeWord.row && r < activeWord.row + activeWord.answer.length;
  }, [activeWord]);

  const getNextCell = useCallback((r: number, c: number, dir: 'across' | 'down') => {
    let nr = r, nc = c;
    if (dir === 'across') nc++; else nr++;
    while (nr < puzzle.size && nc < puzzle.size) {
      if (solutionGrid[nr][nc] !== null) return { row: nr, col: nc };
      if (dir === 'across') nc++; else nr++;
    }
    return null;
  }, [solutionGrid, puzzle.size]);

  const getPrevCell = useCallback((r: number, c: number, dir: 'across' | 'down') => {
    let nr = r, nc = c;
    if (dir === 'across') nc--; else nr--;
    while (nr >= 0 && nc >= 0) {
      if (solutionGrid[nr][nc] !== null) return { row: nr, col: nc };
      if (dir === 'across') nc--; else nr--;
    }
    return null;
  }, [solutionGrid]);

  const handleCellPress = useCallback((r: number, c: number) => {
    if (selected.row === r && selected.col === c) {
      setDirection(prev => prev === 'across' ? 'down' : 'across');
    } else {
      setSelected({ row: r, col: c });
    }
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [selected]);

  const handleTextChange = useCallback((text: string) => {
    if (!text) return;
    const char = turkishUpper(text.slice(-1));
    if (!/^[A-ZÇĞİÖŞÜ]$/.test(char)) {
      setInputKey(k => k + 1);
      return;
    }

    const newGrid = userGrid.map(row => [...row]);
    newGrid[selected.row][selected.col] = char;
    setUserGrid(newGrid);
    setInputKey(k => k + 1);

    const next = getNextCell(selected.row, selected.col, direction);
    if (next) {
      setSelected(next);
    }
  }, [selected, direction, userGrid, getNextCell]);

  const handleKeyPress = useCallback(({ nativeEvent }: any) => {
    if (nativeEvent.key === 'Backspace') {
      const newGrid = userGrid.map(row => [...row]);
      if (userGrid[selected.row][selected.col]) {
        newGrid[selected.row][selected.col] = null;
        setUserGrid(newGrid);
      } else {
        const prev = getPrevCell(selected.row, selected.col, direction);
        if (prev) {
          newGrid[prev.row][prev.col] = null;
          setUserGrid(newGrid);
          setSelected(prev);
        }
      }
    }
  }, [selected, direction, userGrid, getPrevCell]);

  const handleCluePress = useCallback((word: Word) => {
    setSelected({ row: word.row, col: word.col });
    setDirection(word.direction);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Text style={styles.backText}>&#8592; Geri</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{puzzle.title}</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.gridWrapper}>
            {Array.from({ length: puzzle.size }).map((_, r) => (
              <View key={r} style={styles.row}>
                {Array.from({ length: puzzle.size }).map((__, c) => {
                  const isBlack = solutionGrid[r][c] === null;
                  const isSel = selected.row === r && selected.col === c;
                  const inActive = isInActiveWord(r, c);
                  const val = userGrid[r][c];
                  const num = cellNumbers.get(`${r},${c}`);
                  const isCorrect = val && val === solutionGrid[r][c];
                  const isWrong = val && val !== solutionGrid[r][c];

                  return (
                    <TouchableOpacity
                      key={c}
                      activeOpacity={0.6}
                      onPress={() => handleCellPress(r, c)}
                      disabled={isBlack}
                      style={[
                        styles.cell,
                        { width: CELL_SIZE, height: CELL_SIZE },
                        isBlack && styles.blackCell,
                        inActive && styles.activeCell,
                        isSel && styles.selectedCell,
                      ]}
                    >
                      {num ? <Text style={styles.cellNumber}>{num}</Text> : null}
                      {!isBlack && (
                        <Text style={[
                          styles.cellText,
                          isCorrect && styles.correctText,
                          isWrong && styles.wrongText,
                        ]}>
                          {val || ''}
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>

          <View style={styles.cluesContainer}>
            <Text style={styles.cluesTitle}>IPUÇLARI</Text>
            <View style={styles.clueColumns}>
              <View style={styles.clueCol}>
                <Text style={styles.clueDir}>Yatay</Text>
                <ScrollView style={{ maxHeight: 220 }} nestedScrollEnabled>
                  {puzzle.words.filter(w => w.direction === 'across').map(w => (
                    <TouchableOpacity key={`a-${w.number}`} onPress={() => handleCluePress(w)}>
                      <Text style={[
                        styles.clueItem,
                        activeWord?.number === w.number && activeWord?.direction === 'across' && styles.clueActive
                      ]}>
                        <Text style={styles.clueNum}>{w.number}.</Text> {w.clue}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              <View style={styles.clueCol}>
                <Text style={styles.clueDir}>Dikey</Text>
                <ScrollView style={{ maxHeight: 220 }} nestedScrollEnabled>
                  {puzzle.words.filter(w => w.direction === 'down').map(w => (
                    <TouchableOpacity key={`d-${w.number}`} onPress={() => handleCluePress(w)}>
                      <Text style={[
                        styles.clueItem,
                        activeWord?.number === w.number && activeWord?.direction === 'down' && styles.clueActive
                      ]}>
                        <Text style={styles.clueNum}>{w.number}.</Text> {w.clue}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </View>
        </ScrollView>

        <TextInput
          key={inputKey}
          ref={inputRef}
          style={styles.hiddenInput}
          autoCapitalize="characters"
          maxLength={1}
          onChangeText={handleTextChange}
          onKeyPress={handleKeyPress}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  homeContent: {
    flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24
  },
  title: {
    fontSize: 36, fontWeight: '900', color: '#f8fafc',
    letterSpacing: 2, textAlign: 'center', marginBottom: 8
  },
  subtitle: {
    fontSize: 20, fontWeight: '700', color: '#94a3b8', marginBottom: 12
  },
  description: {
    fontSize: 14, color: '#cbd5e1', textAlign: 'center', marginBottom: 32, paddingHorizontal: 20
  },
  button: {
    backgroundColor: '#3b82f6', paddingVertical: 16, paddingHorizontal: 48,
    borderRadius: 12, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 6
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '800', letterSpacing: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1e293b'
  },
  backBtn: { paddingVertical: 6, paddingHorizontal: 10 },
  backText: { color: '#60a5fa', fontSize: 16, fontWeight: '700' },
  headerTitle: { color: '#e2e8f0', fontSize: 16, fontWeight: '800', flexShrink: 1, textAlign: 'center' },
  scrollContent: { alignItems: 'center', paddingVertical: 16 },
  gridWrapper: {
    borderWidth: 2, borderColor: '#334155', borderRadius: 4, overflow: 'hidden',
    backgroundColor: '#020617'
  },
  row: { flexDirection: 'row' },
  cell: {
    backgroundColor: '#f8fafc', justifyContent: 'center', alignItems: 'center',
    borderWidth: 0.5, borderColor: '#94a3b8', position: 'relative'
  },
  blackCell: { backgroundColor: '#0f172a', borderColor: '#1e293b' },
  activeCell: { backgroundColor: '#bfdbfe' },
  selectedCell: { backgroundColor: '#60a5fa', borderColor: '#2563eb', borderWidth: 1.5 },
  cellNumber: {
    position: 'absolute', top: 1, left: 2, fontSize: 8, color: '#475569', fontWeight: '700'
  },
  cellText: { fontSize: CELL_SIZE * 0.55, fontWeight: '800', color: '#0f172a' },
  correctText: { color: '#16a34a' },
  wrongText: { color: '#dc2626' },
  cluesContainer: { width: '100%', paddingHorizontal: 16, marginTop: 20 },
  cluesTitle: { color: '#f8fafc', fontSize: 18, fontWeight: '800', marginBottom: 12 },
  clueColumns: { flexDirection: 'row', gap: 12 },
  clueCol: { flex: 1 },
  clueDir: { color: '#94a3b8', fontSize: 14, fontWeight: '700', marginBottom: 6, textTransform: 'uppercase' },
  clueItem: { color: '#cbd5e1', fontSize: 12, marginBottom: 8, lineHeight: 18 },
  clueNum: { color: '#60a5fa', fontWeight: '800' },
  clueActive: { color: '#facc15', fontWeight: '700' },
  hiddenInput: { position: 'absolute', top: -1000, opacity: 0, width: 1, height: 1 }
});
