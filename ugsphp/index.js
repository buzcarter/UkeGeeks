const { join } = require('path');
const express = require('express');
const middleware = require('./middleware');
const routes = require('./configs/routes.json');
const router = require('./startUp/router');
const nunjucks = require('nunjucks');
const DEFAULT_PORT = 3000;

function configureViewEngine(app) {
  const viewsPath = join(__dirname, './views');
  nunjucks.configure(viewsPath, {
    autoescape: true,
    express: app,
  });
  app.set('view engine', 'html');
}

function main() {
  const app = express();

  app.disable('x-powered-by');

  configureViewEngine(app);

  app.use(express.static(join(__dirname, '../assets')));
  app.use(express.static(join(__dirname, '../src')));

  app.use(middleware.requestLogger);
  app.use(middleware.poweredBy);

  router.loadRoutes(app, routes);

  const port = process.env.PORT || DEFAULT_PORT;
  // eslint-disable-next-line no-console
  app.listen(port, () => console.log(`UkeGeeksServer listening on port ${port}`));
}

main();
