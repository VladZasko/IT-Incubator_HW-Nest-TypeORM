import request from 'supertest';
import { RouterPaths } from '../../../src/routerPaths';
import { dataTestPostsCreate01 } from './dataForTest/dataTestforPost';
import { PostsTestManager } from './utils/postsTestManager';
import { dataTestBlogCreate01 } from '../blogs/dataForTest/dataTestforBlog';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../../src/app.module';
import { applyAppSettings } from '../../../src/settings/apply.app.settings';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { BlogTestMeneger } from '../blogs/utils/blogTestMeneger';
import { EmailAdapter } from '../../../src/features/auth/adapters/email-adapter';
import { AuthQueryRepository } from '../../../src/features/auth/repository/auth.query.repository';
import { AuthTestManager } from '../auth/utils/authTestManager';
import { dataTestUserAuth } from '../auth/dataForTest/dataTestforAuth';
import { dataTestUserCreate01 } from '../users/dataForTest/dataTestforUser';
import { UsersTestManager } from '../users/utils/usersTestManager';
import { LikesStatus } from '../../../src/features/posts/models/output/PostsViewModel';

describe('/posts', () => {
  let app: INestApplication;
  let httpServer;
  let postsTestManager: PostsTestManager;
  let blogTestMeneger: BlogTestMeneger;
  let emailAdapter: EmailAdapter;
  let authQueryRepository: AuthQueryRepository;
  let authTestManager: AuthTestManager;
  let usersTestManager: UsersTestManager;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    applyAppSettings(app);
    await app.init();

    httpServer = app.getHttpServer();

    blogTestMeneger = new BlogTestMeneger(app);
    postsTestManager = new PostsTestManager(app);
    emailAdapter = moduleFixture.get<EmailAdapter>(EmailAdapter);
    authQueryRepository =
      moduleFixture.get<AuthQueryRepository>(AuthQueryRepository);
    usersTestManager = new UsersTestManager(app);
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
    await request(httpServer).get(RouterPaths.posts).expect(HttpStatus.OK, {
      pagesCount: 0,
      page: 1,
      pageSize: 10,
      totalCount: 0,
      items: [],
    });
  });

  it('should return 404 fot not existing posts', async () => {
    await request(httpServer)
      .get(`${RouterPaths.posts}/1`)
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('should return page 3 and page size 3', async () => {
    const blog = await blogTestMeneger.createBlog(dataTestBlogCreate01);

    const posts = await blogTestMeneger.createPostsByBlog(
      blog.createdEntity,
      dataTestPostsCreate01,
    );

    await request(httpServer)
      .get(`${RouterPaths.posts}/?pageSize=3&pageNumber=3`)
      .expect(HttpStatus.OK, {
        pagesCount: 4,
        page: 3,
        pageSize: 3,
        totalCount: 12,
        items: posts.slice(6, 9),
      });
  });

  it('should return posts "asc" ', async () => {
    const blog = await blogTestMeneger.createBlog(dataTestBlogCreate01);

    const posts = await blogTestMeneger.createPostsByBlog(
      blog.createdEntity,
      dataTestPostsCreate01,
    );

    await request(httpServer)
      .get(`${RouterPaths.posts}/?pageSize=15&sortDirection=asc`)
      .expect(HttpStatus.OK, {
        pagesCount: 1,
        page: 1,
        pageSize: 15,
        totalCount: 12,
        items: posts.reverse(),
      });
  });

  it(`should update like with correct input model`, async () => {
    const user = await usersTestManager.createUserAdmin(dataTestUserCreate01);
    const blog = await blogTestMeneger.createBlog(dataTestBlogCreate01);

    const post = await blogTestMeneger.createPostByBlog(
      blog.createdEntity,
      dataTestPostsCreate01,
    );

    const data = {
      likeStatus: LikesStatus.Like,
    };

    const token = await authTestManager.createToken(dataTestUserAuth);

    await postsTestManager.updateLikeForPost(
      post.createdEntity,
      data,
      token.createdEntity.accessToken,
      user.createdEntity,
    );
  });

  it(`should update dislike with correct input model`, async () => {
    const user = await usersTestManager.createUserAdmin(dataTestUserCreate01);
    const blog = await blogTestMeneger.createBlog(dataTestBlogCreate01);

    const post = await blogTestMeneger.createPostByBlog(
      blog.createdEntity,
      dataTestPostsCreate01,
    );

    const data = {
      likeStatus: LikesStatus.Dislike,
    };

    const token = await authTestManager.createToken(dataTestUserAuth);

    await postsTestManager.updateDislikeForPost(
      post.createdEntity,
      data,
      token.createdEntity.accessToken,
      user.createdEntity,
    );
  });
});
