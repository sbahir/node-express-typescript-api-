import { PrismaClient, user } from '@prisma/client';
import bcrypt from 'bcryptjs';

type Signup = {
  email: string;
  name: string;
  password: string;
};

class Users {
  constructor(private readonly prismaUser: PrismaClient['user']) {}

  isEmailVerified!: boolean;

  // Signup a new user
  async signup(data: user): Promise<user> {
    // do some custom validation...
    return this.prismaUser.create({ data });
  }

  public async isPasswordMatch(password: string, currentPassword: string) {
    return bcrypt.compare(password, currentPassword);
  }

  async isEmailTaken(email: string, excludeUserId?: string) {
    const user = await this.prismaUser.findUnique({ where: { email } });
    return !!user;
  }

  async getUserByEmail(email: string) {
    return this.prismaUser.findUnique({
      where: { email }
    })
  }

  async getUsers() {
    return this.prismaUser.findMany({})
  }
}
