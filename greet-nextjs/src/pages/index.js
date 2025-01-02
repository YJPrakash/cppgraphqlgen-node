import dynamic from "next/dynamic";
// import GraphiQL from "graphiql";
import "graphiql/graphiql.css";

const GraphiQL = dynamic(
  () => import("graphiql").then((mod) => mod.GraphiQL),
  { ssr: false } // Disable SSR for GraphiQL
);

export default function Home() {
  const fetcher = async (graphQLParams) => {
    // console.log(graphQLParms);
    // return {data: {
    //   greetmsg: "Hello World!",
    //   hello: {
    //     greet: "Hello World!"
    //   }
    // }}
    // const response = await fetch(process.env.NEXT_PUBLIC_GRAPHQL_SERVER, {
    const response = await fetch('/api/graphql', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(graphQLParams),
    });
    return response.json();
  };
  return (
    <div style={{ height: "100vh" }}>
      <GraphiQL 
        fetcher={fetcher} 
        />
    </div>
  );
}
