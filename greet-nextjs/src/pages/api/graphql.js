// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

// import path from 'path';
// console.log("greet.node location =>", path.resolve(__dirname, './greet.node'));
// const cppgraphql = require(path.resolve(__dirname, './greet.node'));
const cppgraphql = require('./cppgraphql.node');

cppgraphql.startService();

export default function handler(req, res) {
    const {query, operationName, variables} = req.body;
    res.status(200).json(JSON.parse(cppgraphql.fetchQuery(query, operationName || "", variables || "")));
}

// Cleanup on exit
process.on("SIGINT", () => {
    cppgraphql.stopService();
    // process.exit();
});