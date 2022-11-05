/* eslint-disable no-throw-literal */
window.fdRequire = (function () {
  const MODULE_NAME = 'fd-require';

  const modules = {};
  let currentModuleName;

  const Colors = Object.freeze({
    ALIAS: 'border-left: solid 4px lightseagreen; color: forestgreen; padding: 5px 10px;',
    APP: 'border-left: solid 4px purple; color: lightcoral; padding: 5px 10px;',
    DEFINE: 'border-left: solid 4px deepskyblue; color: cadetblue; padding: 5px 10px;',
    REQUIRE: 'border-left: solid 4px cornflowerblue; color: cornflowerblue; padding: 5px 10px;',
    SOURCE: 'color:darkseagreen;',
    WARNING: 'border-left: solid 4px pink; background-color: #fee8e9; color: #C03E32; padding: 5px 10px;',
  });

  let feedback;

  function newModule(name) {
    return {
      loaded: false,
      dependencies: [],
      name,
      exports: {},
    };
  }

  function addDependency(name) {
    const module = currentModuleName && modules[currentModuleName];
    if (!module) {
      return;
    }
    module.dependencies.push(name);
  }

  function require(name) {
    if (typeof name !== 'string' || name.length < 1) {
      throw `${MODULE_NAME}.require name must be a string${currentModuleName && `. Calling module "${currentModuleName}"`}`;
    }

    const source = currentModuleName ? `%c(source "${currentModuleName}")` : '';
    if (!modules[name]) {
      modules[name] = newModule(name);
      feedback(`%crequire: "${name}" (pending) ${source}`, Colors.REQUIRE, Colors.SOURCE);
    } else {
      feedback(`%crequire: "${name}" ${source}`, Colors.REQUIRE, Colors.SOURCE);
    }
    addDependency(name);
    return modules[name].exports || {};
  }

  function define(name, implementation) {
    if (typeof name !== 'string' || name.length < 1) {
      throw `${MODULE_NAME}.define name must be a string`;
    }
    if (typeof implementation !== 'function') {
      throw `${MODULE_NAME}.define implementation must be a function (module name "${name}")`;
    }

    let module = modules[name];
    if (!module) {
      feedback(`%cdefine "${name}"`, Colors.DEFINE);
      module = newModule(name);
      modules[name] = module;
    } else if (module.loaded) {
      throw `${MODULE_NAME}.define name "${name}" is already in use`;
    } else {
      feedback(`%cdefine updating "${name}" (deferred definition finalized)`, Colors.DEFINE);
    }

    currentModuleName = name;

    const tempModule = { ...module, exports: {} };
    implementation(require, tempModule, tempModule.exports);
    if (tempModule.exports && typeof tempModule.exports === 'object') {
      Object.assign(module.exports, tempModule.exports);
    } else {
      feedback(`%cmodule "${name}" exports a function. This is an experimental feature and should be used only with due caution`, Colors.WARNING);
      module.exports = tempModule.exports;
    }
    module.loaded = true;
    Object.freeze(module);

    currentModuleName = null;

    return module;
  }

  function alias(name, source) {
    if (typeof name !== 'string' || name.length < 1) {
      throw `${MODULE_NAME}.alias name must be a string`;
    }
    if (!source) {
      throw `${MODULE_NAME}.alias source is required (module name "${name}")`;
    }

    let module = modules[name];
    if (module) {
      if (module.loaded) {
        throw `${MODULE_NAME}.alias name "${name}" is already in use`;
      } else {
        throw `${MODULE_NAME}.aliases must be defined before being required (name "${name}")`;
      }
    }

    module = Object.freeze({
      ...newModule(name),
      exports: source,
      loaded: true,
    });

    modules[name] = module;

    feedback(`%calias "${name}" created`, Colors.ALIAS);

    return module;
  }

  function app(name, implementation) {
    if (typeof name !== 'string' || name.length < 1) {
      throw `${MODULE_NAME}.app name must be a string`;
    }
    if (typeof implementation !== 'function') {
      throw `${MODULE_NAME}.app implementation must be a function (app "${name}")`;
    }
    if (modules[name]) {
      throw `${MODULE_NAME}.app name "${name}" is already in use`;
    }

    feedback(`%capp "${name}"`, Colors.APP);
    currentModuleName = name;
    // eslint-disable-next-line no-shadow
    const app = Object.freeze(Object.assign(newModule(name), {
      loaded: true,
    }));
    modules[name] = app;
    implementation(require, app, app.exports);
    return app;
  }

  function getModules() {
    return modules;
  }

  function config(options) {
    const defaultOptions = {
      verbose: true,
    };
    options = { ...defaultOptions, ...options || {} };
    // eslint-disable-next-line no-console
    feedback = options.verbose ? console.log : () => {};
  }

  function autoRun(verbose) {
    const exports = Object.freeze({
      alias,
      app,
      config,
      define,
      require,
      getModules,
    });

    config({ verbose });
    // eslint-disable-next-line no-shadow
    define(MODULE_NAME, (require, module) => Object.assign(module.exports, exports));

    return exports;
  }

  return autoRun(false);
}());
