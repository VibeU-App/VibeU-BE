import { DatabaseModule } from "src/infrastructure/frameworks/database/database.module";
import { ProfileController } from "./profile.controller";
import { GetProfileMeUseCase } from "src/use-cases/profile/get-profile-me.usecase";
import { UpdateProfileMeUseCase } from "src/use-cases/profile/update-profile-me.usecase";
import { UpdateProfileTagsUseCase } from "src/use-cases/profile/update-profile-tags.usecase";
import { Module } from "@nestjs/common";

@Module({
    imports: [DatabaseModule],
    controllers: [ProfileController],
    providers: [
        // Use cases
        GetProfileMeUseCase,
        UpdateProfileMeUseCase,
        UpdateProfileTagsUseCase,
    ],
    exports: [
        GetProfileMeUseCase,
        UpdateProfileMeUseCase,
        UpdateProfileTagsUseCase,
    ],
})
export class ProfileModule {}