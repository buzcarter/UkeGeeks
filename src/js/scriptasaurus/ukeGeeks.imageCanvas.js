fdRequire.define('ukeGeeks/imageCanvas', (require, module) => {
/**
 * Converts image JSON data to a Canvas element
 * @class  imageCanvas
 * @namespace ukeGeeks
 */
  function addCanvas(element, width, height) {
    const canvas = document.createElement('canvas');
    if (!canvas) {
      // console.log('error adding canvas');
      return null;
    }

    element.appendChild(canvas);
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      // console.log('error getting canvas context');
      return null;
    }
    return ctx;
  }

  function renderText(ctx, layer, style) {
    if (!ctx.fillText) {
      return; // IE check
    }

    ctx.font = style.fontFamily || '9pt Arial';
    ctx.textAlign = style.textAlign || 'center';
    ctx.fillStyle = style.fillColor || style.color || 'black';
    ctx.fillText(layer.text, layer.pos.x, layer.pos.y);
  }

  function renderCircle(ctx, layer, style) {
    ctx.beginPath();

    ctx.arc(layer.center.x, layer.center.y, layer.radius, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fillStyle = style.fillColor || 'black';

    ctx.fill();
  }

  function renderLine(ctx, layer, style) {
    ctx.beginPath();
    ctx.moveTo(layer.endPoints[0].x, layer.endPoints[0].y);
    ctx.lineTo(layer.endPoints[1].x, layer.endPoints[1].y);

    ctx.strokeStyle = style.strokeColor || 'black';
    ctx.lineWidth = style.strokeWidth || 1;
    ctx.stroke();

    ctx.closePath();
  }

  function renderRectangle(ctx, layer, style) {
    ctx.beginPath();

    ctx.rect(layer.pos.x, layer.pos.y, layer.width, layer.height);

    ctx.strokeStyle = style.strokeColor || 'black';
    ctx.lineWidth = style.strokeWidth || 1;
    ctx.stroke();

    ctx.closePath();
  }

  function merge(o) {
    const newObject = {};
    for (let i = 0; i < arguments.length; i++) {
      if (!arguments[i] || typeof arguments[i] !== 'object') {
        continue;
      }

      const obj = arguments[i];
      for (const attrname in obj) {
        newObject[attrname] = obj[attrname];
      }
    }
    return newObject;
  }

  function render(ctx, layer, parentStyle) {
    const style = merge(layer.style, parentStyle);
    switch (layer.type) {
      case 'line':
        renderLine(ctx, layer, style);
        break;
      case 'circle':
        renderCircle(ctx, layer, style);
        break;
      case 'rectangle':
        renderRectangle(ctx, layer, style);
        break;
      case 'text':
        renderText(ctx, layer, style);
        break;
    }
  }

  function renderLayers(ctx, layers, parentStyle) {
    let layer;
    let style;
    for (let i = 0; i < layers.length; i++) {
      layer = layers[i];
      if (layer.type === 'group') {
        renderLayers(ctx, layer.layers, layer.style);
      } else {
        render(ctx, layer, parentStyle || null);
      }
    }
  }

  function process(element, image) {
    const data = image.getData();
    const ctx = addCanvas(element, data.dimensions.width, data.dimensions.height);
    if (!ctx) {
      return false;
    }

    renderLayers(ctx, data.layers);
    return ctx;
  }

  module.exports = {
    appendChild: process,
  };
});
