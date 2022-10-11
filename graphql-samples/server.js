const express = require('express');
const {
  graphqlHTTP
} = require('express-graphql');
const {
  buildSchema
} = require('graphql');
const {startService, fetchQuery, stopService} = require('../');

startService();
// const schema = buildSchema(`
//   type Query {
//     hello: String
//     friends(first: Int, after: String): [NewFriend]!
//   }
//   type Friend {
//     cname: String
//     isFriend: Boolean
//   }
//   type PageInfo {
//     startCurser: String
//     hasNextPage: Boolean
//   }
//   type FriendEdge {
//     node: Friend
//     curser: String
//   }
//   type NewFriend {
//     totalCount: String
//     edge: [FriendEdge]
//     pageInfo: PageInfo
//   }
// `);
// const _friends = [
//   { cname: "FL001", isFriend: true },
//   { cname: "PI003", isFriend: true },
//   { cname: "MO006", isFriend: true },
//   { cname: "SG002", isFriend: false },
//   { cname: "UN004", isFriend: true },
//   { cname: "IC005", isFriend: true },
// ]
// const root = {
//   hello() { return 'Hello world!' },
//   friends(args) {
//     console.log(args.first, args);
//     const { first, after: afterCursor } = args;
//     const data = _friends;

//     let afterIndex = 0

//     if (afterCursor) {

//       let nodeIndex = data.findIndex(datum => datum.cname === afterCursor)

//       if (nodeIndex >= 0) {

//         afterIndex = nodeIndex + 1

//       }

//     }
//     console.log(afterIndex, afterCursor);
//     const slicedData = data.slice(afterIndex, afterIndex + first)

//     const edges = slicedData.map(node => ({

//       node,

//       cursor: node.cname

//     }))

//     let startCursor = null;
//     console.log(edges);

//     if (edges.length > 0) {

//       startCursor = edges[edges.length - 1].node

//     }

//     let hasNextPage = data.length > afterIndex + first;
//     console.log(hasNextPage);

//     return [
//       {
//         totalCount: data.length,
//         edge: edges,
//         pageInfo: {
//           startCursor,
//           hasNextPage
//         }
//       }
//     ];

//   }
// };
const schema = buildSchema(require('node:fs').readFileSync('../schema.greet.graphql').toString());
const root = {
  hello() {
    const { hello } = JSON.parse(fetchQuery(require('node:fs').readFileSync('../query.greet.graphql').toString(), "", "")).data;
    return hello;
  },
  greetmsg() {
  const { greetmsg } = JSON.parse(fetchQuery(require('node:fs').readFileSync('../query.greet.graphql').toString(), "", "")).data;
    return greetmsg;
  }
}
const app = express();
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));
app.listen(4000, '0.0.0.0', () => console.log('Now browse to localhost:4000/graphql'));
process.on('SIGTERM',()=> {
  console.log(`server and Graphql ${stopService()}`);
});