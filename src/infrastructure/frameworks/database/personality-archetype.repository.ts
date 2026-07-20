import { Injectable } from '@nestjs/common';
import { IPersonalityArchetypeRepository } from '../../../core/abstracts/personality-archetype-repository.interface';
import { PersonalityArchetypeEntity } from '../../../core/entities/personality-archetype.entity';
import { PrismaService } from './prisma.service';
import { PersonalityArchetype as PrismaArchetype } from '@prisma/client';

@Injectable()
export class PrismaPersonalityArchetypeRepository implements IPersonalityArchetypeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<PersonalityArchetypeEntity[]> {
    const list = await this.prisma.personalityArchetype.findMany();
    return list.map(this.mapToEntity);
  }

  async findById(id: string): Promise<PersonalityArchetypeEntity | null> {
    const arch = await this.prisma.personalityArchetype.findUnique({
      where: { id },
    });
    if (!arch) return null;
    return this.mapToEntity(arch);
  }

  private mapToEntity(prismaArch: PrismaArchetype): PersonalityArchetypeEntity {
    return new PersonalityArchetypeEntity(
      prismaArch.id,
      prismaArch.name,
      prismaArch.description,
      prismaArch.traits,
      prismaArch.createdAt,
      prismaArch.updatedAt,
      prismaArch.imageUrl,
    );
  }
}
