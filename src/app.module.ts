import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BlogsController } from './features/blogs/blogs.controller';
import { BlogsService } from './features/blogs/blogs.servis';
import { BlogsRepository } from './features/blogs/blogs.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogDBType, BlogSchema } from './db/schemes/blogs.schemes';
import { BlogsQueryRepository } from './features/blogs/blogs.query.repository';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/nest'),
    MongooseModule.forFeature([
      {
        name: BlogDBType.name,
        schema: BlogSchema,
      },
    ]),
  ],
  controllers: [AppController, BlogsController],
  providers: [AppService, BlogsService, BlogsRepository, BlogsQueryRepository],
})
export class AppModule {}
