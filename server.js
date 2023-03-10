const { join } = require('path');
const { ResponseExposePaths } = require('./ugsphp/configs/server.json');
const express = require('express');
const expressState = require('express-state');
const http = require('http');
const serveStatic = require('serve-static');
const swig = require('swig');

const PORT = 3000;

const app = express();
const isDevelopment = app.get('env') === 'development';

// setup Swig
swig.setDefaults({
  cache: false,
});
app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', join(__dirname, 'ugsphp/views'));

// add my middleware
const middleware = require('./ugsphp/middleware');
app.use(middleware.logger);
app.use(middleware.layout);

// add res.locals & `state` for client
expressState.extend(app);
app.set('state namespace', ResponseExposePaths.ROOT);

// add global state values
app.locals.config = {
  meta: {
    titleSuffix: '| UkeGeeks',
    ogDescription: 'UkeGeeks is where we toil',
  },
};

app.expose({
  app: 'ourWorkshop',
});

// serve scripts, images, fonts, and styles from my assets directory automatically
const root = join(__dirname, './');
app.use(serveStatic(join(root, 'assets'), {
  maxAge: 0,
}));
if (isDevelopment) {
  // eslint-disable-next-line no-console
  console.log('Serving dev sources enabled');
  app.use(express.static(join(root, 'src')));
}

// add my routes
const routes = require('./ugsphp/configs/routes.json');
const builders = require('./ugsphp/builders');

Object.keys(routes)
  .map((name) => {
    const { controller, path } = routes[name];
    return {
      name,
      controllerName: controller,
      controller: builders[controller],
      path,
    };
  })
  .forEach(({
    name, controller, controllerName, path,
  }) => {
    // eslint-disable-next-line no-console
    console.info(`Added ${name} definition: "${path}" uses controller "controllers.${controllerName}"`);
    app.get(path, controller);
  });

// connect express to to http
http.createServer(app)
  .listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Listening on port ${PORT} (${isDevelopment ? 'Development' : 'Production'})`);
  });
