const addon = require('./build/Release/greet.node');

addon.startService()
const cppSchema = addon.getSchema();
console.log(cppSchema);

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