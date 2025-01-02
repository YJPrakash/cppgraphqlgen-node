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
//     graphiql: true,
//     // schema: new GraphQLSchema(), // Schema is dynamically handled by cppgraphqlgen
//     // schema, // Schema is dynamically handled by cppgraphqlgen
//     // customFormatErrorFn: customResolver,
//     // rootValue: null,
// }));

const app = express();
// app.use("/graphql", graphqlMiddleware);
// Serve the GraphiQL IDE.
app.all(
    "/graphql",
    createHandler({
        execute: ({ schema, document, variables, operationName }) => {
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
