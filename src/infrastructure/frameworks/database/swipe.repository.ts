import { ISwipeRepository } from '../../../core/abstracts/swipe-repository.interface';
import { SwipeEntity } from '../../../core/entities/swipe.entity';
import { CandidateCardEntity } from '../../../core/entities/candidate-card.entity';
import { PrismaService } from './prisma.service';
import { Swipe as PrismaSwipe } from '@prisma/client';
import { getAge } from '../../../utils/calculating';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PrismaSwipeRepository implements ISwipeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(swipe: {
    swiperId: string;
    targetId: string;
    isLike: boolean;
  }): Promise<SwipeEntity> {
    const newSwipe = await this.prisma.swipe.create({
      data: {
        swiperId: swipe.swiperId,
        targetId: swipe.targetId,
        isLike: swipe.isLike,
      },
    });

    return this.mapToEntity(newSwipe);
  }

  async findBySwiperAndTarget(
    swiperId: string,
    targetId: string,
  ): Promise<SwipeEntity | null> {
    console.log('KEBFKJFAKJNSAK: ', this.prisma);
    const swipe = await this.prisma.swipe.findFirst({
      where: {
        swiperId: swiperId,
        targetId: targetId,
      },
    });

    if (!swipe) {
      return null;
    }

    return this.mapToEntity(swipe);
  }

  async findReciprocalLike(
    swiperId: string,
    targetId: string,
  ): Promise<SwipeEntity | null> {
    const swipe = await this.prisma.swipe.findFirst({
      where: {
        swiperId: targetId,
        targetId: swiperId,
        isLike: true,
      },
    });

    if (!swipe) {
      return null;
    }

    return this.mapToEntity(swipe);
  }

  // Sorted by the number of common hobbies
  async findDeckCandidates(
    viewerUserId: string,
    oppositeGender: string,
    limit: number,
  ): Promise<CandidateCardEntity[]> {
    let currentNumberOfMatches = 0;
    const matchingProfiles = await this.prisma.profile.findMany({
      where: {
        gender: oppositeGender,
      },
    });

    // validProfileMapping: { Profile id: [CandidateCardEntity object, numberOfCommonHobbies] }
    const validProfilesMapping: Array<{
      candidateObject: any;
      numOfCommonHobbies: number;
    }> = [];
    const currentUserProfile = await this.prisma.profile.findFirst({
      where: {
        userId: viewerUserId,
      },
    });

    if (!!currentUserProfile) {
      for (let p of matchingProfiles) {
        // Check if the number of users is sufficient
        if (currentNumberOfMatches > limit) break;

        // Check the conditions for the candidates to show up
        if (p.userId === viewerUserId) {
          continue;
        } else if (p.gender.toLowerCase() !== oppositeGender.toLowerCase()) {
          continue;
        } else if (
          p.personalityArchetypeId !==
          currentUserProfile?.personalityArchetypeId
        ) {
          continue;
        } else if (!p.isCompleted) {
          continue;
        } else {
          currentNumberOfMatches++;
          const swipe = await this.findBySwiperAndTarget(
            viewerUserId,
            p.userId,
          );

          if (!!swipe) {
            continue;
          } else {
            const hobbies = await this.prisma.profileHobby.findMany({
              where: {
                profileId: p.id,
              },
            });

            const hobbyStr = (
              await Promise.all(
                hobbies.map(async (h) => {
                  const hobby = await this.prisma.hobby.findFirst({
                    where: {
                      id: h.hobbyId,
                    },
                  });

                  return hobby?.name;
                }),
              )
            ).filter((h) => h !== undefined);

            const personalityArchetype =
              await this.prisma.personalityArchetype.findFirst({
                where: {
                  id: p.personalityArchetypeId ?? undefined,
                },
              });

            const photos = await this.prisma.profilePhoto.findMany({
              where: {
                profileId: p.id,
              },
            });

            const photoStr = photos.map((p) => {
              return p.url;
            });

            // Find the number of common hobbies between users
            const currentUserHobbies = await this.prisma.profileHobby.findMany({
              where: {
                profileId: currentUserProfile.id,
              },
            });
            const candidateHobbies = await this.prisma.profileHobby.findMany({
              where: {
                profileId: p.id,
              },
            });
            let numberOfCommonHobbies = 0;
            currentUserHobbies.forEach((h) => {
              for (let entry of candidateHobbies) {
                if (entry.hobbyId === h.hobbyId) {
                  numberOfCommonHobbies++;
                  continue;
                }
              }
            });

            const newCandidate = new CandidateCardEntity(
              p.userId,
              p.nickname,
              p.gender,
              p.birthday,
              getAge(p.birthday),
              p.university,
              p.bio,
              p.avatarSeed,
              photoStr,
              hobbyStr,
              personalityArchetype,
            );

            validProfilesMapping.push({
              candidateObject: newCandidate,
              numOfCommonHobbies: numberOfCommonHobbies,
            });
          }
        }
      }

      validProfilesMapping.sort(
        (a, b) => b.numOfCommonHobbies - a.numOfCommonHobbies,
      );

      return validProfilesMapping.map((m) => m.candidateObject);
    } else {
      return [];
    }
  }

  private mapToEntity(prismaSwipe: PrismaSwipe): SwipeEntity {
    return new SwipeEntity(
      prismaSwipe.id,
      prismaSwipe.swiperId,
      prismaSwipe.targetId,
      prismaSwipe.isLike,
      prismaSwipe.createdAt,
    );
  }
}
