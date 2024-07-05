import request from 'supertest';
import { RouterPaths } from '../../../src/routerPaths';
import {
  dataTestFeedbackCreate01,
  dataTestFeedbackUpdate,
  tooLongContent,
  tooShortContent,
} from './dataForTest/dataTestforFeedbacks';
import { FeedbacksTestManager } from './utils/feedbacksTestManager';
import {
  dataTestUserCreate01,
  dataTestUserCreate02,
} from '../users/dataForTest/dataTestforUser';
import { AuthTestManager } from '../auth/utils/authTestManager';
import {
  dataTestUserAuth,
  dataTestUserAuth2,
} from '../auth/dataForTest/dataTestforAuth';
import { dataTestPostsCreate01 } from '../posts/dataForTest/dataTestforPost';
import { dataTestBlogCreate01 } from '../blogs/dataForTest/dataTestforBlog';
import {HttpStatus, INestApplication} from "@nestjs/common";
import {BlogTestMeneger} from "../blogs/utils/blogTestMeneger";
import {Test, TestingModule} from "@nestjs/testing";
import {AppModule} from "../../../src/app.module";
import {applyAppSettings} from "../../../src/settings/apply.app.settings";
import {UsersTestManager} from "../users/utils/usersTestManager";
import {EmailAdapter} from "../../../src/features/auth/adapters/email-adapter";
import {AuthQueryRepository} from "../../../src/features/auth/auth.query.repository";
import {PostsTestManager} from "../posts/utils/postsTestManager";


describe('/feedback tests', () => {
    let app: INestApplication;
    let httpServer;
    let blogTestMeneger: BlogTestMeneger;
    let feedbacksTestManager: FeedbacksTestManager;
    let usersTestManager: UsersTestManager;
    let emailAdapter: EmailAdapter;
    let authQueryRepository: AuthQueryRepository;
    let authTestManager: AuthTestManager;
    let postsTestManager: PostsTestManager;



    beforeAll(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
          imports: [AppModule],
      }).compile();

      app = moduleFixture.createNestApplication();
      applyAppSettings(app);
      await app.init();

      httpServer = app.getHttpServer();

      feedbacksTestManager = new FeedbacksTestManager(app);
      blogTestMeneger = new BlogTestMeneger(app);
      usersTestManager = new UsersTestManager(app);
      postsTestManager = new PostsTestManager(app);
      emailAdapter = moduleFixture.get<EmailAdapter>(EmailAdapter);
      authQueryRepository = moduleFixture.get<AuthQueryRepository>(AuthQueryRepository);
      authTestManager = new AuthTestManager(
          authQueryRepository,
          app,
          emailAdapter,
      );

    });

  beforeEach(async () => {
    await request(httpServer).delete('/testing/all-data');
  });

  afterAll(async () => {
      await app.close();
  });

  it('should return 200 and empty array', async () => {
    const blog = await blogTestMeneger.createBlog(dataTestBlogCreate01);
    const post = await postsTestManager.createPost({
      ...dataTestPostsCreate01,
      blogId: blog.createdEntity.id,
    });

    await request(httpServer)
      .get(`${RouterPaths.posts}/${post.createdEntity.id}/comments`)
      .expect(HttpStatus.OK, {
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: [],
      });
  });

  it('should return 404 fot not existing comment', async () => {
    await request(httpServer)
      .get(`${RouterPaths.feedbacks}/1`)
      .expect(HttpStatus.NOT_FOUND);
  });

  it('should return comment with id', async () => {
    await usersTestManager.createUserAdmin(dataTestUserCreate01);

    const blog = await blogTestMeneger.createBlog(dataTestBlogCreate01);
    const post = await postsTestManager.createPost({
      ...dataTestPostsCreate01,
      blogId: blog.createdEntity.id,
    });

    const token = await authTestManager.createToken(dataTestUserAuth);

    const comment = await feedbacksTestManager.createComment(
      dataTestFeedbackCreate01,
      post.createdEntity,
      token.createdEntity.accessToken,
    );

    await request(httpServer)
      .get(`${RouterPaths.feedbacks}/${comment.createdEntity.id}`)
      .expect(HttpStatus.OK, comment.createdEntity);
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
        HttpStatus.UNAUTHORIZED,
    );

    await request(httpServer)
      .get(`${RouterPaths.posts}/${post.createdEntity.id}/comments`)
      .expect(HttpStatus.OK, {
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
    const token = await authTestManager.createToken(dataTestUserAuth);

    await feedbacksTestManager.createComment(
      dataTestFeedbackCreate01,
      post,
      `Basic ${token.createdEntity.accessToken}`,
        HttpStatus.UNAUTHORIZED,
    );

    await request(httpServer)
      .get(`${RouterPaths.posts}/${post.createdEntity.id}/comments`)
      .expect(HttpStatus.OK, {
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
    const token = await authTestManager.createToken(dataTestUserAuth);

    await feedbacksTestManager.createComment(
      tooShortContent,
      post,
      token.createdEntity.accessToken,
        HttpStatus.BAD_REQUEST,
      1,
    );

    await request(httpServer)
      .get(`${RouterPaths.posts}/${post.createdEntity.id}/comments`)
      .expect(HttpStatus.OK, {
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
    const token = await authTestManager.createToken(dataTestUserAuth);

    await feedbacksTestManager.createComment(
      tooLongContent,
      post,
      token.createdEntity.accessToken,
        HttpStatus.BAD_REQUEST,
      1,
    );

    await request(httpServer)
      .get(`${RouterPaths.posts}/${post.createdEntity.id}/comments`)
      .expect(HttpStatus.OK, {
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
    const token = await authTestManager.createToken(dataTestUserAuth);

    const result = await feedbacksTestManager.createComment(
      dataTestFeedbackCreate01,
      post.createdEntity,
      token.createdEntity.accessToken,
    );

    const newComment = result.createdEntity;
    await request(httpServer)
      .get(`${RouterPaths.posts}/${post.createdEntity.id}/comments`)
      .expect(HttpStatus.OK, {
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
    const token = await authTestManager.createToken(dataTestUserAuth);

    const comments = await feedbacksTestManager.createComments(
      dataTestFeedbackCreate01,
      post.createdEntity,
      token.createdEntity.accessToken,
    );

    await request(httpServer)
      .get(`${RouterPaths.posts}/${post.createdEntity.id}/comments?pageSize=15`)
      .expect(HttpStatus.OK, {
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
    const token = await authTestManager.createToken(dataTestUserAuth);

    const comments = await feedbacksTestManager.createComments(
      dataTestFeedbackCreate01,
      post.createdEntity,
      token.createdEntity.accessToken,
    );

    await request(httpServer)
      .get(
        `${RouterPaths.posts}/${post.createdEntity.id}/comments?pageSize=3&pageNumber=3`,
      )
      .expect(HttpStatus.OK, {
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
    const token = await authTestManager.createToken(dataTestUserAuth);

    const comments = await feedbacksTestManager.createComments(
      dataTestFeedbackCreate01,
      post.createdEntity,
      token.createdEntity.accessToken,
    );

    await request(httpServer)
      .get(
        `${RouterPaths.posts}/${post.createdEntity.id}/comments?pageSize=15&sortDirection=asc`,
      )
      .set('authorization', 'Basic YWRtaW46cXdlcnR5')
      .expect(HttpStatus.OK, {
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
    const token = await authTestManager.createToken(dataTestUserAuth);

    const comment = await feedbacksTestManager.createComment(
      dataTestFeedbackCreate01,
      post.createdEntity,
      token.createdEntity.accessToken,
    );

    await feedbacksTestManager.updateComment(
      dataTestFeedbackUpdate,
      comment.createdEntity,
      `Bearer YWRtaW`,
        HttpStatus.UNAUTHORIZED,
    );

    await request(httpServer)
      .get(`${RouterPaths.posts}/${post.createdEntity.id}/comments`)
      .expect(HttpStatus.OK, {
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
    const token = await authTestManager.createToken(dataTestUserAuth);

    const comment = await feedbacksTestManager.createComment(
      dataTestFeedbackUpdate,
      post.createdEntity,
      token.createdEntity.accessToken,
    );

    await feedbacksTestManager.updateComment(
      tooShortContent,
      comment.createdEntity,
      token.createdEntity.accessToken,
        HttpStatus.BAD_REQUEST,
      1,
    );

    await request(httpServer)
      .get(`${RouterPaths.posts}/${post.createdEntity.id}/comments`)
      .expect(HttpStatus.OK, {
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
    const token = await authTestManager.createToken(dataTestUserAuth);

    const comment = await feedbacksTestManager.createComment(
      dataTestFeedbackUpdate,
      post.createdEntity,
      token.createdEntity.accessToken,
    );

    await feedbacksTestManager.updateComment(
      tooLongContent,
      comment.createdEntity,
      token.createdEntity.accessToken,
        HttpStatus.BAD_REQUEST,
      1,
    );

    await request(httpServer)
      .get(`${RouterPaths.posts}/${post.createdEntity.id}/comments`)
      .expect(HttpStatus.OK, {
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
    const tokenUser1 = await authTestManager.createToken(dataTestUserAuth);
    const tokenUser2 = await authTestManager.createToken(dataTestUserAuth2);

    const comment = await feedbacksTestManager.createComment(
      dataTestFeedbackUpdate,
      post.createdEntity,
      tokenUser1.createdEntity.accessToken,
    );

    await feedbacksTestManager.updateComment(
      dataTestFeedbackUpdate,
      comment.createdEntity,
      tokenUser2.createdEntity.accessToken,
        HttpStatus.FORBIDDEN,
    );

    await request(httpServer)
      .get(`${RouterPaths.posts}/${post.createdEntity.id}/comments`)
      .expect(HttpStatus.OK, {
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
    const token = await authTestManager.createToken(dataTestUserAuth);

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

    await request(httpServer)
      .get(`${RouterPaths.posts}/${post.createdEntity.id}/comments`)
      .expect(HttpStatus.OK, {
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
    const token = await authTestManager.createToken(dataTestUserAuth);

    const comment = await feedbacksTestManager.createComment(
      dataTestFeedbackUpdate,
      post.createdEntity,
      token.createdEntity.accessToken,
    );

    await feedbacksTestManager.deleteComment(
      comment.createdEntity,
      `Basic ${token.createdEntity.accessToken}`,
        HttpStatus.UNAUTHORIZED,
    );

    await request(httpServer)
      .get(`${RouterPaths.posts}/${post.createdEntity.id}/comments`)
      .expect(HttpStatus.OK, {
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
    const token = await authTestManager.createToken(dataTestUserAuth);

    const comment = await feedbacksTestManager.createComment(
      dataTestFeedbackUpdate,
      post.createdEntity,
      token.createdEntity.accessToken,
    );

    await feedbacksTestManager.deleteComment(
      '123',
      token.createdEntity.accessToken,
        HttpStatus.NOT_FOUND,
    );

    await request(httpServer)
      .get(`${RouterPaths.posts}/${post.createdEntity.id}/comments`)
      .expect(HttpStatus.OK, {
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
    const tokenUser1 = await authTestManager.createToken(dataTestUserAuth);
    const tokenUser2 = await authTestManager.createToken(dataTestUserAuth2);

    const comment = await feedbacksTestManager.createComment(
      dataTestFeedbackUpdate,
      post.createdEntity,
      tokenUser1.createdEntity.accessToken,
    );

    await feedbacksTestManager.deleteComment(
      comment.createdEntity,
      tokenUser2.createdEntity.accessToken,
        HttpStatus.FORBIDDEN,
    );

    await request(httpServer)
      .get(`${RouterPaths.posts}/${post.createdEntity.id}/comments`)
      .expect(HttpStatus.OK, {
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
    const token = await authTestManager.createToken(dataTestUserAuth);

    const comment = await feedbacksTestManager.createComment(
      dataTestFeedbackUpdate,
      post.createdEntity,
      token.createdEntity.accessToken,
    );

    await feedbacksTestManager.deleteComment(
      comment.createdEntity,
      token.createdEntity.accessToken,
    );

    await request(httpServer)
      .get(`${RouterPaths.posts}/${post.createdEntity.id}/comments`)
      .expect(HttpStatus.OK, {
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: [],
      });
  });
});
