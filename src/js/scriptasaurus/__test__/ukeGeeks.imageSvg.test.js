fdRequireJest.loadAll();

const imageSvg = fdRequire.require('scriptasaurus/ukeGeeks.imageSvg');

describe('scriptasaurus/ukeGeeks.imageSvg', () => {
  describe('toString', () => {
    const { toString } = imageSvg;
    it('should render SVG (Happy Path)', () => {
      const input = {
        type: 'image',
        dimensions: {
          height: 150,
          width: 100,
        },
        layers: [
          {
            type: 'group',
            name: 'fretboard',
            layers: [
              {
                type: 'line',
                endPoints: [
                  {
                    x: 42.8,
                    y: 25.8,
                  },
                  {
                    x: 42.8,
                    y: 125.8,
                  },
                ],
                style: null,
              },
              {
                type: 'line',
                endPoints: [
                  {
                    x: 62.8,
                    y: 25.8,
                  },
                  {
                    x: 62.8,
                    y: 125.8,
                  },
                ],
                style: null,
              },
              {
                type: 'line',
                endPoints: [
                  {
                    x: 22.8,
                    y: 45.8,
                  },
                  {
                    x: 82.8,
                    y: 45.8,
                  },
                ],
                style: null,
              },
              {
                type: 'line',
                endPoints: [
                  {
                    x: 22.8,
                    y: 65.8,
                  },
                  {
                    x: 82.8,
                    y: 65.8,
                  },
                ],
                style: null,
              },
              {
                type: 'line',
                endPoints: [
                  {
                    x: 22.8,
                    y: 85.8,
                  },
                  {
                    x: 82.8,
                    y: 85.8,
                  },
                ],
                style: null,
              },
              {
                type: 'line',
                endPoints: [
                  {
                    x: 22.8,
                    y: 105.8,
                  },
                  {
                    x: 82.8,
                    y: 105.8,
                  },
                ],
                style: null,
              },
              {
                type: 'rectangle',
                pos: {
                  x: 22.8,
                  y: 25.8,
                },
                width: 60,
                height: 100,
                style: null,
              },
            ],
            style: {
              fillColor: 'none',
              strokeColor: '#003366',
              strokeWidth: 1.6,
            },
          },
          {
            type: 'circle',
            center: {
              x: 22,
              y: 55,
            },
            radius: 8,
            style: {
              fillColor: '#ff0000',
            },
          },
          {
            type: 'text',
            pos: {
              x: 22,
              y: 60,
            },
            text: 1,
            style: {
              fillColor: '#ffffff',
              fontFamily: '9pt Arial Black,Arial',
            },
          },
          {
            type: 'circle',
            center: {
              x: 42,
              y: 55,
            },
            radius: 8,
            style: {
              fillColor: '#ff0000',
            },
          },
          {
            type: 'text',
            pos: {
              x: 42,
              y: 60,
            },
            text: 1,
            style: {
              fillColor: '#ffffff',
              fontFamily: '9pt Arial Black,Arial',
            },
          },
          {
            type: 'circle',
            center: {
              x: 62,
              y: 55,
            },
            radius: 8,
            style: {
              fillColor: '#ff0000',
            },
          },
          {
            type: 'text',
            pos: {
              x: 62,
              y: 60,
            },
            text: 1,
            style: {
              fillColor: '#ffffff',
              fontFamily: '9pt Arial Black,Arial',
            },
          },
          {
            type: 'circle',
            center: {
              x: 82,
              y: 75,
            },
            radius: 8,
            style: {
              fillColor: '#ff0000',
            },
          },
          {
            type: 'text',
            pos: {
              x: 82,
              y: 80,
            },
            text: 2,
            style: {
              fillColor: '#ffffff',
              fontFamily: '9pt Arial Black,Arial',
            },
          },
          {
            type: 'circle',
            center: {
              x: 82,
              y: 55,
            },
            radius: 8,
            style: {
              fillColor: '#ff0000',
            },
          },
          {
            type: 'text',
            pos: {
              x: 82,
              y: 60,
            },
            text: 1,
            style: {
              fillColor: '#ffffff',
              fontFamily: '9pt Arial Black,Arial',
            },
          },
          {
            type: 'text',
            pos: {
              x: 52,
              y: 20,
            },
            text: 'D7',
            style: {
              fontFamily: 'bold 14pt Arial',
              fillColor: '#000000',
            },
          },
        ],
      };

      const mockImg = {
        getData() {
          return input;
        },
      };

      const result = toString(mockImg).replace(/\s{2,}/g, ' ').replace(/\s+>/g, '>');

      const expectedResult = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 100 150" width="100px" height="150px">'
       + '<g id="fretboard" style="fill:none;stroke:#003366;stroke-width:1.6;">'
       + '<line x1="42.8" y1="25.8" x2="42.8" y2="125.8" />'
       + '<line x1="62.8" y1="25.8" x2="62.8" y2="125.8" />'
       + '<line x1="22.8" y1="45.8" x2="82.8" y2="45.8" />'
       + '<line x1="22.8" y1="65.8" x2="82.8" y2="65.8" />'
       + '<line x1="22.8" y1="85.8" x2="82.8" y2="85.8" />'
       + '<line x1="22.8" y1="105.8" x2="82.8" y2="105.8" />'
       + '<rect x="22.8" y="25.8" width="60" height="100" />'
       + '</g>'
       + '<circle cx="22" cy="55" r="8" style="fill:#ff0000;" />'
       + '<text x="22" y="60" style="fill:#ffffff;font:9pt Arial Black,Arial;text-anchor:middle;">1</text>'
       + '<circle cx="42" cy="55" r="8" style="fill:#ff0000;" />'
       + '<text x="42" y="60" style="fill:#ffffff;font:9pt Arial Black,Arial;text-anchor:middle;">1</text>'
       + '<circle cx="62" cy="55" r="8" style="fill:#ff0000;" />'
       + '<text x="62" y="60" style="fill:#ffffff;font:9pt Arial Black,Arial;text-anchor:middle;">1</text>'
       + '<circle cx="82" cy="75" r="8" style="fill:#ff0000;" />'
       + '<text x="82" y="80" style="fill:#ffffff;font:9pt Arial Black,Arial;text-anchor:middle;">2</text>'
       + '<circle cx="82" cy="55" r="8" style="fill:#ff0000;" />'
       + '<text x="82" y="60" style="fill:#ffffff;font:9pt Arial Black,Arial;text-anchor:middle;">1</text>'
       + '<text x="52" y="20" style="font:bold 14pt Arial;fill:#000000;text-anchor:middle;">D7</text>'
       + '</svg>';
      expect(result).toBe(expectedResult);
    });
  });
});
