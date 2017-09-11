import express from 'express';
import React from 'react';
import ReactDOM from 'react-dom/server';
import { match, RouterContext } from 'react-router';
import { Provider } from 'react-redux';
import configureStore from './redux/configureStore.prod';
import routes from './routes';
import sessionsRoutes from './routes/sessionsRoutes';
import projectsRoutes from './routes/projectsRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import favicon from 'serve-favicon';
import path from 'path';
import bodyParser from 'body-parser';
import config from 'config';

const app = express();

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: false }));

if (process.env.NODE_ENV === 'production') {
  app.use(express.static('public'));
}

app.use(favicon(path.join('public', 'favicon.ico')));

app.use('/api/sessions', sessionsRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use((req, res) => {
  const store = configureStore();

  match({ routes, location: req.url }, (error, redirectLocation, renderProps) => {
    if (redirectLocation) {
      return res.redirect(301, redirectLocation.pathname + redirectLocation.search);
    }
    if (error) {
      return res.status(500).send(error.message);
    }
    if (!renderProps) {
      return res.status(404).send('Not found');
    }

    const componentHTML = ReactDOM.renderToString(
      <Provider store={store}>
        <RouterContext {...renderProps} />
      </Provider>
    );

    const state = store.getState();

    return res.end(renderHTML(componentHTML, state));
  });
});

const assetUrl = process.env.NODE_ENV !== 'production' ? 'http://localhost:8050/public' : '';
const clientSuffix = process.env.NODE_ENV === 'production' ? '-' : '';

function renderHTML(componentHTML, initialState) {
  return `
    <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Cucumber Runner</title>
        <link rel="stylesheet" href="${assetUrl}/assets/styles${clientSuffix}.css">
        <script type="application/javascript">
          window.REDUX_INITIAL_STATE = ${JSON.stringify(initialState)};
        </script>
      </head>
      <body>
        <div id="react-view">${componentHTML}</div>
        <div id="dev-tools"></div>
        <script type="application/javascript" src="${assetUrl}/assets/bundle${clientSuffix}.js"></script>
      </body>
    </html>
  `;
}

const PORT = process.env.PORT || config.get('port');

app.listen(PORT, () => {
  console.log(`Server listening on: ${PORT}`);
});
