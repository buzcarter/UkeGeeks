fdRequire.define('fd-require-audit', (require, module) => {
  const fdRequire = require('fd-require');

  /**
   * Recursively traverses all required modules used by moduleName and its dependencies. Returns empty arrays when
   * name is not a non-zero length string.
   * @param {string} moduleName module or app name. Only required param for human invocation. Recursion includes the second two params. See example.
   * @param {[string]=} dependencies list of all required modules (mutates)
   * @param {[string]=} errors list of modules required but as-yet undefined (mutates)
   * @returns {object} the mutated `{ dependencies, modules }` object
   * @example const { dependencies, errors } = getDependencies('mySuperCoolModule');
   */
  function getDependencies(moduleName, dependencies, errors) {
    if (arguments.length < 3) {
      dependencies = [];
      errors = [];
    }

    if (!moduleName || typeof moduleName !== 'string') {
      return { dependencies, errors };
    }

    const moduleInfo = fdRequire.getModules()[moduleName];
    if (!moduleInfo) {
      errors.push(moduleName);
    } else if (!dependencies.includes(moduleName)) {
      dependencies.push(moduleName);
      moduleInfo.dependencies.forEach((name) => getDependencies(name, dependencies, errors));
    }

    return { dependencies, errors };
  }

  /* eslint-disable no-shadow, no-unused-expressions */
  function checkDependencies(moduleName, debugLog) {
    debugLog = debugLog && typeof debugLog.info === 'function' ? debugLog : null;

    const { dependencies, errors } = getDependencies(moduleName);
    debugLog && debugLog.info(`${moduleName} dependencies(${dependencies.length})`, dependencies);

    const modules = fdRequire.getModules();
    dependencies
      .map((name) => modules[name])
      .filter((module) => !module.loaded)
      .forEach((module) => errors.push(module.name));

    const ok = errors.length === 0;
    if (!ok) {
      const msg = `Cannot run ${moduleName || 'app'}, ${errors.length} module${errors.length > 1 ? 's' : ''} not loaded: ${errors.join(', ')}`;
      debugLog && debugLog.error(msg, modules);
      throw msg;
    }
    return ok;
  }
  /* eslint-enable no-shadow, no-unused-expressions */

  module.exports = {
    checkDependencies,
  };
});
