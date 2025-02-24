import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon2 from 'argon2';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}
  async createUser(dto: CreateUserDto) {
    const { username, email, password } = dto;
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('Email is already exists ');
    }
    const hashedPassword = await argon2.hash(password, {
      type: argon2.argon2id, // Use Argon2id for best security
      memoryCost: 65536, // 64MB memory
      timeCost: 3, // Number of iterations
      parallelism: 2, // Number of threads
    });
    return this.prisma.user.create({
      data: { username, email, password: hashedPassword },
      select: { id: true, username: true, email: true, createdAt: true },
    });
  }
}
