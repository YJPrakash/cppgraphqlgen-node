let cppgraphgl = require('../');
// hello graphql
cppgraphgl.startService();
let result = cppgraphgl.fetchQuery(`
query{
    hello{
        greet
    }
    greetmsg
}
`, "", "");
console.log('cppgraphgl service resolved:', result);
cppgraphgl.stopService();
