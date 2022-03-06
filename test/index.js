let cppgraphgl = require('../');
// hello graphql
cppgraphgl.startService();
let result = cppgraphgl.fetchQuery(`
{hello}
`, "", "");
console.log('cppgraphgl service resolved:', result);
cppgraphgl.stopService();
