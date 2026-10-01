import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service.js';
import type { RegisterDto } from '@repo/shared/schemas/auth.schema';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  findByIdWithProfile(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    });
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  create(data: RegisterDto) {
    return this.prisma.user.create({ data });
  }

  updatePassword(id: string, hashedPassword: string) {
    return this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });
  }
}
