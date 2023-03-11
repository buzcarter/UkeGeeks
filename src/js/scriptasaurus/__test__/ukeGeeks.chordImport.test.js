fdRequireJest.loadAll();

const chordImport = fdRequire.require('scriptasaurus/ukeGeeks.chordImport');

describe('scriptasaurus/ukeGeeks.chordImport', () => {
  describe('runLine', () => {
    const { runLine } = chordImport;
    it('should correctly parse valid strings (Happy Path)', () => {
      const tests = [{
        input: '{define: A frets 2 1 0 0 fingers 2 1 0 0}',
        expectedResult: {
          dots: [
            { finger: 2, fret: 2, string: 0 },
            { finger: 1, fret: 1, string: 1 },
          ],
          muted: [false, false, false, false],
          name: 'A',
        },
      }, {
        input: '{define: Am7 frets 0 0 0 0}',
        expectedResult: {
          dots: [],
          muted: [false, false, false, false],
          name: 'Am7',
        },
      }, {
        input: '{define: G#m6 frets 1 3 1 2 fingers 1 3 1 2 add: string 2 fret 1 finger 1 add: string 4 fret 1 finger 1}',
        expectedResult: {
          dots: [
            { finger: 1, fret: 1, string: 0 },
            { finger: 3, fret: 3, string: 1 },
            { finger: 1, fret: 1, string: 2 },
            { finger: 2, fret: 2, string: 3 },
            { finger: 1, fret: 1, string: 1 },
            { finger: 1, fret: 1, string: 3 },
          ],
          muted: [false, false, false, false],
          name: 'G#m6',
        },
      }, {
        input: '{define: D5 frets 2 2 X X fingers 1 1 2 2}',
        expectedResult: {
          dots: [
            { finger: 1, fret: 2, string: 0 },
            { finger: 1, fret: 2, string: 1 },
          ],
          muted: [false, false, true, true],
          name: 'D5',
        },
      }];

      tests.forEach(({ input, expectedResult }) => {
        const result = runLine(input);
        expect(result).toEqual(expectedResult);
      });
    });
  });

  describe('runBlock', () => {
    const { runBlock } = chordImport;
    it('should parse complete instrument defintion (Happy Path)', () => {
      const input = `
{instrument: Soprano Ukulele}
{tuning: G C E A}

{define: B7sus4 frets 2 4 2 2 fingers 1 3 1 1 add: string 2 fret 2 finger 1}

{define: C-F frets 2 0 1 3}

`;
      const result = runBlock(input);
      const expectedResult = {
        key: 'soprano-ukulele-g-c-e-a',
        name: 'Soprano Ukulele',
        tuning: ['G', 'C', 'E', 'A'],
        chords: [{
          dots: [
            { finger: 1, fret: 2, string: 0 },
            { finger: 3, fret: 4, string: 1 },
            { finger: 1, fret: 2, string: 2 },
            { finger: 1, fret: 2, string: 3 },
            { finger: 1, fret: 2, string: 1 },
          ],
          muted: [false, false, false, false],
          name: 'B7sus4',
        }, {
          dots: [
            { finger: 0, fret: 2, string: 0 },
            { finger: 0, fret: 1, string: 2 },
            { finger: 0, fret: 3, string: 3 },
          ],
          muted: [false, false, false, false],
          name: 'C-F',
        },
        ],
      };
      expect(result).toEqual(expectedResult);
    });
  });
});
