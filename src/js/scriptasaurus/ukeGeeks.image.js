fdRequire.define('scriptasaurus/ukeGeeks.image', (require, module) => {
  /**
   * Stores, in an output-format agnostic manner, data for drawing images. Usage:
   * all methods are chainable except getData.
   * Limits: nested groups not supported; names are only available on groups, no unique checks.
   * @class image
   * @namespace ukeGeeks
   * @return {object}
   */
  class UGSImage {
    constructor() {
      this.__context = {
        root: {},
        layer: null,
        current: null,
      };
    }

    newImage(width, height) {
      const obj = {
        type: 'image',
        dimensions: {
          height,
          width,
        },
        layers: [],
      };

      this.__context.root = obj;
      this.__context.current = obj;

      return this;
    }

    __newLayer(obj) {
      if (!this.__context.current.layers) {
        return this;
      }

      obj.style = null;
      this.__context.current.layers.push(obj);
      if (obj.type && obj.type === 'group') {
        this.__context.current = obj;
      } else {
        this.__context.layer = obj;
      }
      return this;
    }

    newGroup(name) {
      this.__newLayer({
        type: 'group',
        name,
        layers: [],
      });
      this.__context.layer = null;
      return this;
    }

    endGroup() {
      this.__context.current = this.__context.root;
      // this.__context.layer = this.__context.current;
      return this;
    }

    circle(centerX, centerY, radius) {
      return this.__newLayer({
        type: 'circle',
        center: {
          x: centerX,
          y: centerY,
        },
        radius,
      });
    }

    rectangle(x, y, width, height) {
      return this.__newLayer({
        type: 'rectangle',
        pos: {
          x,
          y,
        },
        width,
        height,
      });
    }

    line(x0, y0, x1, y1) {
      return this.__newLayer({
        type: 'line',
        endPoints: [{
          x: x0,
          y: y0,
        }, {
          x: x1,
          y: y1,
        }],
      });
    }

    hLine(x, y, length) {
      return this.line(x, y, x + (length || 1), y);
    }

    vLine(x, y, length) {
      return this.line(x, y, x, y + (length || 1));
    }

    text(x, y, text) {
      return this.__newLayer({
        type: 'text',
        pos: {
          x,
          y,
        },
        text,
      });
    }

    style(options) {
      const target = this.__context.layer ? this.__context.layer : this.__context.current;
      if (!target || target.style) {
        return this;
      }

      target.style = options;
      return this;
    }

    getData() {
      return this.__context.root;
    }
  }

  module.exports = {
    image: UGSImage,
  };
});
