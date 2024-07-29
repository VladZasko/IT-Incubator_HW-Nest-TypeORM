import request from 'supertest';
import { RouterPaths } from '../../../src/routerPaths';
import { BlogTestMeneger } from './utils/blogTestMeneger';
import {
  dataTestBlogCreate01,
  dataTestPostByBlogCreate,
} from './dataForTest/dataTestforBlog';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../../src/app.module';
import { applyAppSettings } from '../../../src/settings/apply.app.settings';

describe('/blog tests', () => {
  let app: INestApplication;
  let httpServer;
  let blogTestMeneger: BlogTestMeneger;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    applyAppSettings(app);
    await app.init();

    httpServer = app.getHttpServer();

    blogTestMeneger = new BlogTestMeneger(app);
  });

  beforeEach(async () => {
    await request(httpServer).delete('/testing/all-data');
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return 200 and empty array', async () => {
    await request(httpServer).get(RouterPaths.blogs).expect(HttpStatus.OK, {
      pagesCount: 0,
      page: 1,
      pageSize: 10,
      totalCount: 0,
      items: [],
    });
  });

  it('should return 404 fot not existing blogs', async () => {
    await request(httpServer)
      .get(`${RouterPaths.blogs}/6`)
      .expect(HttpStatus.NOT_FOUND);
  });

  it('should return post for blog', async () => {
    const blog = await blogTestMeneger.createBlog(dataTestBlogCreate01);

    const postByBlog = await blogTestMeneger.createPostByBlog(
      blog.createdEntity,
      dataTestPostByBlogCreate,
    );

    await request(httpServer)
      .get(`${RouterPaths.blogs}/${blog.createdEntity.id}/posts`)
      .expect(HttpStatus.OK, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [postByBlog.createdEntity],
      });
  });

  it(`should create 12 blogs with correct input data`, async () => {
    const blogs = await blogTestMeneger.createBlogs(dataTestBlogCreate01);

    await request(httpServer)
      .get(`${RouterPaths.blogs}/?pageSize=15`)
      .expect(HttpStatus.OK, {
        pagesCount: 1,
        page: 1,
        pageSize: 15,
        totalCount: 12,
        items: blogs,
      });
  });

  it('should return page 3 and empty page size 3', async () => {
    const blogs = await blogTestMeneger.createBlogs(dataTestBlogCreate01);

    await request(httpServer)
      .get(`${RouterPaths.blogs}/?pageSize=3&pageNumber=3`)
      .expect(HttpStatus.OK, {
        pagesCount: 4,
        page: 3,
        pageSize: 3,
        totalCount: 12,
        items: blogs.slice(6, 9),
      });
  });

  it('should return blog with "me9" ', async () => {
    const blogs = await blogTestMeneger.createBlogs(dataTestBlogCreate01);

    await request(httpServer)
      .get(`${RouterPaths.blogs}/?searchNameTerm=me9`)
      .expect(HttpStatus.OK, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [blogs[2]],
      });
  });

  it('should return blogs "asc" ', async () => {
    const blogs = await blogTestMeneger.createBlogs(dataTestBlogCreate01);

    await request(httpServer)
      .get(`${RouterPaths.blogs}/?pageSize=15&sortDirection=asc`)
      .expect(HttpStatus.OK, {
        pagesCount: 1,
        page: 1,
        pageSize: 15,
        totalCount: 12,
        items: blogs.reverse(),
      });
  });

  it(`should create 10 posts by blogs with correct input data`, async () => {
    const blog = await blogTestMeneger.createBlog(dataTestBlogCreate01);

    const postsByBlogs = await blogTestMeneger.createPostsByBlog(
      blog.createdEntity,
      dataTestPostByBlogCreate,
    );

    await request(httpServer)
      .get(`${RouterPaths.blogs}/${blog.createdEntity.id}/posts/?pageSize=15`)
      .expect(HttpStatus.OK, {
        pagesCount: 1,
        page: 1,
        pageSize: 15,
        totalCount: 12,
        items: postsByBlogs,
      });
  });

  it('should return page 3 and page size 3', async () => {
    const blog = await blogTestMeneger.createBlog(dataTestBlogCreate01);

    const postsByBlogs = await blogTestMeneger.createPostsByBlog(
      blog.createdEntity,
      dataTestPostByBlogCreate,
    );

    await request(httpServer)
      .get(
        `${RouterPaths.blogs}/${blog.createdEntity.id}/posts/?pageSize=3&pageNumber=3`,
      )
      .expect(HttpStatus.OK, {
        pagesCount: 4,
        page: 3,
        pageSize: 3,
        totalCount: 12,
        items: postsByBlogs.slice(6, 9),
      });
  });

  it('should return posts by blogs "asc" ', async () => {
    const blog = await blogTestMeneger.createBlog(dataTestBlogCreate01);

    const postsByBlogs = await blogTestMeneger.createPostsByBlog(
      blog.createdEntity,
      dataTestPostByBlogCreate,
    );

    await request(httpServer)
      .get(
        `${RouterPaths.blogs}/${blog.createdEntity.id}/posts/?pageSize=15&sortDirection=asc`,
      )
      .expect(HttpStatus.OK, {
        pagesCount: 1,
        page: 1,
        pageSize: 15,
        totalCount: 12,
        items: postsByBlogs.reverse(),
      });
  });
});
