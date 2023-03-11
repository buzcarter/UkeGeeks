fdRequireJest.loadAll();

const cpmParser = fdRequire.require('scriptasaurus/ukeGeeks.cpmParser');

describe('scriptasaurus/ukeGeeks.cpmParser', () => {
  describe.skip('init', () => {
    const { init } = cpmParser;
    it('should (Happy Path)', () => {
      expect(init).toBeUndefined();
    });
  });

  describe('parse', () => {
    const { parse } = cpmParser;
    it('should (Happy Path)', () => {
      const input = `
{title: Basic Info Test}
{album: Album Title (1974)}
{artist: Ray Bradbury}
{subtitle: Monsters Who Once Were Men}
{st: This has 2 Subtitles}
`;
      const results = parse(input);
      const expectedResult = {
        album: 'Album Title (1974)',
        artist: 'Ray Bradbury',
        st: 'Monsters Who Once Were Men',
        st2: 'This has 2 Subtitles',
        title: 'Basic Info Test',
      };
      expect(results).toEqual(expect.objectContaining(expectedResult));
    });
  });

  describe('stripHtml', () => {
    const { __test__: { stripHtml } } = cpmParser;

    it('should (Happy Path)', () => {
      const input = `
<h1>Sample</h1>

<pre>
My Preformatted Stuff

Here
</pre>

and then <!-- ignored all this --> i finish with

<pre>

one more block
</pre>
<!-- and a comment -->
`;
      const result = stripHtml(input);
      const expectedResult = `
<h1>Sample</h1>


My Preformatted Stuff

Here


and then  i finish with



one more block


`;
      expect(result).toBe(expectedResult);
    });
  });
});
