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
import { ConfigModule } from '@nestjs/config';

const dbName = 'blogs-hws';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
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
    ]),
  ],
  controllers: [
    AppController,
    DeleteAllData,
    BlogsController,
    PostsController,
    CommentsController,
    UsersController,
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
    UsersController,
    UsersService,
    UsersRepository,
    UsersQueryRepository,
  ],
})
export class AppModule {}
