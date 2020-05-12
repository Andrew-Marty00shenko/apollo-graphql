import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { HttpLink } from "apollo-link-http";
import { resolvers, typeDefs } from "./resolvers";
import gql from "graphql-tag";

import { ApolloProvider, useQuery } from "@apollo/react-hooks";
import React from "react";
import ReactDOM from "react-dom";
import Pages from "./pages";
import injectStyles from "./styles";
import Login from "./pages/login";

const IS_LOGGED_IN = gql`
  query IsUserLoggedIn {
    isLoggedIn @client
  }
`;

const cache = new InMemoryCache();
const link = new HttpLink({
  headers: { authorization: localStorage.getItem("token") },
  uri: "http://localhost:4000/",
});

const client = new ApolloClient({
  cache,
  link,
  typeDefs,
  resolvers,
});

cache.writeData({
  data: {
    isLoggedIn: !!localStorage.getItem("token"),
    cartItems: [],
  },
});

function IsLoggedIn() {
  const { data } = useQuery(IS_LOGGED_IN);
  return data.isLoggedIn ? <Pages /> : <Login />;
}

injectStyles();
ReactDOM.render(
  <ApolloProvider client={client}>
    <IsLoggedIn />
  </ApolloProvider>,
  document.getElementById("root")
);