export function copilotTyping(text) {
  const letters = typeof Intl.Segmenter === 'function'
    ? Array.from(new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(text), ({ segment }) => segment)
    : Array.from(text);
  const rhythm = [12, 8, 16, 10, 22, 9, 13, 17, 8];
  let total = 0;
  const keys = letters.map((letter, index) => {
    total += rhythm[index % rhythm.length] + (/[.!?]/.test(letter) && letters[index + 1] === ' ' ? 85 : /[, ]/.test(letter) ? 18 : 0);
    return total;
  });

  return { letters, keys, total };
}
