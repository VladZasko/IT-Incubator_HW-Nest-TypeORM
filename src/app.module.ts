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

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/nest'),
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
    ]),
  ],
  controllers: [
    AppController,
    DeleteAllData,
    BlogsController,
    PostsController,
    CommentsController,
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
  ],
})
export class AppModule {}
