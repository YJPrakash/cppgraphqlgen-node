const addon = require('./build/Release/greet.node');

addon.startService();
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