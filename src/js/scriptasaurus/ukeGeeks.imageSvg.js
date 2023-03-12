fdRequire.define('scriptasaurus/ukeGeeks.imageSvg', (require, module) => {
  function getStyle(type, style) {
    if (!style) {
      return null;
    }

    let result = '';
    let property;
    let value;

    Object.keys(style)
      .forEach((key) => {
        // if (!style.hasOwnProperty(key)) {
        //   return;
        // }

        value = style[key];
        switch (key) {
          case 'fillColor':
            property = 'fill';
            break;
          case 'fontFamily':
            property = 'font';
            break;
          case 'textAlign':
            property = 'text-anchor';
            switch (value) {
              case 'right':
                value = 'end';
                break;
              case 'left':
                value = 'start';
                break;
              default:
                value = 'middle';
            }
            break;
          case 'strokeColor':
            property = 'stroke';
            break;
          case 'strokeWidth':
            property = 'stroke-width';
            break;
          default:
            property = null;
        }

        if (property && value) {
          result += `${property}:${value};`;
        }
      });

    if (type === 'text' && !style.textAlign) {
      result += 'text-anchor:middle;';
    }

    return result;
  }

  function render(layer) {
    let result = '';
    let style = getStyle(layer.type, layer.style);
    style = style ? `style="${style}"` : '';

    switch (layer.type) {
      case 'line':
        result = `<line x1="${layer.endPoints[0].x}" y1="${layer.endPoints[0].y}" x2="${layer.endPoints[1].x}" y2="${layer.endPoints[1].y}" ${style} />`;
        break;
      case 'circle':
        result = `<circle cx="${layer.center.x}" cy="${layer.center.y}" r="${layer.radius}" ${style} />`;
        break;
      case 'rectangle':
        result = `<rect x="${layer.pos.x}" y="${layer.pos.y}" width="${layer.width}" height="${layer.height}" ${style} />`;
        break;
      case 'text':
        result = `<text x="${layer.pos.x}" y="${layer.pos.y}" ${style}>${layer.text}</text>`;
        break;
    }
    return result;
  }

  function renderLayers(layers) {
    return layers.reduce((s, layer) => {
      if (layer.type === 'group') {
        const { name } = layer;
        const style = getStyle('group', layer.style);
        s += `<g ${name ? (`id="${name}"`) : ''} style="${style}">${renderLayers(layer.layers, layer.style)}</g>`;
      } else {
        s += render(layer);
      }
      return s;
    }, '');
  }

  function process(image) {
    const { width, height } = image.dimensions;
    return ('<svg version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" '
      + `viewBox="0 0 ${width} ${height}" `
      + `width="${width}px" height="${height}px">`
      + `${renderLayers(image.layers)}</svg>`
    );
  }

  function toString(image) {
    return process(image.getData());
  }

  function appendChild(element, image, className) {
    const wrapper = document.createElement('span');
    if (className) {
      wrapper.classList.add(className);
    }
    wrapper.innerHTML = process(image.getData());
    element.appendChild(wrapper);
    return wrapper;
  }

  /**
   * @module
   * Converts image JSON data to SVG XML.
   * Limits: no checks for unique Ids.
   */
  module.exports = {
    toString,
    appendChild,
  };
});
