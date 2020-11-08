const info = () => `This is the API of a Hackernews Clone`;

const feed =  async (parent, args, context) => {
  return context.prisma.link.findMany();
};

const link = (parent, args, context) => {
  // (id: ID!): Link
  const { id } = args;
  if (!linkMatch.test(id)) throw new Error('invalid id: id must be a a positive number')
  return context.prisma.link.findOne({ where: { id: +id }});
};

module.exports = {
  info,
  feed,
  link,
};
