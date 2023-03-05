const builders = require('../builders');

module.exports = {
  loadRoutes(app, routes) {
    Object.keys(routes)
      .forEach((routeName) => {
        const { path, controller } = routes[routeName];
        const controllerFn = builders[controller];
        if (typeof controllerFn !== 'function' || controllerFn.length < 2) {
          throw new Error(`controller for "${routeName}" not a valid handler function`);
        }

        if (!path || typeof path !== 'string') {
          throw new Error(`path for "${routeName}" not a valid string`);
        }

        app.use(path, controllerFn);
        // eslint-disable-next-line no-console
        console.log(`Added ${routeName} route ("${path}")`);
      });
  },
};
