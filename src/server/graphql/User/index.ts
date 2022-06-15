import { extendType, nonNull, objectType, stringArg } from "nexus";
import prisma from "../../db/prisma";

const User = objectType({
  name: "User",
  definition(t) {
    t.nonNull.string("id");
    t.nullable.string("name");
    t.nonNull.string("email");

    t.connectionField("projects", {
      type: "Project",
      cursorFromNode: (node) => node?.id ?? "",
      disableBackwardPagination: true,
      nodes: async ({ id }, args) => {
        const cursor = args.after ? { id: args.after } : undefined;
        // prisma will include the cursor if skip: 1 is not set
        // https://www.prisma.io/docs/concepts/components/prisma-client/pagination#do-i-always-have-to-skip-1
        const skip = cursor ? 1 : undefined;
        // include one extra project to set hasNextPage value
        const take = args.first ? args.first + 1 : undefined;

        return await prisma.user
          .findUnique({ where: { id } })
          .projects({ cursor, skip, take });
      },
    });
  },
});

const queries = extendType({
  type: "Query",
  definition: (t) => {
    t.field("currentUser", {
      type: "User",
      resolve: (_, __, ctx) => {
        if (!ctx.user?.id) return null;

        return prisma.user.findUnique({
          where: {
            id: ctx.user.id,
          },
        });
      },
    });
  },
});

const mutations = extendType({
  type: "Mutation",
  definition: (t) => {
    t.nullable.field("updateUser", {
      type: "User",
      args: {
        userId: nonNull(stringArg()),
        name: stringArg(),
      },
      resolve: async (_, { userId, name }, ctx) => {
        if (!ctx.user?.id || userId !== ctx.user.id) return null;

        return await prisma.user.update({
          where: { id: userId },
          data: { name },
        });
      },
    });
  },
});

export default [User, mutations, queries];
