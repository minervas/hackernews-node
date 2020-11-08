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

  return context.prisma.link.create({
    data: {
      url: args.url,
      description: args.description,
      postedBy: { connect: { id: userId } },
    }
  })
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

module.exports = {
  signup,
  login,
  post,
  updateLink,
  deleteLink,
}