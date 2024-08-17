import { Module } from '@nestjs/common';
import { CommandModule } from 'nestjs-command';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../src/db/entitys/user.entity';
import { EmailConfirmation } from '../../src/db/entitys/email.confirmatiom.entity';
import { PasswordRecovery } from '../../src/db/entitys/password.recovery.entity';
import { RefreshTokenMeta } from '../../src/db/entitys/refresh.token.meta.entity';
import { Blog } from '../../src/db/entitys/blog.entity';
import { Post } from '../../src/db/entitys/post.entity';
import { Comment } from '../../src/db/entitys/comments.entity';
import { Like } from '../../src/db/entitys/like.entity';
import { SeedDb } from './command/seed.db';

@Module({
  imports: [
    CommandModule,
    TypeOrmModule.forFeature([
      User,
      EmailConfirmation,
      PasswordRecovery,
      RefreshTokenMeta,
      Blog,
      Post,
      Comment,
      Like,
    ]),
  ],
  providers: [SeedDb],
  exports: [SeedDb],
})
export class SeedsModule {}
