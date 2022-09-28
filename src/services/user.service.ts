import httpStatus from 'http-status';
import { user as UserModel } from '@prisma/client';
import { PaginateFilter, PaginateOptions } from '../models/plugins/paginate.plugin';
import { User } from '../models/user.model';
import ApiError from '../utils/ApiError';
import { CreateUser } from '../validations/user.validation';
import prisma from '../../prisma/prisma-client';

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
export const createUser = async (userBody: CreateUser) => {
  const result = await prisma.user.create({
    data: {
      ...userBody,
    },
  });

  return result;
};

/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
export const queryUsers = async (filter: PaginateFilter, options: PaginateOptions) => {
  const users = await User.paginate(filter, options);
  return users;
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
export const getUserById = async (id: string) => {
  return User.findById(id);
};

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<UserModel>}
 */
export const getUserByEmail = async (email: string) => {
  return User.findUnique({
    where: { email },
  });
};

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
export const updateUserById = async (userId: string, updateBody: Partial<UserModel>) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (updateBody.email && (await User.isEmailTaken(updateBody.email, userId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }

  user.set({ ...user, ...updateBody });

  await user.save();
  return user;
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */
export const deleteUserById = async (userId: string) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  await user.remove();
  return user;
};
