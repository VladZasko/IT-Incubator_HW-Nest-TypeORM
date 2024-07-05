import request from 'supertest';
import { RouterPaths } from '../../../src/routerPaths';
import {
  dataTestPostsCreate01,
  dataTestPostsCreate02,
  dataTestPostUpdate01,
  incorrectPostData,
} from './dataForTest/dataTestforPost';
import {PostsTestManager} from './utils/postsTestManager';
import { dataTestBlogCreate01 } from '../blogs/dataForTest/dataTestforBlog';
import {Test, TestingModule} from "@nestjs/testing";
import {AppModule} from "../../../src/app.module";
import {applyAppSettings} from "../../../src/settings/apply.app.settings";
import {HttpStatus, INestApplication} from "@nestjs/common";
import {BlogTestMeneger} from "../blogs/utils/blogTestMeneger";
import {CreatePostServiceModel} from "../../../src/features/posts/models/input/CreatePostModel";
import {EmailAdapter} from "../../../src/features/auth/adapters/email-adapter";
import {AuthQueryRepository} from "../../../src/features/auth/auth.query.repository";
import {AuthTestManager} from "../auth/utils/authTestManager";
import {dataTestUserAuth} from "../auth/dataForTest/dataTestforAuth";
import {dataTestUserCreate01} from "../users/dataForTest/dataTestforUser";
import {UsersTestManager} from "../users/utils/usersTestManager";
import {LikesStatus} from "../../../src/features/posts/models/output/PostsViewModel";


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
    authQueryRepository = moduleFixture.get<AuthQueryRepository>(AuthQueryRepository);
    usersTestManager = new UsersTestManager(app);
    authTestManager = new AuthTestManager(
        authQueryRepository,
        app,
        emailAdapter,
    );
  });

  beforeEach(async () => {
    await request(httpServer).delete('/testing/all-data')
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

  it(`shouldn't create post with UNAUTHORIZED`, async () => {
    const blog = await blogTestMeneger.createBlog(dataTestBlogCreate01);

    const data: CreatePostServiceModel = {
      ...dataTestPostsCreate01,
      blogId: blog.createdEntity.id,
    };

    await request(httpServer)
      .post(RouterPaths.posts)
      .set('authorization', 'Basic YWRtaW')
      .send(data)
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it(`shouldn't create post with empty title`, async () => {
    const blog = await blogTestMeneger.createBlog(dataTestBlogCreate01);

    const data: CreatePostServiceModel = {
      ...dataTestPostsCreate01,
      title: incorrectPostData.emptyTitle,
      blogId: blog.createdEntity.id,
    };

    await postsTestManager.createPost(
      data,
      HttpStatus.BAD_REQUEST,
      1
    );

    await request(httpServer).get(RouterPaths.posts).expect(HttpStatus.OK, {
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

    await postsTestManager.createPost(
      data,
      HttpStatus.BAD_REQUEST,
1
    );

    await request(httpServer).get(RouterPaths.posts).expect(HttpStatus.OK, {
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

    await postsTestManager.createPost(
      data,
      HttpStatus.BAD_REQUEST,
      1
    );

    await request(httpServer).get(RouterPaths.posts).expect(HttpStatus.OK, {
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

    await postsTestManager.createPost(
      data,
      HttpStatus.BAD_REQUEST,
      1
    );

    await request(httpServer).get(RouterPaths.posts).expect(HttpStatus.OK, {
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

    await postsTestManager.createPost(
      data,
      HttpStatus.BAD_REQUEST,
      1
    );

    await request(httpServer).get(RouterPaths.posts).expect(HttpStatus.OK, {
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

    await postsTestManager.createPost(
      data,
      HttpStatus.BAD_REQUEST,
      1
    );

    await request(httpServer).get(RouterPaths.posts).expect(HttpStatus.OK, {
      pagesCount: 0,
      page: 1,
      pageSize: 10,
      totalCount: 0,
      items: [],
    });
  });

  it(`shouldn't create post with empty blogId`, async () => {
    await postsTestManager.createPost(
      dataTestPostsCreate01,
      HttpStatus.BAD_REQUEST,
      1
    );

    await request(httpServer).get(RouterPaths.posts).expect(HttpStatus.OK, {
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

    await postsTestManager.createPost(
      data,
      HttpStatus.BAD_REQUEST,
      1
    );

    await request(httpServer).get(RouterPaths.posts).expect(HttpStatus.OK, {
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

    await postsTestManager.createPost(
      data,
      HttpStatus.BAD_REQUEST,
      1
    );

    await request(httpServer).get(RouterPaths.posts).expect(HttpStatus.OK, {
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

    await request(httpServer)
      .get(RouterPaths.posts)
      .expect(HttpStatus.OK, {
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

    const data = {
      ...dataTestPostsCreate01,
      blogId: blog.createdEntity.id,
    };

    const posts = await postsTestManager.createPosts(data);

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

  it('should return 404 fot not existing posts for update', async () => {
    const blog = await blogTestMeneger.createBlog(dataTestBlogCreate01);

    const data = {
      ...dataTestPostsCreate01,
      blogId: blog.createdEntity.id,
    };

    await request(httpServer)
      .put(`${RouterPaths.posts}/11515`)
      .set('authorization', 'Basic YWRtaW46cXdlcnR5')
      .send(data)
      .expect(HttpStatus.BAD_REQUEST);
  });

  it(`shouldn't update posts with UNAUTHORIZED`, async () => {
    const blog = await blogTestMeneger.createBlog(dataTestBlogCreate01);

    const data = {
      ...dataTestPostsCreate01,
      blogId: blog.createdEntity.id,
    };
    const post = await postsTestManager.createPost(data);

    await request(httpServer)
      .put(`${RouterPaths.posts}/${post.createdEntity.id}`)
      .set('authorization', 'Basic YWRtaW')
      .send(data)
      .expect(HttpStatus.UNAUTHORIZED);
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

    await postsTestManager.updatePost(
      post.createdEntity,
      dataUpdate,
      HttpStatus.BAD_REQUEST,
      1
    );

    await request(httpServer)
      .get(`${RouterPaths.posts}/${post.createdEntity.id}`)
      .expect(HttpStatus.OK, post.createdEntity);
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

    await postsTestManager.updatePost(
      post.createdEntity,
      data,
      HttpStatus.BAD_REQUEST,
      1
    );

    await request(httpServer)
      .get(`${RouterPaths.posts}/${post.createdEntity.id}`)
      .expect(HttpStatus.OK, post.createdEntity);
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

    await postsTestManager.updatePost(
      post.createdEntity,
      data,
      HttpStatus.BAD_REQUEST,
      1
    );

    await request(httpServer)
      .get(`${RouterPaths.posts}/${post.createdEntity.id}`)
      .expect(HttpStatus.OK, post.createdEntity);
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

    await postsTestManager.updatePost(
      post.createdEntity,
      data,
      HttpStatus.BAD_REQUEST,
      1
    );

    await request(httpServer)
      .get(`${RouterPaths.posts}/${post.createdEntity.id}`)
      .expect(HttpStatus.OK, post.createdEntity);
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

    await postsTestManager.updatePost(
      post.createdEntity,
      data,
      HttpStatus.BAD_REQUEST,
      1
    );

    await request(httpServer)
      .get(`${RouterPaths.posts}/${post.createdEntity.id}`)
      .expect(HttpStatus.OK, post.createdEntity);
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

    await postsTestManager.updatePost(
      post.createdEntity,
      data,
      HttpStatus.BAD_REQUEST,
      1
    );

    await request(httpServer)
      .get(`${RouterPaths.posts}/${post.createdEntity.id}`)
      .expect(HttpStatus.OK, post.createdEntity);
  });

  it(`shouldn't update post with empty blogId`, async () => {
    const blog = await blogTestMeneger.createBlog(dataTestBlogCreate01);

    const dataPost = {
      ...dataTestPostsCreate01,
      blogId: blog.createdEntity.id,
    };
    const post = await postsTestManager.createPost(dataPost);

    await postsTestManager.updatePost(
      post.createdEntity,
      dataTestPostsCreate01,
      HttpStatus.BAD_REQUEST,
      1
    );

    await request(httpServer)
      .get(`${RouterPaths.posts}/${post.createdEntity.id}`)
      .expect(HttpStatus.OK, post.createdEntity);
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

    await postsTestManager.updatePost(
      post.createdEntity,
      data,
      HttpStatus.BAD_REQUEST,
      1
    );

    await request(httpServer)
      .get(`${RouterPaths.posts}/${post.createdEntity.id}`)
      .expect(HttpStatus.OK, post.createdEntity);
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

    await postsTestManager.updatePost(
      post.createdEntity,
      data,
      HttpStatus.BAD_REQUEST,
      1
    );

    await request(httpServer)
      .get(`${RouterPaths.posts}/${post.createdEntity.id}`)
      .expect(HttpStatus.OK, post.createdEntity);
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

    await request(httpServer)
      .get(`${RouterPaths.posts}/${post2.createdEntity.id}`)
      .expect(HttpStatus.OK, post2.createdEntity);
  });

  it(`should update like with correct input model`, async () => {
    const user = await usersTestManager.createUserAdmin(dataTestUserCreate01);
    const blog = await blogTestMeneger.createBlog(dataTestBlogCreate01);

    const dataPost = {
      ...dataTestPostsCreate01,
      blogId: blog.createdEntity.id,
    };
    const post = await postsTestManager.createPost(dataPost);

    const data = {
      likeStatus: LikesStatus.Like,
    };

    const token = await authTestManager.createToken(dataTestUserAuth);

    await postsTestManager.updateLikeForPost(post.createdEntity, data, token.createdEntity.accessToken, user.createdEntity);

  });

  it(`should update dislike with correct input model`, async () => {
    const user = await usersTestManager.createUserAdmin(dataTestUserCreate01);
    const blog = await blogTestMeneger.createBlog(dataTestBlogCreate01);

    const dataPost = {
      ...dataTestPostsCreate01,
      blogId: blog.createdEntity.id,
    };
    const post = await postsTestManager.createPost(dataPost);

    const data = {
      likeStatus: LikesStatus.Dislike,
    };

    const token = await authTestManager.createToken(dataTestUserAuth);

    await postsTestManager.updateDislikeForPost(post.createdEntity, data, token.createdEntity.accessToken, user.createdEntity);

  });

  it(`shouldn't delete post`, async () => {
    await request(httpServer)
      .delete(`${RouterPaths.posts}/7779161`)
      .set('authorization', 'Basic YWRtaW46cXdlcnR5')
      .expect(HttpStatus.BAD_REQUEST);
  });

  it(`should delete both posts`, async () => {
    const blog = await blogTestMeneger.createBlog(dataTestBlogCreate01);

    const dataPost = {
      ...dataTestPostsCreate01,
      blogId: blog.createdEntity.id,
    };
    const post = await postsTestManager.createPost(dataPost);

    await request(httpServer)
      .delete(`${RouterPaths.posts}/${post.createdEntity.id}`)
      .set('authorization', 'Basic YWRtaW46cXdlcnR5')
      .expect(HttpStatus.NO_CONTENT);

    await request(httpServer)
      .get(`${RouterPaths.posts}/${post.createdEntity.id}`)
      .expect(HttpStatus.NOT_FOUND);

    await request(httpServer).get(RouterPaths.posts).expect(HttpStatus.OK, {
      pagesCount: 0,
      page: 1,
      pageSize: 10,
      totalCount: 0,
      items: [],
    });
  });
});
