let cppgraphgl = require('../');
// hello graphql
cppgraphgl.startService();
(async ()=> {

    let result = await cppgraphgl.fetchQuery(`
    {hello}
    `, "", "");
    console.log('cppgraphgl service resolved:', result);
    cppgraphgl.stopService();
})()
