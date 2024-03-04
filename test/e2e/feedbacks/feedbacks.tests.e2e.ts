import request from 'supertest';
import { app } from '../../../src/app';
import { HTTP_STATUSES } from '../../../src/utils/utils';
import { RouterPaths } from '../../../src/routerPaths';
import {
  dataTestFeedbackCreate01,
  dataTestFeedbackUpdate,
  tooLongContent,
  tooShortContent,
} from './dataForTest/dataTestforFeedbacks';
import { ErrorMessage, ERRORS_MESSAGES } from '../../../src/utils/errors';
import { feedbacksTestManager } from './utils/feedbacksTestManager';
import { usersTestManager } from '../users/utils/usersTestManager';
import {
  dataTestUserCreate01,
  dataTestUserCreate02,
} from '../users/dataForTest/dataTestforUser';
import { dbControl } from '../../../src/db/db';
import { AuthTestManager } from '../auth/utils/authTestManager';
import {
  dataTestUserAuth,
  dataTestUserAuth2,
} from '../auth/dataForTest/dataTestforAuth';
import { postsTestManager } from '../posts/utils/postsTestManager';
import { dataTestPostsCreate01 } from '../posts/dataForTest/dataTestforPost';
import { blogTestMeneger } from '../blogs/utils/blogTestMeneger';
import { dataTestBlogCreate01 } from '../blogs/dataForTest/dataTestforBlog';

const getRequest = () => {
  return request(app);
};
describe('/feedback tests', () => {
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
    const blog = await blogTestMeneger.createBlog(dataTestBlogCreate01);
    const post = await postsTestManager.createPost({
      ...dataTestPostsCreate01,
      blogId: blog.createdEntity.id,
    });

    await getRequest()
      .get(`${RouterPaths.posts}/${post.createdEntity.id}/comments`)
      .expect(HTTP_STATUSES.OK_200, {
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: [],
      });
  });

  it('should return 404 fot not existing comment', async () => {
    await getRequest()
      .get(`${RouterPaths.feedbacks}/1`)
      .expect(HTTP_STATUSES.NOT_FOUND_404);
  });

  it('should return comment with id', async () => {
    await usersTestManager.createUserAdmin(dataTestUserCreate01);

    const blog = await blogTestMeneger.createBlog(dataTestBlogCreate01);
    const post = await postsTestManager.createPost({
      ...dataTestPostsCreate01,
      blogId: blog.createdEntity.id,
    });

    const token = await AuthTestManager.createToken(dataTestUserAuth);

    const comment = await feedbacksTestManager.createComment(
      dataTestFeedbackCreate01,
      post.createdEntity,
      token.createdEntity.accessToken,
    );

    await request(app)
      .get(`${RouterPaths.feedbacks}/${comment.createdEntity.id}`)
      .expect(HTTP_STATUSES.OK_200, comment.createdEntity);
  });

  it(`shouldn't create comment with incorrect JWT token`, async () => {
    const blog = await blogTestMeneger.createBlog(dataTestBlogCreate01);
    const post = await postsTestManager.createPost({
      ...dataTestPostsCreate01,
      blogId: blog.createdEntity.id,
    });

    await feedbacksTestManager.createComment(
      dataTestFeedbackCreate01,
      post,
      `Bearer YWRtaW46cXdlcnR5`,
      HTTP_STATUSES.UNAUTHORIZED_401,
    );

    await request(app)
      .get(`${RouterPaths.posts}/${post.createdEntity.id}/comments`)
      .expect(HTTP_STATUSES.OK_200, {
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: [],
      });
  });

  it(`shouldn't create comment with incorrect type authorization`, async () => {
    await usersTestManager.createUserAdmin(dataTestUserCreate01);

    const blog = await blogTestMeneger.createBlog(dataTestBlogCreate01);
    const post = await postsTestManager.createPost({
      ...dataTestPostsCreate01,
      blogId: blog.createdEntity.id,
    });
    const token = await AuthTestManager.createToken(dataTestUserAuth);

    await feedbacksTestManager.createComment(
      dataTestFeedbackCreate01,
      post,
      `Basic ${token.createdEntity.accessToken}`,
      HTTP_STATUSES.UNAUTHORIZED_401,
    );

    await request(app)
      .get(`${RouterPaths.posts}/${post.createdEntity.id}/comments`)
      .expect(HTTP_STATUSES.OK_200, {
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: [],
      });
  });

  it(`shouldn't create comment with short content`, async () => {
    await usersTestManager.createUserAdmin(dataTestUserCreate01);

    const blog = await blogTestMeneger.createBlog(dataTestBlogCreate01);
    const post = await postsTestManager.createPost({
      ...dataTestPostsCreate01,
      blogId: blog.createdEntity.id,
    });
    const token = await AuthTestManager.createToken(dataTestUserAuth);

    const error: ErrorMessage = [ERRORS_MESSAGES.FEEDBACKS_CONTENT];

    await feedbacksTestManager.createComment(
      tooShortContent,
      post,
      token.createdEntity.accessToken,
      HTTP_STATUSES.BAD_REQUEST_400,
      error,
    );

    await request(app)
      .get(`${RouterPaths.posts}/${post.createdEntity.id}/comments`)
      .expect(HTTP_STATUSES.OK_200, {
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: [],
      });
  });

  it(`shouldn't create comment with long content`, async () => {
    await usersTestManager.createUserAdmin(dataTestUserCreate01);

    const blog = await blogTestMeneger.createBlog(dataTestBlogCreate01);
    const post = await postsTestManager.createPost({
      ...dataTestPostsCreate01,
      blogId: blog.createdEntity.id,
    });
    const token = await AuthTestManager.createToken(dataTestUserAuth);

    const error: ErrorMessage = [ERRORS_MESSAGES.FEEDBACKS_CONTENT];

    await feedbacksTestManager.createComment(
      tooLongContent,
      post,
      token.createdEntity.accessToken,
      HTTP_STATUSES.BAD_REQUEST_400,
      error,
    );

    await request(app)
      .get(`${RouterPaths.posts}/${post.createdEntity.id}/comments`)
      .expect(HTTP_STATUSES.OK_200, {
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: [],
      });
  });

  it(`should create comment`, async () => {
    await usersTestManager.createUserAdmin(dataTestUserCreate01);

    const blog = await blogTestMeneger.createBlog(dataTestBlogCreate01);
    const post = await postsTestManager.createPost({
      ...dataTestPostsCreate01,
      blogId: blog.createdEntity.id,
    });
    const token = await AuthTestManager.createToken(dataTestUserAuth);

    const result = await feedbacksTestManager.createComment(
      dataTestFeedbackCreate01,
      post.createdEntity,
      token.createdEntity.accessToken,
    );

    const newComment = result.createdEntity;
    await request(app)
      .get(`${RouterPaths.posts}/${post.createdEntity.id}/comments`)
      .expect(HTTP_STATUSES.OK_200, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [newComment],
      });
  });

  it(`should create 12 users with correct input data`, async () => {
    await usersTestManager.createUserAdmin(dataTestUserCreate01);

    const blog = await blogTestMeneger.createBlog(dataTestBlogCreate01);
    const post = await postsTestManager.createPost({
      ...dataTestPostsCreate01,
      blogId: blog.createdEntity.id,
    });
    const token = await AuthTestManager.createToken(dataTestUserAuth);

    const comments = await feedbacksTestManager.createComments(
      dataTestFeedbackCreate01,
      post.createdEntity,
      token.createdEntity.accessToken,
    );

    await request(app)
      .get(`${RouterPaths.posts}/${post.createdEntity.id}/comments?pageSize=15`)
      .expect(HTTP_STATUSES.OK_200, {
        pagesCount: 1,
        page: 1,
        pageSize: 15,
        totalCount: 12,
        items: comments,
      });
  });

  it('should return page 3 and page size 3', async () => {
    await usersTestManager.createUserAdmin(dataTestUserCreate01);

    const blog = await blogTestMeneger.createBlog(dataTestBlogCreate01);
    const post = await postsTestManager.createPost({
      ...dataTestPostsCreate01,
      blogId: blog.createdEntity.id,
    });
    const token = await AuthTestManager.createToken(dataTestUserAuth);

    const comments = await feedbacksTestManager.createComments(
      dataTestFeedbackCreate01,
      post.createdEntity,
      token.createdEntity.accessToken,
    );

    await request(app)
      .get(
        `${RouterPaths.posts}/${post.createdEntity.id}/comments?pageSize=3&pageNumber=3`,
      )
      .expect(HTTP_STATUSES.OK_200, {
        pagesCount: 4,
        page: 3,
        pageSize: 3,
        totalCount: 12,
        items: comments.slice(6, 9),
      });
  });

  it('should return posts "asc" ', async () => {
    await usersTestManager.createUserAdmin(dataTestUserCreate01);

    const blog = await blogTestMeneger.createBlog(dataTestBlogCreate01);
    const post = await postsTestManager.createPost({
      ...dataTestPostsCreate01,
      blogId: blog.createdEntity.id,
    });
    const token = await AuthTestManager.createToken(dataTestUserAuth);

    const comments = await feedbacksTestManager.createComments(
      dataTestFeedbackCreate01,
      post.createdEntity,
      token.createdEntity.accessToken,
    );

    await getRequest()
      .get(
        `${RouterPaths.posts}/${post.createdEntity.id}/comments?pageSize=15&sortDirection=asc`,
      )
      .set('authorization', 'Basic YWRtaW46cXdlcnR5')
      .expect(HTTP_STATUSES.OK_200, {
        pagesCount: 1,
        page: 1,
        pageSize: 15,
        totalCount: 12,
        items: comments.reverse(),
      });
  });

  it(`shouldn't update comment with unauthorized`, async () => {
    await usersTestManager.createUserAdmin(dataTestUserCreate01);

    const blog = await blogTestMeneger.createBlog(dataTestBlogCreate01);
    const post = await postsTestManager.createPost({
      ...dataTestPostsCreate01,
      blogId: blog.createdEntity.id,
    });
    const token = await AuthTestManager.createToken(dataTestUserAuth);

    const comment = await feedbacksTestManager.createComment(
      dataTestFeedbackCreate01,
      post.createdEntity,
      token.createdEntity.accessToken,
    );

    await feedbacksTestManager.updateComment(
      dataTestFeedbackUpdate,
      comment.createdEntity,
      `Bearer YWRtaW`,
      HTTP_STATUSES.UNAUTHORIZED_401,
    );

    await request(app)
      .get(`${RouterPaths.posts}/${post.createdEntity.id}/comments`)
      .expect(HTTP_STATUSES.OK_200, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [comment.createdEntity],
      });
  });

  it(`shouldn't update comment with short content`, async () => {
    await usersTestManager.createUserAdmin(dataTestUserCreate01);

    const blog = await blogTestMeneger.createBlog(dataTestBlogCreate01);
    const post = await postsTestManager.createPost({
      ...dataTestPostsCreate01,
      blogId: blog.createdEntity.id,
    });
    const token = await AuthTestManager.createToken(dataTestUserAuth);

    const comment = await feedbacksTestManager.createComment(
      dataTestFeedbackUpdate,
      post.createdEntity,
      token.createdEntity.accessToken,
    );

    await feedbacksTestManager.updateComment(
      tooShortContent,
      comment.createdEntity,
      token.createdEntity.accessToken,
      HTTP_STATUSES.BAD_REQUEST_400,
      [ERRORS_MESSAGES.FEEDBACKS_CONTENT],
    );

    await request(app)
      .get(`${RouterPaths.posts}/${post.createdEntity.id}/comments`)
      .expect(HTTP_STATUSES.OK_200, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [comment.createdEntity],
      });
  });

  it(`shouldn't update comment with loong content`, async () => {
    await usersTestManager.createUserAdmin(dataTestUserCreate01);

    const blog = await blogTestMeneger.createBlog(dataTestBlogCreate01);
    const post = await postsTestManager.createPost({
      ...dataTestPostsCreate01,
      blogId: blog.createdEntity.id,
    });
    const token = await AuthTestManager.createToken(dataTestUserAuth);

    const comment = await feedbacksTestManager.createComment(
      dataTestFeedbackUpdate,
      post.createdEntity,
      token.createdEntity.accessToken,
    );

    await feedbacksTestManager.updateComment(
      tooLongContent,
      comment.createdEntity,
      token.createdEntity.accessToken,
      HTTP_STATUSES.BAD_REQUEST_400,
      [ERRORS_MESSAGES.FEEDBACKS_CONTENT],
    );

    await request(app)
      .get(`${RouterPaths.posts}/${post.createdEntity.id}/comments`)
      .expect(HTTP_STATUSES.OK_200, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [comment.createdEntity],
      });
  });

  it(`shouldn't update someone else's comment`, async () => {
    await usersTestManager.createUserAdmin(dataTestUserCreate01);
    await usersTestManager.createUserAdmin(dataTestUserCreate02);

    const blog = await blogTestMeneger.createBlog(dataTestBlogCreate01);
    const post = await postsTestManager.createPost({
      ...dataTestPostsCreate01,
      blogId: blog.createdEntity.id,
    });
    const tokenUser1 = await AuthTestManager.createToken(dataTestUserAuth);
    const tokenUser2 = await AuthTestManager.createToken(dataTestUserAuth2);

    const comment = await feedbacksTestManager.createComment(
      dataTestFeedbackUpdate,
      post.createdEntity,
      tokenUser1.createdEntity.accessToken,
    );

    await feedbacksTestManager.updateComment(
      dataTestFeedbackUpdate,
      comment.createdEntity,
      tokenUser2.createdEntity.accessToken,
      HTTP_STATUSES.FORBIDDEN_403,
    );

    await request(app)
      .get(`${RouterPaths.posts}/${post.createdEntity.id}/comments`)
      .expect(HTTP_STATUSES.OK_200, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [comment.createdEntity],
      });
  });

  it(`should update comment`, async () => {
    await usersTestManager.createUserAdmin(dataTestUserCreate01);

    const blog = await blogTestMeneger.createBlog(dataTestBlogCreate01);
    const post = await postsTestManager.createPost({
      ...dataTestPostsCreate01,
      blogId: blog.createdEntity.id,
    });
    const token = await AuthTestManager.createToken(dataTestUserAuth);

    const comment = await feedbacksTestManager.createComment(
      dataTestFeedbackUpdate,
      post.createdEntity,
      token.createdEntity.accessToken,
    );

    await feedbacksTestManager.updateComment(
      dataTestFeedbackUpdate,
      comment.createdEntity,
      token.createdEntity.accessToken,
    );

    await request(app)
      .get(`${RouterPaths.posts}/${post.createdEntity.id}/comments`)
      .expect(HTTP_STATUSES.OK_200, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [
          {
            ...comment.createdEntity,
            content: dataTestFeedbackUpdate.content,
          },
        ],
      });
  });

  it(`shouldn't delete comment with unauthorized`, async () => {
    await usersTestManager.createUserAdmin(dataTestUserCreate01);

    const blog = await blogTestMeneger.createBlog(dataTestBlogCreate01);
    const post = await postsTestManager.createPost({
      ...dataTestPostsCreate01,
      blogId: blog.createdEntity.id,
    });
    const token = await AuthTestManager.createToken(dataTestUserAuth);

    const comment = await feedbacksTestManager.createComment(
      dataTestFeedbackUpdate,
      post.createdEntity,
      token.createdEntity.accessToken,
    );

    await feedbacksTestManager.deleteComment(
      comment.createdEntity,
      `Basic ${token.createdEntity.accessToken}`,
      HTTP_STATUSES.UNAUTHORIZED_401,
    );

    await request(app)
      .get(`${RouterPaths.posts}/${post.createdEntity.id}/comments`)
      .expect(HTTP_STATUSES.OK_200, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [comment.createdEntity],
      });
  });

  it(`shouldn't delete, should return 404 fot not existing comment`, async () => {
    await usersTestManager.createUserAdmin(dataTestUserCreate01);

    const blog = await blogTestMeneger.createBlog(dataTestBlogCreate01);
    const post = await postsTestManager.createPost({
      ...dataTestPostsCreate01,
      blogId: blog.createdEntity.id,
    });
    const token = await AuthTestManager.createToken(dataTestUserAuth);

    const comment = await feedbacksTestManager.createComment(
      dataTestFeedbackUpdate,
      post.createdEntity,
      token.createdEntity.accessToken,
    );

    await feedbacksTestManager.deleteComment(
      '123',
      token.createdEntity.accessToken,
      HTTP_STATUSES.NOT_FOUND_404,
    );

    await request(app)
      .get(`${RouterPaths.posts}/${post.createdEntity.id}/comments`)
      .expect(HTTP_STATUSES.OK_200, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [comment.createdEntity],
      });
  });

  it(`shouldn't delete someone else's comment`, async () => {
    await usersTestManager.createUserAdmin(dataTestUserCreate01);
    await usersTestManager.createUserAdmin(dataTestUserCreate02);

    const blog = await blogTestMeneger.createBlog(dataTestBlogCreate01);
    const post = await postsTestManager.createPost({
      ...dataTestPostsCreate01,
      blogId: blog.createdEntity.id,
    });
    const tokenUser1 = await AuthTestManager.createToken(dataTestUserAuth);
    const tokenUser2 = await AuthTestManager.createToken(dataTestUserAuth2);

    const comment = await feedbacksTestManager.createComment(
      dataTestFeedbackUpdate,
      post.createdEntity,
      tokenUser1.createdEntity.accessToken,
    );

    await feedbacksTestManager.deleteComment(
      comment.createdEntity,
      tokenUser2.createdEntity.accessToken,
      HTTP_STATUSES.FORBIDDEN_403,
    );

    await request(app)
      .get(`${RouterPaths.posts}/${post.createdEntity.id}/comments`)
      .expect(HTTP_STATUSES.OK_200, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [comment.createdEntity],
      });
  });

  it(`should delete comment`, async () => {
    await usersTestManager.createUserAdmin(dataTestUserCreate01);

    const blog = await blogTestMeneger.createBlog(dataTestBlogCreate01);
    const post = await postsTestManager.createPost({
      ...dataTestPostsCreate01,
      blogId: blog.createdEntity.id,
    });
    const token = await AuthTestManager.createToken(dataTestUserAuth);

    const comment = await feedbacksTestManager.createComment(
      dataTestFeedbackUpdate,
      post.createdEntity,
      token.createdEntity.accessToken,
    );

    await feedbacksTestManager.deleteComment(
      comment.createdEntity,
      token.createdEntity.accessToken,
    );

    await request(app)
      .get(`${RouterPaths.posts}/${post.createdEntity.id}/comments`)
      .expect(HTTP_STATUSES.OK_200, {
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: [],
      });
  });
});
