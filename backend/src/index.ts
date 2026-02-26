import { ApolloServer } from 'apollo-server';
import { typeDefs } from './graphql/schema';
import { resolvers } from './graphql/resolvers';
import * as dotenv from 'dotenv';

dotenv.config();

const server = new ApolloServer({
    typeDefs,
    resolvers,
    cors: {
        origin: '*', // For development, allow all origins
        credentials: true,
    },
});

const PORT = process.env.PORT || 4000;

server.listen({ port: PORT }).then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`);
});
