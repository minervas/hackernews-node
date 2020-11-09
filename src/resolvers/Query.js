const info = () => `This is the API of a Hackernews Clone`;

const feed =  async (parent, args, context) => {
  const where = args.filter
    ? {
      OR: [
        { description: { contains: args.filter } },
        { url: { contains: args.filter } },
      ],
    }
    : {}

  const links = await context.prisma.link.findMany({
    where,
    skip: args.skip,
    take: args.take,
    orderBy: args.orderBy,
  })

  const count = await context.prisma.link.count({ where })

  return {
    links,
    count,
  }
}

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
