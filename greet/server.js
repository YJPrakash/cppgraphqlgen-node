const express = require("express");
// const { graphqlHTTP } = require("express-graphql");
const { createHandler } = require("graphql-http/lib/use/express") // CommonJS
const { ruruHTML } = require("ruru/server")

const { buildSchema, GraphQLSchema } = require('graphql');
const cppgraphql = require("./build/Release/greet.node");

const fs = require('fs');
const path = require('path');

// Initialize C++ service
const schemaSDL = fs.readFileSync(path.resolve( __dirname, '../schema.greet.graphql')).toString();
const schema = buildSchema(schemaSDL);

cppgraphql.startService();

// const cppSchema = cppgraphql.getSchema();
// const schema = new GraphQLSchema(cppSchema);

// const cppSchema = cppgraphql.getSchemaSDL();
// console.log(cppSchema);
// const schema = buildSchema(cppSchema);


// Define a custom resolver
const customResolver = ({ query, variables, operationName }) => {
    // return Promise.resolve(JSON.parse(cppgraphql.fetchQuery(query, operationName || "", variables || "")));
    try {
        // console.log(query || "")
        // console.log(variables || "")
        // console.log(operationName || "")
        const result = cppgraphql.fetchQuery(query, operationName || "", variables || "");
        return JSON.parse(result); // Return parsed JSON
    } catch (e) {
        // console.error(e);
        return {error: e.message}
    }

};

// // GraphQL Middleware
// const graphqlMiddleware = graphqlHTTP((req) => ({
//     customExecuteFn: ({ document, variables, operationName }) =>
//         customResolver({ query: document.loc.source.body, variables, operationName }),
//     graphiql: false,
//     // schema: new GraphQLSchema(), // Schema is dynamically handled by cppgraphqlgen
//     // schema, // Schema is dynamically handled by cppgraphqlgen
//     // customFormatErrorFn: customResolver,
//     // rootValue: null,
// }));

const app = express();
// app.use("/graphql", graphqlMiddleware);
// Serve the GraphiQL IDE.
app.use(
    "/graphql",
    createHandler({
        execute: ({ document, variables, operationName }) => {
            return customResolver({
                query: document.loc.source.body, 
                variables, 
                operationName
            });
        },
        schema,
    })
)
app.get("/", (_req, res) => {
    res.type("html")
    res.end(ruruHTML({ endpoint: "/graphql" }))
})
// app.use('/graphiql', express.static(path.resolve(__dirname, 'node_modules/graphiql'), {}));

// app.get('/', (req, res) => {
//     console.log(req.url);
//     res.send(`<!DOCTYPE html>
// <html lang="en">
// <head>
// <meta charset="UTF-8">
// <meta name="viewport" content="width=device-width, initial-scale=1.0">
// <title>GraphiQL Interface</title>
// <link href="graphiql/graphiql.min.css" rel="stylesheet" />
// <style>
//     body {
//     margin: 0;
//     height: 100vh;
//     display: flex;
//     flex-direction: column;
//     }
//     #graphiql {
//     flex: 1;
//     }
// </style>
// </head>
// <body>
// <div id="graphiql">Loading...</div>

// <script crossorigin type=module src="graphiql/graphiql.min.js"></script>
// <script type=module>
//     import {GraphiQL} from './graphiql/graphiql.min.js';
//     // Define the fetcher function to interact with your GraphQL API
//     function graphQLFetcher(graphQLParams) {
//         return fetch('/graphql', { // Replace with your GraphQL endpoint
//             method: 'POST',
//             headers: {
//             'Content-Type': 'application/json',
//             },
//             body: JSON.stringify(graphQLParams),
//         })
//         .then(response => response.json())
//         .catch(error => {
//             console.error('Error fetching GraphQL data:', error);
//             return { errors: [{ message: 'Error fetching data.' }] };
//         });
//     }

//     // Initialize GraphiQL with the fetcher
//     const graphiql = GraphiQL.createGraphiQLFetcher({ url: '/graphql' });

//     ReactDOM.render(
//     React.createElement(GraphiQL, {
//         fetcher: graphiql
//     }),
//     document.getElementById('graphiql')
//     );
// </script>
// </body>
//     </html>`);
// })

// Start the server
const PORT = 4000;
app.listen(PORT, () => {
    console.log(`GraphQL API available at http://localhost:${PORT}/graphql`);
});

// Cleanup on exit
process.on("SIGINT", () => {
    cppgraphql.stopService();
    process.exit();
});
