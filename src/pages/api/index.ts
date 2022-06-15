import { ApolloServer } from "apollo-server-micro";
import prisma from "../../server/db/prisma";
import { getRequestOrigin } from "../../server/get-request-origin";
import { schema } from "../../server/graphql/schema";
import handler from "../../server/api-route";
import { MicroRequest } from "apollo-server-micro/dist/types";
import { ServerResponse } from "http";

export const config = {
  api: {
    bodyParser: false,
  },
};

export interface GraphQLContext {
  user?: Express.User;
  prisma: typeof prisma;
  origin: string;
}

const apolloServer = new ApolloServer({
  schema,
  context: ({ req }): GraphQLContext => ({
    user: req.user,
    origin: getRequestOrigin(req),
    prisma,
  }),
});

const startServer = apolloServer.start();

export default handler().use((req: MicroRequest, res: ServerResponse) => {
  startServer.then(() => {
    apolloServer.createHandler({
      path: "/api",
    })(req, res);
  });
});
