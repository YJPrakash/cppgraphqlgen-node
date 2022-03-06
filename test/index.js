let cppgraphgl = require('../');
// hello graphql
cppgraphgl.startService();
let result = cppgraphgl.fetchQuery();
cppgraphgl.stopService();
console.log('cppgraphgl service resolved:', JSON.stringify(result, null, 4));
