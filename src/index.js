const { GraphQLServer } = require('graphql-yoga')

const linkMatch = /^link[-]\d+$/

let links = [{
  id: 'link-0',
  url: 'www.howtographql.com',
  description: 'Fullstack tutorial for GraphQL'
}]

let idCount = links.length

const resolvers = {
  Query: {
    info: () => `This is the API of a Hackernews Clone`,
    feed: () => links,
    link: (parent, args) => {
      // (id: ID!): Link
      const { id } = args;
      if (!linkMatch.test(id)) throw new Error('invalid id: id must match the pattern `link-${number}`')
      return links.find(({ id: linkId }) => linkId === id);
    },
  },
  Mutation: {
    post: (parent, args) => {
       const link = {
        id: `link-${idCount++}`,
        description: args.description,
        url: args.url,
      }
      links.push(link)
      return link
    },
    updateLink: (parent, args) => {
      // (id: ID!, url: String, description: String): Link
      const { id, ...updates } = args
      if (!linkMatch.test(id)) throw new Error('invalid id: id must match the pattern `link-${number}`');
      const link = links.find(({ id: linkId }) => linkId === id);
      if (!link) throw new Error('unable to update, link not found!');
      Object.assign(link, updates);
      return link;
    },
    deleteLink: (parent, args) => {
      // (id: ID!): Link
      const { id } = args;
      if (!linkMatch.test(id)) throw new Error('invalid id: id must match the pattern `link-${number}`');
      const idx = links.findIndex(({ id: linkId }) => linkId === id);
      if (idx === -1 ) throw new Error('unable to delete, link not found!');
      const [deleted] = links.splice(idx, 1);
      return deleted
    }
  }
}

const server = new GraphQLServer({
  typeDefs: './src/schema.graphql',
  resolvers,
})
server.start(() => console.log(`Server is running on http://localhost:4000`))