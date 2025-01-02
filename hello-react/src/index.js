// import React from 'react';
// import ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';

import {GraphiQL} from 'graphiql';
import 'graphiql/graphiql.css';
// import { createGraphiQLFetcher } from '@graphiql/toolkit';
// import '@graphiql/react/css/index.css';

import './index.css';

// const fetcher = createGraphiQLFetcher({
//   url: 'http://localhost:4000/graphql', // Update with your endpoint
//   subscriptionUrl: 'ws://localhost:4000/graphql', // Update with your WebSocket endpoint
// });

// ReactDOM.render(
//   <GraphiQL fetcher={fetcher} />,
//   document.getElementById('root')
// );

window.cppgraphql.startService();

function fetchQuery (params) {
  const query = params.query;

  if (query === undefined) {
    return Promise.reject("undefined query!");
  }

  const operationName = params.operationName || "";
  const variables = params.variables ? JSON.stringify(params.variables) : "";

  console.log(`Query: ${query}`);
  console.log(`Operation: ${operationName}`);
  console.log(`Variables: ${variables}`);
  return Promise.resolve(JSON.parse(window.cppgraphql.fetchQuery(query, operationName, variables)));
  // return JSON.parse(window.cppgraphql.fetchQuery(query, operationName, variables));
  // return window.cppgraphql.fetchQuery(query, operationName, variables)
  //   .then(response => JSON.parse(response));
}

// ReactDOM.render(<GraphiQL fetcher={fetchQuery} />, document.getElementById('root'));

const root = createRoot(document.getElementById('root'));
root.render(<GraphiQL fetcher={fetchQuery} />);

