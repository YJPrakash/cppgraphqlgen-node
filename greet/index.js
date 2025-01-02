const addon = require('./build/Release/greet.node');
const { buildSchema, GraphQLSchema, graphql } = require('graphql');

addon.startService();
const cppSchema = addon.getSchemaSDL()
const schema = buildSchema(cppSchema)
console.log(schema);

let result = addon.fetchQuery(`
{ 
    hello {
        greet
    }
    greetmsg 
}
`, '', '');
// console.log(new GraphQLSchema(addon.getSchema()))

result = JSON.parse(result)
console.log(result.data);

addon.stopService();