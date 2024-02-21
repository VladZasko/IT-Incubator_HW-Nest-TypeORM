import { Controller, Get, Param } from '@nestjs/common';
import { CommentsService } from './comments.servis';
import { CommentsQueryRepository } from './comments.query.repository';

@Controller('comments')
export class CommentsController {
  constructor(
    protected commentsService: CommentsService,
    protected commentsQueryRepository: CommentsQueryRepository,
  ) {}
  @Get()
  getComment(@Param('id') commentId: string) {
    return this.commentsQueryRepository.getCommentById(commentId);
  }
  /*  getPostsByBlog(@Query() query: QueryBlogsModel, @Param('id') blogId: string) {
    return this.postsQueryRepository.findPostsByBlog(query, blogId);
  }*/

  /*  @Put(':id')
  updateComment(@Body() inputModel: UpdatePostModel, @Param('id') postId: string) {
    const updatePost = this.postsService.updatePost(postId, inputModel);

    return updatePost;
  }
  @Delete(':id')
  deleteComment(@Param('id') postId: string) {
    const deletePost = this.postsService.deletePostById(postId);
    return deletePost;
  }*/
}
