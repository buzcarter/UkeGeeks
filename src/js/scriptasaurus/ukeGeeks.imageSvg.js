fdRequire.define('ukeGeeks/imageSvg', (require, module) => {
  function getStyle(type, style) {
    if (!style) {
      return null;
    }

    let s = '';
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
          s += `${property}:${value};`;
        }
      });

    if (type === 'text' && !style.textAlign) {
      s += 'text-anchor:middle;';
    }

    return s;
  }

  function render(layer) {
    let s = '';
    let style = getStyle(layer.type, layer.style);

    if (style) {
      style = ` style="${style}"`;
    }

    switch (layer.type) {
      case 'line':
        s = `<line  x1="${layer.endPoints[0].x}" y1="${layer.endPoints[0].y}"  x2="${layer.endPoints[1].x}" y2="${layer.endPoints[1].y}" ${style} />`;
        break;
      case 'circle':
        s = `<circle cx="${layer.center.x}" cy="${layer.center.y}" r="${layer.radius}" ${style} />`;
        break;
      case 'rectangle':
        s = `<rect x="${layer.pos.x}" y="${layer.pos.y}" width="${layer.width}" height="${layer.height}" ${style} />`;
        break;
      case 'text':
        s = `<text x="${layer.pos.x}" y="${layer.pos.y}" ${style}>${layer.text}</text>`;
        break;
    }
    return s;
  }

  function renderLayers(layers) {
    let s = '';
    let layer;
    let style;
    for (let i = 0; i < layers.length; i++) {
      layer = layers[i];
      if (layer.type === 'group') {
        style = getStyle('group', layer.style);
        s += `<g ${
          layer.name ? (`id="${layer.name}"`) : ''
        } style="${style}" `
          + `>${renderLayers(layer.layers, layer.style)}</g>`;
      } else {
        s += render(layer);
      }
    }
    return s;
  }

  function process(image) {
    return ('<?xml version="1.0" encoding="utf-8"?>'
      + '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" '
      + `viewBox="0 0 ${image.dimensions.width} ${image.dimensions.height}" `
      + `width="${image.dimensions.width}px" height="${image.dimensions.height}px">${
        renderLayers(image.layers)
      }</svg>`
    );
  }

  function toString(image) {
    return process(image.getData());
  }

  function appendChild(element, image, className) {
    const wrapper = document.createElement('span');
    if (className) {
      wrapper.setAttribute('class', className);
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
