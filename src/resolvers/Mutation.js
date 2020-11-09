const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { APP_SECRET, getUserId } = require('../utils')

const signup = async (parent, args, context, info) => {
  const password = await bcrypt.hash(args.password, 10)
  const user = await context.prisma.user.create({ data: { ...args, password } })
  const token = jwt.sign({ userId: user.id }, APP_SECRET)
  return {
    token,
    user,
  }
}

const login = async (parent, args, context, info) => {
  const user = await context.prisma.user.findOne({ where: { email: args.email } })
  if (!user) {
    throw new Error('No such user found')
  }
  const valid = await bcrypt.compare(args.password, user.password)
  if (!valid) {
    throw new Error('Invalid password')
  }
  const token = jwt.sign({ userId: user.id }, APP_SECRET)
  return {
    token,
    user,
  }
}

const post = (parent, args, context, info) => {
  const userId = getUserId(context)

  const newLink = context.prisma.link.create({
    data: {
      url: args.url,
      description: args.description,
      postedBy: { connect: { id: userId } },
    }
  })
  context.pubsub.publish("NEW_LINK", newLink);

  return newLink;
}

const updateLink = (parent, args, context) => {
  // (id: ID!, url: String, description: String): Link
  const userId = getUserId(context);
  const { id, ...updates } = args;
  return prisma.link.update({ where: { id: +id, postedById: userId }, data: { ...updates } });
};

const deleteLink = (parent, args, context) => {
  // (id: ID!): Link
  const userId = getUserId(context);
  const { id } = args;
  return prisma.link.delete({ where: { id: +id, postedById: userId } });
};

const vote = async (parent, args, context, info) => {
  const userId = getUserId(context)
  const vote = await context.prisma.vote.findOne({
    where: {
      linkId_userId: {
        linkId: Number(args.linkId),
        userId: userId
      }
    }
  })

  if (Boolean(vote)) {
    throw new Error(`Already voted for link: ${args.linkId}`)
  }

  const newVote = context.prisma.vote.create({
    data: {
      user: { connect: { id: userId } },
      link: { connect: { id: Number(args.linkId) } },
    }
  })
  context.pubsub.publish("NEW_VOTE", newVote)

  return newVote
}

module.exports = {
  signup,
  login,
  post,
  updateLink,
  deleteLink,
  vote,
}