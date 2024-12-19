const addon = require('./build/Release/greet.node');

addon.startService();
console.log(addon.fetchQuery(`
{ 
    hello {
        greet
    }
    greetmsg 
}
`), '', '')
addon.stopService();