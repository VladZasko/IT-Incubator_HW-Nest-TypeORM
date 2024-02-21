import { Controller, Delete } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BlogDBType, BlogDocument } from '../db/schemes/blogs.schemes';
import { Model } from 'mongoose';
import { PostDBType, PostDocument } from '../db/schemes/posts.schemes';

@Controller('testing')
export class DeleteAllData {
  constructor(
    @InjectModel(BlogDBType.name) private blogModel: Model<BlogDocument>,
    @InjectModel(PostDBType.name) private postModel: Model<PostDocument>,
  ) {}

  @Delete('all-data')
  async deleteAllData() {
    await this.blogModel.deleteMany({});
    await this.postModel.deleteMany({});
    /*    this.userAuthModel.deleteMany({});
    this.commentModel.deleteMany({});
    this.refreshTokensMetaModel.deleteMany({});
    this.rateLimitModel.deleteMany({});*/
  }
}
