import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User as PrismaUser } from '@prisma/client';
import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';

import { PrismaService } from '../../prisma/prisma.service';
import {
  AuthResponseDto,
  CreateUserDto,
  LoginUserDto,
  UpdateUserDto,
  UserResponseDto,
} from './dto';
import { UserProfile } from './user.entity';

const JWT_EXPIRES_IN_SECONDS = 7 * 24 * 60 * 60;

@Injectable()
export class UsersService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const normalizedEmail = this.normalizeEmail(createUserDto.email);

    if (await this.findByEmail(normalizedEmail)) {
      throw new ConflictException('Ja existe um usuario com este e-mail.');
    }

    const user = await this.prisma.user.create({
      data: {
        name: createUserDto.name.trim(),
        email: normalizedEmail,
        phone: createUserDto.phone.trim(),
        profile: createUserDto.profile,
        passwordHash: this.hashPassword(createUserDto.password),
      },
    });

    return this.toResponse(user);
  }

  async login(loginUserDto: LoginUserDto): Promise<AuthResponseDto> {
    const user = await this.findByEmail(
      this.normalizeEmail(loginUserDto.email),
    );

    if (
      !user ||
      !this.verifyPassword(loginUserDto.password, user.passwordHash)
    ) {
      throw new UnauthorizedException('E-mail ou senha invalidos.');
    }

    const accessToken = this.jwtService.sign(
      { email: user.email },
      { subject: user.uuid },
    );

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: JWT_EXPIRES_IN_SECONDS,
      user: this.toResponse(user),
    };
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return users.map((user) => this.toResponse(user));
  }

  async findOne(uuid: string): Promise<UserResponseDto> {
    return this.toResponse(await this.findEntityByUuid(uuid));
  }

  async findMe(uuid: string): Promise<UserResponseDto> {
    return this.findOne(uuid);
  }

  async update(
    uuid: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    await this.findEntityByUuid(uuid);
    const data: Partial<{
      name: string;
      email: string;
      phone: string;
      profile: typeof updateUserDto.profile;
      passwordHash: string;
    }> = {};

    if (updateUserDto.email) {
      const normalizedEmail = this.normalizeEmail(updateUserDto.email);
      const emailOwner = await this.findByEmail(normalizedEmail);

      if (emailOwner && emailOwner.uuid !== uuid) {
        throw new ConflictException('Ja existe um usuario com este e-mail.');
      }

      data.email = normalizedEmail;
    }

    if (updateUserDto.name) {
      data.name = updateUserDto.name.trim();
    }

    if (updateUserDto.phone) {
      data.phone = updateUserDto.phone.trim();
    }

    if (updateUserDto.profile) {
      data.profile = updateUserDto.profile;
    }

    if (updateUserDto.password) {
      data.passwordHash = this.hashPassword(updateUserDto.password);
    }

    const user = await this.prisma.user.update({
      where: { uuid },
      data,
    });

    return this.toResponse(user);
  }

  async remove(uuid: string): Promise<void> {
    await this.findEntityByUuid(uuid);
    await this.prisma.user.delete({ where: { uuid } });
  }

  private async findEntityByUuid(uuid: string): Promise<PrismaUser> {
    const user = await this.prisma.user.findUnique({ where: { uuid } });

    if (!user) {
      throw new NotFoundException('Usuario nao encontrado.');
    }

    return user;
  }

  private findByEmail(email: string): Promise<PrismaUser | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private hashPassword(password: string): string {
    const salt = randomBytes(16).toString('hex');
    const hash = scryptSync(password, salt, 64).toString('hex');

    return `${salt}:${hash}`;
  }

  private verifyPassword(password: string, passwordHash: string): boolean {
    const [salt, hash] = passwordHash.split(':');

    if (!salt || !hash) {
      return false;
    }

    const storedHash = Buffer.from(hash, 'hex');
    const suppliedHash = scryptSync(password, salt, 64);

    return (
      storedHash.length === suppliedHash.length &&
      timingSafeEqual(storedHash, suppliedHash)
    );
  }

  private toResponse(user: PrismaUser): UserResponseDto {
    return {
      uuid: user.uuid,
      name: user.name,
      email: user.email,
      phone: user.phone,
      profile: user.profile as UserProfile,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
