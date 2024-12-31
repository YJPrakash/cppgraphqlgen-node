const addon = require('./build/Release/greet.node');
const { buildSchema, GraphQLSchema } = require('graphql');
// console.log(addon.startService());
const cppSchema = addon.startService();
// console.log(cppSchema);
const schema = new GraphQLSchema(cppSchema);
// console.log(schema);

let result = addon.fetchQuery(`
{ 
    hello {
        greet
    }
    greetmsg 
}
`, '', '');
result = JSON.parse(result)
console.log(result.data);

addon.stopService();