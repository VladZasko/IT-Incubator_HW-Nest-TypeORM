// this module should be first line of app.module.ts
import { getConfigModule } from './configuration/getConfigModule';
const configModule = getConfigModule;

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BlogsController } from './features/blogs/blogs.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogsQueryRepository } from './features/blogs/repository/blogs.query.repository';
import { PostsController } from './features/posts/posts.controller';
import { PostsService } from './features/posts/application/posts.servis';
import { PostsRepository } from './features/posts/repository/posts.repository';
import { PostsQueryRepository } from './features/posts/repository/posts.query.repository';
import { DeleteAllData } from './routes/tests';
import { CommentsController } from './features/comments/comments.controller';
import { CommentsQueryRepository } from './features/comments/repository/comments.query.repository';
import { CommentsService } from './features/comments/application/comments.servis';
import { CommentsRepository } from './features/comments/repository/comments.repository';
import { UsersController } from './features/users/users.controller';
import { UsersService } from './features/users/application/users.servis';
import { UsersRepository } from './features/users/repository/users.repository';
import { UsersQueryRepository } from './features/users/repository/users.query.repository';
import { JwtModule } from '@nestjs/jwt';
import * as process from 'process';
import { AuthController } from './features/auth/auth.controller';
import { AuthQueryRepository } from './features/auth/repository/auth.query.repository';
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
import { AccessRolesGuard } from './features/auth/guards/access.roles.guard';
import { RefreshTokenGuard } from './features/auth/guards/refresh-token.guard';
import { SecurityDevicesController } from './features/securityDevices/security.devices.controller';
import { SecurityDevicesService } from './features/securityDevices/application/security.devices.servis';
import { SecurityDevicesQueryRepository } from './features/securityDevices/repository/security.devices.query.repository';
import { SecurityDevicesRepository } from './features/securityDevices/repository/security.devices.repository';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AuthRepository } from './features/auth/repository/auth.repository';
import { BlogsSaRepository } from './features/blogs/repository/blogs.sa.repository';
import { BlogsSAController } from './features/blogs/blogs.sa.controller';
import { BlogsSaQueryRepository } from './features/blogs/repository/blogs.sa.query.repository';
import { User } from './db/entitys/user.entity';
import { EmailConfirmation } from './db/entitys/email.confirmatiom.entity';
import { PasswordRecovery } from './db/entitys/password.recovery.entity';
import { RefreshTokenMeta } from './db/entitys/refresh.token.meta.entity';
import { Blog } from './db/entitys/blog.entity';
import { Post } from './db/entitys/post.entity';
import { Like } from './db/entitys/like.entity';
import { Comment } from './db/entitys/comments.entity';
import { CreateBlogUseCase } from './features/blogs/application/use-cases/create.blog.use.case';
import { CreatePostByBlogUseCase } from './features/blogs/application/use-cases/create.post.by.blog.use.case';
import { UpdateBlogUseCase } from './features/blogs/application/use-cases/update.blog.use.case';
import { UpdatePostByBlogUseCase } from './features/blogs/application/use-cases/update.post.by.blog.use.case';
import { DeletePostByBlogCommand } from './features/blogs/application/use-cases/delete.post.by.blog.use.case';
import { DeleteBlogUseCase } from './features/blogs/application/use-cases/delete.blog.use.case';

const dbName = 'blogs-hws';

const useCasesAuth = [
  CreateUserUseCase,
  RecoveryPasswordUseCase,
  ConfirmEmailUseCase,
  CheckCredentialsUseCase,
  NewPasswordUseCase,
  RefreshAndAccessTokenUseCase,
  ResendingConfirmEmailUseCase,
];

const useCasesBlog = [
  CreateBlogUseCase,
  CreatePostByBlogUseCase,
  UpdateBlogUseCase,
  UpdatePostByBlogUseCase,
  DeleteBlogUseCase,
  DeletePostByBlogCommand,
];

export const options: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'sa',
  database: 'Incubator-HW-TypeORM',
  autoLoadEntities: true,
  synchronize: true,
};
@Module({
  imports: [
    configModule,
    TypeOrmModule.forRoot(options),
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
    MongooseModule.forRoot(
      process.env.MONGO_URL || `mongodb://0.0.0.0:27017/${dbName}`,
    ),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 10000,
        limit: 5,
      },
    ]),
    CqrsModule,
  ],
  controllers: [
    AppController,
    DeleteAllData,
    BlogsController,
    BlogsSAController,
    PostsController,
    CommentsController,
    UsersController,
    AuthController,
    SecurityDevicesController,
  ],
  providers: [
    // {
    //   provide: APP_GUARD,
    //   useClass: ThrottlerGuard,
    // },
    AppService,
    BlogsSaRepository,
    BlogsQueryRepository,
    BlogsSaQueryRepository,
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
    RefreshTokenGuard,
    SecurityDevicesService,
    SecurityDevicesQueryRepository,
    SecurityDevicesRepository,
    ...useCasesAuth,
    ...useCasesBlog,
  ],
})
export class AppModule {}
