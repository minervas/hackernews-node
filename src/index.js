const { GraphQLServer } = require('graphql-yoga');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const linkMatch = /^\d+$/;

const resolvers = {
  Query: {
    info: () => `This is the API of a Hackernews Clone`,
    feed: async (parent, args, context) => {
      return context.prisma.link.findMany();
    },
    link: (parent, args, context) => {
      // (id: ID!): Link
      const { id } = args;
      if (!linkMatch.test(id)) throw new Error('invalid id: id must be a a positive number')
      return context.prisma.link.findOne({ where: { id: +id }});
    },
  },
  Mutation: {
    post: (parent, args, context) => {
      const newLink = context.prisma.link.create({
        data: {
          url: args.url,
          description: args.description,
        },
      })
      return newLink
    },
    updateLink: (parent, args, context) => {
      // (id: ID!, url: String, description: String): Link
      const { id, ...updates } = args
      if (!linkMatch.test(id)) throw new Error('invalid id: id must be a positive number`');
      return prisma.link.update({ where: { id: +id }, data: { ...updates } });
    },
    deleteLink: (parent, args) => {
      // (id: ID!): Link
      const { id } = args;
      if (!linkMatch.test(id)) throw new Error('invalid id: id must be a positive number`');
      return prisma.link.delete({ where: { id: +id } });
    }
  }
}

const server = new GraphQLServer({
  typeDefs: './src/schema.graphql',
  resolvers,
  context: {
    prisma,
  }
})
server.start(() => console.log(`Server is running on http://localhost:4000`))