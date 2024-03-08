// this module should be first line of app.module.ts
import { getConfigModule } from './configuration/getConfigModule';
const configModule = getConfigModule;

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BlogsController } from './features/blogs/blogs.controller';
import { BlogsService } from './features/blogs/blogs.servis';
import { BlogsRepository } from './features/blogs/blogs.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogDBType, BlogSchema } from './db/schemes/blogs.schemes';
import { BlogsQueryRepository } from './features/blogs/blogs.query.repository';
import { PostDBType, PostSchema } from './db/schemes/posts.schemes';
import { PostsController } from './features/posts/posts.controller';
import { PostsService } from './features/posts/posts.servis';
import { PostsRepository } from './features/posts/posts.repository';
import { PostsQueryRepository } from './features/posts/posts.query.repository';
import { DeleteAllData } from './routes/tests';
import { CommentsController } from './features/comments/comments.controller';
import { CommentsQueryRepository } from './features/comments/comments.query.repository';
import { CommentsService } from './features/comments/comments.servis';
import { CommentsRepository } from './features/comments/comments.repository';
import { CommentDBType, CommentSchema } from './db/schemes/comments.schemes';
import { UserDBType, UserSchema } from './db/schemes/users.schemes';
import { UsersController } from './features/users/users.controller';
import { UsersService } from './features/users/users.servis';
import { UsersRepository } from './features/users/users.repository';
import { UsersQueryRepository } from './features/users/users.query.repository';
import { JwtModule } from '@nestjs/jwt';
import * as process from 'process';
import {
  RefreshTokensMetaDBType,
  RefreshTokensMetaSchema,
} from './db/schemes/token.schemes';
import { AuthController } from './features/auth/auth.controller';
import { AuthRepository } from './features/auth/auth.repository';
import { AuthQueryRepository } from './features/auth/auth.query.repository';
import { LocalStrategy } from './features/auth/strategies/local.strategy';
import { JwtStrategy } from './features/auth/strategies/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { BasicStrategy } from './features/auth/strategies/basic.strategy';
import { CreateUserUseCase } from './features/auth/application/use-cases/create.user.use.case';
import { RecoveryPasswordUseCase } from './features/auth/application/use-cases/recovery.password.use.case';
import { ConfirmEmailUseCase } from './features/auth/application/use-cases/confirm.email.use.case';
import { CheckCredentialsUseCase } from './features/auth/application/use-cases/check.credentials.use.case';
import { RefreshAndAccessTokenUseCase } from './features/auth/application/use-cases/refresh.and.access.token.use.case';
import { CqrsModule } from '@nestjs/cqrs';
import { EmailAdapter } from './features/auth/adapters/email-adapter';
import { AuthService } from './features/auth/application/auth.service';
import { NewPasswordUseCase } from './features/auth/application/use-cases/new.password.use.case';
import { ResendingConfirmEmailUseCase } from './features/auth/application/use-cases/resending.confirm.email.use.case';
import { AccessRolesGuard } from './features/auth/guards/access.guard';

const dbName = 'blogs-hws';

const useCases = [
  CreateUserUseCase,
  RecoveryPasswordUseCase,
  ConfirmEmailUseCase,
  CheckCredentialsUseCase,
  NewPasswordUseCase,
  RefreshAndAccessTokenUseCase,
  ResendingConfirmEmailUseCase,
];
@Module({
  imports: [
    configModule,
    MongooseModule.forRoot(
      process.env.MONGO_URL || `mongodb://0.0.0.0:27017/${dbName}`,
    ),
    MongooseModule.forFeature([
      {
        name: BlogDBType.name,
        schema: BlogSchema,
      },
      {
        name: PostDBType.name,
        schema: PostSchema,
      },
      {
        name: CommentDBType.name,
        schema: CommentSchema,
      },
      {
        name: UserDBType.name,
        schema: UserSchema,
      },
      {
        name: RefreshTokensMetaDBType.name,
        schema: RefreshTokensMetaSchema,
      },
    ]),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
    CqrsModule,
  ],
  controllers: [
    AppController,
    DeleteAllData,
    BlogsController,
    PostsController,
    CommentsController,
    UsersController,
    AuthController,
  ],
  providers: [
    AppService,
    BlogsService,
    BlogsRepository,
    BlogsQueryRepository,
    PostsService,
    PostsRepository,
    PostsQueryRepository,
    CommentsService,
    CommentsRepository,
    CommentsQueryRepository,
    UsersService,
    UsersRepository,
    UsersQueryRepository,
    AuthRepository,
    AuthQueryRepository,
    LocalStrategy,
    JwtStrategy,
    BasicStrategy,
    EmailAdapter,
    AuthService,
    AccessRolesGuard,
    ...useCases,
  ],
})
export class AppModule {}
