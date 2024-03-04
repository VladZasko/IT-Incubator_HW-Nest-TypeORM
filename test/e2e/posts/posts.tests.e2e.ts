import request from 'supertest';
import { app } from '../../../src/app';
import { HTTP_STATUSES } from '../../../src/utils/utils';
import { CreatePostServiceModel } from '../../../src/features/posts/models/CreatePostServiceModel';
import { RouterPaths } from '../../../src/routerPaths';
import { blogTestMeneger } from '../blogs/utils/blogTestMeneger';
import {
  dataTestPostsCreate01,
  dataTestPostsCreate02,
  dataTestPostUpdate01,
  incorrectPostData,
} from './dataForTest/dataTestforPost';
import { postsTestManager } from './utils/postsTestManager';
import { ErrorMessage, ERRORS_MESSAGES } from '../../../src/utils/errors';
import { dataTestBlogCreate01 } from '../blogs/dataForTest/dataTestforBlog';
import { dbControl } from '../../../src/db/db';

const getRequest = () => {
  return request(app);
};
describe('/posts', () => {
  beforeAll(async () => {
    await dbControl.run();
  });

  beforeEach(async () => {
    await getRequest().delete('/testing/all-data');
  });

  afterAll(async () => {
    await dbControl.stop();
  });

  it('should return 200 and empty array', async () => {
    await getRequest().get(RouterPaths.posts).expect(HTTP_STATUSES.OK_200, {
      pagesCount: 0,
      page: 1,
      pageSize: 10,
      totalCount: 0,
      items: [],
    });
  });

  it('should return 404 fot not existing posts', async () => {
    await getRequest()
      .get(`${RouterPaths.posts}/1`)
      .expect(HTTP_STATUSES.NOT_FOUND_404);
  });

  it(`shouldn't create post with UNAUTHORIZED`, async () => {
    const blog = await blogTestMeneger.createBlog(dataTestBlogCreate01);

    const data: CreatePostServiceModel = {
      ...dataTestPostsCreate01,
      blogId: blog.createdEntity.id,
    };

    await request(app)
      .post(RouterPaths.posts)
      .set('authorization', 'Basic YWRtaW')
      .send(data)
      .expect(HTTP_STATUSES.UNAUTHORIZED_401);
  });

  it(`shouldn't create post with empty title`, async () => {
    const blog = await blogTestMeneger.createBlog(dataTestBlogCreate01);

    const data: CreatePostServiceModel = {
      ...dataTestPostsCreate01,
      title: incorrectPostData.emptyTitle,
      blogId: blog.createdEntity.id,
    };
    const error: ErrorMessage = [ERRORS_MESSAGES.POST_TITLE];

    await postsTestManager.createPost(
      data,
      HTTP_STATUSES.BAD_REQUEST_400,
      error,
    );

    await request(app).get(RouterPaths.posts).expect(HTTP_STATUSES.OK_200, {
      pagesCount: 0,
      page: 1,
      pageSize: 10,
      totalCount: 0,
      items: [],
    });
  });

  it(`shouldn't create post with title more than 15 characters`, async () => {
    const blog = await blogTestMeneger.createBlog(dataTestBlogCreate01);

    const data: CreatePostServiceModel = {
      ...dataTestPostsCreate01,
      title: incorrectPostData.tooLongTitle,
      blogId: blog.createdEntity.id,
    };

    const error: ErrorMessage = [ERRORS_MESSAGES.POST_TITLE];

    await postsTestManager.createPost(
      data,
      HTTP_STATUSES.BAD_REQUEST_400,
      error,
    );

    await request(app).get(RouterPaths.posts).expect(HTTP_STATUSES.OK_200, {
      pagesCount: 0,
      page: 1,
      pageSize: 10,
      totalCount: 0,
      items: [],
    });
  });

  it(`shouldn't create post with empty shortDescription`, async () => {
    const blog = await blogTestMeneger.createBlog(dataTestBlogCreate01);

    const data: CreatePostServiceModel = {
      ...dataTestPostsCreate01,
      shortDescription: incorrectPostData.emptyShortDescription,
      blogId: blog.createdEntity.id,
    };

    const error: ErrorMessage = [ERRORS_MESSAGES.POST_SHORT_DESCRIPTION];

    await postsTestManager.createPost(
      data,
      HTTP_STATUSES.BAD_REQUEST_400,
      error,
    );

    await request(app).get(RouterPaths.posts).expect(HTTP_STATUSES.OK_200, {
      pagesCount: 0,
      page: 1,
      pageSize: 10,
      totalCount: 0,
      items: [],
    });
  });

  it(`shouldn't create post with shortDescription more than 100 characters`, async () => {
    const blog = await blogTestMeneger.createBlog(dataTestBlogCreate01);

    const data: CreatePostServiceModel = {
      ...dataTestPostsCreate01,
      shortDescription: incorrectPostData.tooLongShortDescription,
      blogId: blog.createdEntity.id,
    };

    const error: ErrorMessage = [ERRORS_MESSAGES.POST_SHORT_DESCRIPTION];

    await postsTestManager.createPost(
      data,
      HTTP_STATUSES.BAD_REQUEST_400,
      error,
    );

    await request(app).get(RouterPaths.posts).expect(HTTP_STATUSES.OK_200, {
      pagesCount: 0,
      page: 1,
      pageSize: 10,
      totalCount: 0,
      items: [],
    });
  });

  it(`shouldn't create post with empty content`, async () => {
    const blog = await blogTestMeneger.createBlog(dataTestBlogCreate01);

    const data: CreatePostServiceModel = {
      ...dataTestPostsCreate01,
      content: incorrectPostData.emptyContent,
      blogId: blog.createdEntity.id,
    };

    const error: ErrorMessage = [ERRORS_MESSAGES.POST_CONTENT];

    await postsTestManager.createPost(
      data,
      HTTP_STATUSES.BAD_REQUEST_400,
      error,
    );

    await request(app).get(RouterPaths.posts).expect(HTTP_STATUSES.OK_200, {
      pagesCount: 0,
      page: 1,
      pageSize: 10,
      totalCount: 0,
      items: [],
    });
  });

  it(`shouldn't create post with content more than 1000 characters`, async () => {
    const blog = await blogTestMeneger.createBlog(dataTestBlogCreate01);

    const data: CreatePostServiceModel = {
      ...dataTestPostsCreate01,
      content: incorrectPostData.tooLongContent,
      blogId: blog.createdEntity.id,
    };

    const error: ErrorMessage = [ERRORS_MESSAGES.POST_CONTENT];

    await postsTestManager.createPost(
      data,
      HTTP_STATUSES.BAD_REQUEST_400,
      error,
    );

    await request(app).get(RouterPaths.posts).expect(HTTP_STATUSES.OK_200, {
      pagesCount: 0,
      page: 1,
      pageSize: 10,
      totalCount: 0,
      items: [],
    });
  });

  it(`shouldn't create post with empty blogId`, async () => {
    const error: ErrorMessage = [ERRORS_MESSAGES.POST_BLOGID];

    await postsTestManager.createPost(
      dataTestPostsCreate01,
      HTTP_STATUSES.BAD_REQUEST_400,
      error,
    );

    await request(app).get(RouterPaths.posts).expect(HTTP_STATUSES.OK_200, {
      pagesCount: 0,
      page: 1,
      pageSize: 10,
      totalCount: 0,
      items: [],
    });
  });

  it(`shouldn't create post with incorrect blogId`, async () => {
    const data: CreatePostServiceModel = {
      ...dataTestPostsCreate01,
      blogId: incorrectPostData.incorrectBlogId,
    };

    const error: ErrorMessage = [ERRORS_MESSAGES.POST_BLOGID];

    await postsTestManager.createPost(
      data,
      HTTP_STATUSES.BAD_REQUEST_400,
      error,
    );

    await request(app).get(RouterPaths.posts).expect(HTTP_STATUSES.OK_200, {
      pagesCount: 0,
      page: 1,
      pageSize: 10,
      totalCount: 0,
      items: [],
    });
  });

  it(`shouldn't create post with incorrect data`, async () => {
    const data: CreatePostServiceModel = {
      ...dataTestPostsCreate01,
      blogId: incorrectPostData.incorrectBlogId,
      title: incorrectPostData.emptyTitle,
      content: incorrectPostData.emptyContent,
      shortDescription: incorrectPostData.emptyShortDescription,
    };

    const error: ErrorMessage = [
      ERRORS_MESSAGES.POST_SHORT_DESCRIPTION,
      ERRORS_MESSAGES.POST_TITLE,
      ERRORS_MESSAGES.POST_CONTENT,
      ERRORS_MESSAGES.POST_BLOGID,
    ];

    await postsTestManager.createPost(
      data,
      HTTP_STATUSES.BAD_REQUEST_400,
      error,
    );

    await request(app).get(RouterPaths.posts).expect(HTTP_STATUSES.OK_200, {
      pagesCount: 0,
      page: 1,
      pageSize: 10,
      totalCount: 0,
      items: [],
    });
  });

  it(`should create post with correct input data`, async () => {
    const blog = await blogTestMeneger.createBlog(dataTestBlogCreate01);

    const data = {
      ...dataTestPostsCreate01,
      blogId: blog.createdEntity.id,
    };

    const result = await postsTestManager.createPost(data);

    await request(app)
      .get(RouterPaths.posts)
      .expect(HTTP_STATUSES.OK_200, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [result.createdEntity],
      });
  });

  it('should return page 3 and page size 3', async () => {
    const blog = await blogTestMeneger.createBlog(dataTestBlogCreate01);

    const data = {
      ...dataTestPostsCreate01,
      blogId: blog.createdEntity.id,
    };

    const posts = await postsTestManager.createPosts(data);

    await getRequest()
      .get(`${RouterPaths.posts}/?pageSize=3&pageNumber=3`)
      .expect(HTTP_STATUSES.OK_200, {
        pagesCount: 4,
        page: 3,
        pageSize: 3,
        totalCount: 12,
        items: posts.slice(6, 9),
      });
  });

  it('should return posts "asc" ', async () => {
    const blog = await blogTestMeneger.createBlog(dataTestBlogCreate01);

    const data = {
      ...dataTestPostsCreate01,
      blogId: blog.createdEntity.id,
    };

    const posts = await postsTestManager.createPosts(data);

    await getRequest()
      .get(`${RouterPaths.posts}/?pageSize=15&sortDirection=asc`)
      .expect(HTTP_STATUSES.OK_200, {
        pagesCount: 1,
        page: 1,
        pageSize: 15,
        totalCount: 12,
        items: posts.reverse(),
      });
  });

  it('should return 404 fot not existing posts for update', async () => {
    const blog = await blogTestMeneger.createBlog(dataTestBlogCreate01);

    const data = {
      ...dataTestPostsCreate01,
      blogId: blog.createdEntity.id,
    };

    await getRequest()
      .put(`${RouterPaths.posts}/11515`)
      .set('authorization', 'Basic YWRtaW46cXdlcnR5')
      .send(data)
      .expect(HTTP_STATUSES.NOT_FOUND_404);
  });

  it(`shouldn't update posts with UNAUTHORIZED`, async () => {
    const blog = await blogTestMeneger.createBlog(dataTestBlogCreate01);

    const data = {
      ...dataTestPostsCreate01,
      blogId: blog.createdEntity.id,
    };
    const post = await postsTestManager.createPost(data);

    await request(app)
      .put(`${RouterPaths.posts}/${post.createdEntity.id}`)
      .set('authorization', 'Basic YWRtaW')
      .send(data)
      .expect(HTTP_STATUSES.UNAUTHORIZED_401);
  });

  it(`shouldn't update posts with empty title`, async () => {
    const blog = await blogTestMeneger.createBlog(dataTestBlogCreate01);

    const dataPost = {
      ...dataTestPostsCreate01,
      blogId: blog.createdEntity.id,
    };
    const post = await postsTestManager.createPost(dataPost);

    const dataUpdate = {
      ...dataTestPostsCreate01,
      title: incorrectPostData.emptyTitle,
      blogId: blog.createdEntity.id,
    };

    const error: ErrorMessage = [ERRORS_MESSAGES.POST_TITLE];

    await postsTestManager.updatePost(
      post.createdEntity,
      dataUpdate,
      HTTP_STATUSES.BAD_REQUEST_400,
      error,
    );

    await request(app)
      .get(`${RouterPaths.posts}/${post.createdEntity.id}`)
      .expect(HTTP_STATUSES.OK_200, post.createdEntity);
  });

  it(`shouldn't update post with title more than 30 characters`, async () => {
    const blog = await blogTestMeneger.createBlog(dataTestBlogCreate01);

    const dataPost = {
      ...dataTestPostsCreate01,
      blogId: blog.createdEntity.id,
    };
    const post = await postsTestManager.createPost(dataPost);

    const data = {
      ...dataTestPostsCreate01,
      title: incorrectPostData.tooLongTitle,
      blogId: blog.createdEntity.id,
    };

    const error: ErrorMessage = [ERRORS_MESSAGES.POST_TITLE];

    await postsTestManager.updatePost(
      post.createdEntity,
      data,
      HTTP_STATUSES.BAD_REQUEST_400,
      error,
    );

    await request(app)
      .get(`${RouterPaths.posts}/${post.createdEntity.id}`)
      .expect(HTTP_STATUSES.OK_200, post.createdEntity);
  });

  it(`shouldn't update post with empty shortDescription`, async () => {
    const blog = await blogTestMeneger.createBlog(dataTestBlogCreate01);

    const dataPost = {
      ...dataTestPostsCreate01,
      blogId: blog.createdEntity.id,
    };
    const post = await postsTestManager.createPost(dataPost);

    const data = {
      ...dataTestPostsCreate01,
      shortDescription: incorrectPostData.emptyShortDescription,
      blogId: blog.createdEntity.id,
    };

    const error: ErrorMessage = [ERRORS_MESSAGES.POST_SHORT_DESCRIPTION];

    await postsTestManager.updatePost(
      post.createdEntity,
      data,
      HTTP_STATUSES.BAD_REQUEST_400,
      error,
    );

    await request(app)
      .get(`${RouterPaths.posts}/${post.createdEntity.id}`)
      .expect(HTTP_STATUSES.OK_200, post.createdEntity);
  });

  it(`shouldn't update post with shortDescription more than 100 characters`, async () => {
    const blog = await blogTestMeneger.createBlog(dataTestBlogCreate01);

    const dataPost = {
      ...dataTestPostsCreate01,
      blogId: blog.createdEntity.id,
    };
    const post = await postsTestManager.createPost(dataPost);

    const data = {
      ...dataTestPostsCreate01,
      shortDescription: incorrectPostData.tooLongShortDescription,
      blogId: blog.createdEntity.id,
    };

    const error: ErrorMessage = [ERRORS_MESSAGES.POST_SHORT_DESCRIPTION];

    await postsTestManager.updatePost(
      post.createdEntity,
      data,
      HTTP_STATUSES.BAD_REQUEST_400,
      error,
    );

    await request(app)
      .get(`${RouterPaths.posts}/${post.createdEntity.id}`)
      .expect(HTTP_STATUSES.OK_200, post.createdEntity);
  });

  it(`shouldn't update post with empty content`, async () => {
    const blog = await blogTestMeneger.createBlog(dataTestBlogCreate01);

    const dataPost = {
      ...dataTestPostsCreate01,
      blogId: blog.createdEntity.id,
    };
    const post = await postsTestManager.createPost(dataPost);

    const data = {
      ...dataTestPostsCreate01,
      content: incorrectPostData.emptyContent,
      blogId: blog.createdEntity.id,
    };

    const error: ErrorMessage = [ERRORS_MESSAGES.POST_CONTENT];

    await postsTestManager.updatePost(
      post.createdEntity,
      data,
      HTTP_STATUSES.BAD_REQUEST_400,
      error,
    );

    await request(app)
      .get(`${RouterPaths.posts}/${post.createdEntity.id}`)
      .expect(HTTP_STATUSES.OK_200, post.createdEntity);
  });

  it(`shouldn't update post with content more than 1000 characters`, async () => {
    const blog = await blogTestMeneger.createBlog(dataTestBlogCreate01);

    const dataPost = {
      ...dataTestPostsCreate01,
      blogId: blog.createdEntity.id,
    };
    const post = await postsTestManager.createPost(dataPost);

    const data = {
      ...dataTestPostsCreate01,
      content: incorrectPostData.tooLongContent,
      blogId: blog.createdEntity.id,
    };

    const error: ErrorMessage = [ERRORS_MESSAGES.POST_CONTENT];

    await postsTestManager.updatePost(
      post.createdEntity,
      data,
      HTTP_STATUSES.BAD_REQUEST_400,
      error,
    );

    await request(app)
      .get(`${RouterPaths.posts}/${post.createdEntity.id}`)
      .expect(HTTP_STATUSES.OK_200, post.createdEntity);
  });

  it(`shouldn't update post with empty blogId`, async () => {
    const blog = await blogTestMeneger.createBlog(dataTestBlogCreate01);

    const dataPost = {
      ...dataTestPostsCreate01,
      blogId: blog.createdEntity.id,
    };
    const post = await postsTestManager.createPost(dataPost);

    const error: ErrorMessage = [ERRORS_MESSAGES.POST_BLOGID];

    await postsTestManager.updatePost(
      post.createdEntity,
      dataTestPostsCreate01,
      HTTP_STATUSES.BAD_REQUEST_400,
      error,
    );

    await request(app)
      .get(`${RouterPaths.posts}/${post.createdEntity.id}`)
      .expect(HTTP_STATUSES.OK_200, post.createdEntity);
  });

  it(`shouldn't update post with incorrect blogId`, async () => {
    const blog = await blogTestMeneger.createBlog(dataTestBlogCreate01);

    const dataPost = {
      ...dataTestPostsCreate01,
      blogId: blog.createdEntity.id,
    };
    const post = await postsTestManager.createPost(dataPost);

    const data = {
      ...dataTestPostsCreate01,
      blogId: incorrectPostData.incorrectBlogId,
    };

    const error: ErrorMessage = [ERRORS_MESSAGES.POST_BLOGID];

    await postsTestManager.updatePost(
      post.createdEntity,
      data,
      HTTP_STATUSES.BAD_REQUEST_400,
      error,
    );

    await request(app)
      .get(`${RouterPaths.posts}/${post.createdEntity.id}`)
      .expect(HTTP_STATUSES.OK_200, post.createdEntity);
  });

  it(`shouldn't update post with incorrect data`, async () => {
    const blog = await blogTestMeneger.createBlog(dataTestBlogCreate01);

    const dataPost = {
      ...dataTestPostsCreate01,
      blogId: blog.createdEntity.id,
    };
    const post = await postsTestManager.createPost(dataPost);

    const data = {
      ...dataTestPostsCreate01,
      blogId: incorrectPostData.incorrectBlogId,
      title: incorrectPostData.emptyTitle,
      content: incorrectPostData.emptyContent,
      shortDescription: incorrectPostData.emptyShortDescription,
    };

    const error: ErrorMessage = [
      ERRORS_MESSAGES.POST_SHORT_DESCRIPTION,
      ERRORS_MESSAGES.POST_TITLE,
      ERRORS_MESSAGES.POST_CONTENT,
      ERRORS_MESSAGES.POST_BLOGID,
    ];

    await postsTestManager.updatePost(
      post.createdEntity,
      data,
      HTTP_STATUSES.BAD_REQUEST_400,
      error,
    );

    await request(app)
      .get(`${RouterPaths.posts}/${post.createdEntity.id}`)
      .expect(HTTP_STATUSES.OK_200, post.createdEntity);
  });

  it(`should update post with correct input module`, async () => {
    const blog = await blogTestMeneger.createBlog(dataTestBlogCreate01);

    const dataPost1 = {
      ...dataTestPostsCreate01,
      blogId: blog.createdEntity.id,
    };
    const post1 = await postsTestManager.createPost(dataPost1);

    const dataPost2 = {
      ...dataTestPostsCreate02,
      blogId: blog.createdEntity.id,
    };
    const post2 = await postsTestManager.createPost(dataPost2);

    const data = {
      ...dataTestPostUpdate01,
      blogId: blog.createdEntity.id,
    };

    await postsTestManager.updatePost(post1.createdEntity, data);

    await request(app)
      .get(`${RouterPaths.posts}/${post2.createdEntity.id}`)
      .expect(HTTP_STATUSES.OK_200, post2.createdEntity);
  });

  it(`shouldn't delete post`, async () => {
    await request(app)
      .delete(`${RouterPaths.posts}/7779161`)
      .set('authorization', 'Basic YWRtaW46cXdlcnR5')
      .expect(HTTP_STATUSES.NOT_FOUND_404);
  });

  it(`should delete both posts`, async () => {
    const blog = await blogTestMeneger.createBlog(dataTestBlogCreate01);

    const dataPost = {
      ...dataTestPostsCreate01,
      blogId: blog.createdEntity.id,
    };
    const post = await postsTestManager.createPost(dataPost);

    await request(app)
      .delete(`${RouterPaths.posts}/${post.createdEntity.id}`)
      .set('authorization', 'Basic YWRtaW46cXdlcnR5')
      .expect(HTTP_STATUSES.NO_CONTENT_204);

    await request(app)
      .get(`${RouterPaths.posts}/${post.createdEntity.id}`)
      .expect(HTTP_STATUSES.NOT_FOUND_404);

    await request(app).get(RouterPaths.posts).expect(HTTP_STATUSES.OK_200, {
      pagesCount: 0,
      page: 1,
      pageSize: 10,
      totalCount: 0,
      items: [],
    });
  });
});
