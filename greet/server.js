const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const { buildSchema, GraphQLSchema } = require('graphql');
const addon = require("./build/Release/greet.node");

// const fs = require('fs');
// const path = require('path');

// Initialize C++ service
// const schema = fs.readFileSync(path.resolve( __dirname, '../schema.greet.graphql')).toString();
// const schema = buildSchema(addon.getSchema());

// addon.startService();

// const {getSchema} = addon;

const cppSchema = addon.startService();

const schema = new GraphQLSchema(cppSchema);

// Define a custom resolver
const customResolver = ({ query, variables, operationName }) => {
    try {
        console.log(variables || "")
        console.log(operationName || "")
        const result = addon.fetchQuery(query, operationName || "", variables || "");
        return JSON.parse(result); // Return parsed JSON
    } catch (e) {
        // console.error(e);
        return {error: e.message}
    }
};

// GraphQL Middleware
const graphqlMiddleware = graphqlHTTP((req) => ({
    schema: schema, // Schema is dynamically handled by cppgraphqlgen
    // customFormatErrorFn: customResolver,
    customExecuteFn: ({ document, variables, operationName }) =>
        customResolver({ query: document.loc.source.body, variables, operationName }),
    rootValue: null,
    graphiql: true,
}));

const app = express();
app.use("/graphql", graphqlMiddleware);

// Start the server
const PORT = 4000;
app.listen(PORT, () => {
    console.log(`GraphQL API available at http://localhost:${PORT}/graphql`);
});

// Cleanup on exit
process.on("SIGINT", () => {
    addon.stopService();
    process.exit();
});
