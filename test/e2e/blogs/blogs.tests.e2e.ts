import request from 'supertest';
import { RouterPaths } from '../../../src/routerPaths';
import { BlogTestMeneger } from './utils/blogTestMeneger';
import {
  dataTestBlogCreate01,
  dataTestBlogCreate02,
  dataTestBlogUpdate01,
  dataTestPostByBlogCreate,
  incorrectBlogData,
} from './dataForTest/dataTestforBlog';
import {
  dataTestPostsCreate01,
  incorrectPostData,
} from '../posts/dataForTest/dataTestforPost';
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
  it(`shouldn't create blog with UNAUTHORIZED`, async () => {
    await request(httpServer)
      .post(RouterPaths.blogs)
      .set('authorization', 'Basic YWRtaW')
      .send(dataTestBlogCreate01)
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it(`shouldn't create blog with empty name`, async () => {
    const data = {
      ...dataTestBlogCreate01,
      name: incorrectBlogData.emptyName,
    };

    await blogTestMeneger.createBlog(data, HttpStatus.BAD_REQUEST, 1);

    await request(httpServer).get(RouterPaths.blogs).expect(HttpStatus.OK, {
      pagesCount: 0,
      page: 1,
      pageSize: 10,
      totalCount: 0,
      items: [],
    });
  });

  it(`shouldn't create blog with name more than 15 characters`, async () => {
    const data = {
      ...dataTestBlogCreate01,
      name: incorrectBlogData.tooLongName,
    };

    await blogTestMeneger.createBlog(data, HttpStatus.BAD_REQUEST, 1);

    await request(httpServer).get(RouterPaths.blogs).expect(HttpStatus.OK, {
      pagesCount: 0,
      page: 1,
      pageSize: 10,
      totalCount: 0,
      items: [],
    });
  });

  it(`shouldn't create blog with empty description`, async () => {
    const data = {
      ...dataTestBlogCreate01,
      description: incorrectBlogData.emptyDescription,
    };

    await blogTestMeneger.createBlog(data, HttpStatus.BAD_REQUEST, 1);

    await request(httpServer).get(RouterPaths.blogs).expect(HttpStatus.OK, {
      pagesCount: 0,
      page: 1,
      pageSize: 10,
      totalCount: 0,
      items: [],
    });
  });

  it(`shouldn't create blogs with description more than 500 characters`, async () => {
    const data = {
      ...dataTestBlogCreate01,
      description: incorrectBlogData.tooLongDescription,
    };

    await blogTestMeneger.createBlog(data, HttpStatus.BAD_REQUEST, 1);

    await request(httpServer).get(RouterPaths.blogs).expect(HttpStatus.OK, {
      pagesCount: 0,
      page: 1,
      pageSize: 10,
      totalCount: 0,
      items: [],
    });
  });

  it(`shouldn't create blogs with empty websiteUrl`, async () => {
    const data = {
      ...dataTestBlogCreate01,
      websiteUrl: incorrectBlogData.emptyWebsiteUrl,
    };

    await blogTestMeneger.createBlog(data, HttpStatus.BAD_REQUEST, 2);

    await request(httpServer).get(RouterPaths.blogs).expect(HttpStatus.OK, {
      pagesCount: 0,
      page: 1,
      pageSize: 10,
      totalCount: 0,
      items: [],
    });
  });

  it(`shouldn't create blogs with websiteUrl more than 100 characters`, async () => {
    const data = {
      ...dataTestBlogCreate01,
      websiteUrl: incorrectBlogData.tooLongWebsiteUrl,
    };

    await blogTestMeneger.createBlog(data, HttpStatus.BAD_REQUEST, 1);

    await request(httpServer).get(RouterPaths.blogs).expect(HttpStatus.OK, {
      pagesCount: 0,
      page: 1,
      pageSize: 10,
      totalCount: 0,
      items: [],
    });
  });

  it(`shouldn't create blogs with websiteUrl that does not match the pattern`, async () => {
    const data = {
      ...dataTestBlogCreate01,
      websiteUrl: incorrectBlogData.incorrectWebsiteUrl,
    };

    await blogTestMeneger.createBlog(data, HttpStatus.BAD_REQUEST, 1);

    await request(httpServer).get(RouterPaths.blogs).expect(HttpStatus.OK, {
      pagesCount: 0,
      page: 1,
      pageSize: 10,
      totalCount: 0,
      items: [],
    });
  });

  it(`shouldn't create blogs with incorrect data`, async () => {
    const data = {
      ...dataTestBlogCreate01,
      name: incorrectBlogData.emptyName,
      description: incorrectBlogData.emptyDescription,
      websiteUrl: incorrectBlogData.incorrectWebsiteUrl,
    };

    await blogTestMeneger.createBlog(data, HttpStatus.BAD_REQUEST, 3);

    await request(httpServer).get(RouterPaths.blogs).expect(HttpStatus.OK, {
      pagesCount: 0,
      page: 1,
      pageSize: 10,
      totalCount: 0,
      items: [],
    });
  });

  it(`should create blog with correct input data`, async () => {
    const blog = await blogTestMeneger.createBlog(dataTestBlogCreate01);

    await request(httpServer)
      .get(RouterPaths.blogs)
      .expect(HttpStatus.OK, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [blog.createdEntity],
      });
  });

  it(`created one more blogs`, async () => {
    const blog = await blogTestMeneger.createBlog(dataTestBlogCreate01);

    const blog2 = await blogTestMeneger.createBlog(dataTestBlogCreate02);

    await request(httpServer)
      .get(RouterPaths.blogs)
      .expect(HttpStatus.OK, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 2,
        items: [blog2.createdEntity, blog.createdEntity],
      });
  });

  it(`shouldn't create post by blogId with empty title`, async () => {
    const blog = await blogTestMeneger.createBlog(dataTestBlogCreate01);

    const data = {
      ...dataTestPostsCreate01,
      title: incorrectPostData.emptyTitle,
    };

    await blogTestMeneger.createPostByBlog(
      blog.createdEntity,
      data,
      HttpStatus.BAD_REQUEST,
      1,
    );

    await request(httpServer).get(RouterPaths.posts).expect(HttpStatus.OK, {
      pagesCount: 0,
      page: 1,
      pageSize: 10,
      totalCount: 0,
      items: [],
    });
  });

  it(`shouldn't create post by blogId with incorrect title`, async () => {
    const blog = await blogTestMeneger.createBlog(dataTestBlogCreate01);

    const data = {
      ...dataTestPostsCreate01,
      title: incorrectPostData.tooLongTitle,
    };

    await blogTestMeneger.createPostByBlog(
      blog.createdEntity,
      data,
      HttpStatus.BAD_REQUEST,
      1,
    );

    await request(httpServer).get(RouterPaths.posts).expect(HttpStatus.OK, {
      pagesCount: 0,
      page: 1,
      pageSize: 10,
      totalCount: 0,
      items: [],
    });
  });

  it(`shouldn't create post by blogId with empty short description`, async () => {
    const blog = await blogTestMeneger.createBlog(dataTestBlogCreate01);

    const data = {
      ...dataTestPostsCreate01,
      shortDescription: incorrectPostData.emptyShortDescription,
    };

    await blogTestMeneger.createPostByBlog(
      blog.createdEntity,
      data,
      HttpStatus.BAD_REQUEST,
      1,
    );

    await request(httpServer).get(RouterPaths.posts).expect(HttpStatus.OK, {
      pagesCount: 0,
      page: 1,
      pageSize: 10,
      totalCount: 0,
      items: [],
    });
  });

  it(`shouldn't create post by blogId with incorrect short description`, async () => {
    const blog = await blogTestMeneger.createBlog(dataTestBlogCreate01);

    const data = {
      ...dataTestPostsCreate01,
      shortDescription: incorrectPostData.tooLongShortDescription,
    };

    await blogTestMeneger.createPostByBlog(
      blog.createdEntity,
      data,
      HttpStatus.BAD_REQUEST,
      1,
    );

    await request(httpServer).get(RouterPaths.posts).expect(HttpStatus.OK, {
      pagesCount: 0,
      page: 1,
      pageSize: 10,
      totalCount: 0,
      items: [],
    });
  });

  it(`shouldn't create post by blogId with empty content`, async () => {
    const blog = await blogTestMeneger.createBlog(dataTestBlogCreate01);

    const data = {
      ...dataTestPostsCreate01,
      content: incorrectPostData.emptyContent,
    };

    await blogTestMeneger.createPostByBlog(
      blog.createdEntity,
      data,
      HttpStatus.BAD_REQUEST,
      1,
    );

    await request(httpServer).get(RouterPaths.posts).expect(HttpStatus.OK, {
      pagesCount: 0,
      page: 1,
      pageSize: 10,
      totalCount: 0,
      items: [],
    });
  });

  it(`shouldn't create post by blogId with incorrect title`, async () => {
    const blog = await blogTestMeneger.createBlog(dataTestBlogCreate01);

    const data = {
      ...dataTestPostsCreate01,
      content: incorrectPostData.tooLongContent,
    };

    await blogTestMeneger.createPostByBlog(
      blog.createdEntity,
      data,
      HttpStatus.BAD_REQUEST,
      1,
    );

    await request(httpServer).get(RouterPaths.posts).expect(HttpStatus.OK, {
      pagesCount: 0,
      page: 1,
      pageSize: 10,
      totalCount: 0,
      items: [],
    });
  });

  it(`shouldn't create post by blogId with incorrect data`, async () => {
    const blog = await blogTestMeneger.createBlog(dataTestBlogCreate01);

    const data = {
      ...dataTestPostsCreate01,
      title: incorrectPostData.emptyTitle,
      content: incorrectPostData.emptyContent,
      shortDescription: incorrectPostData.emptyShortDescription,
    };

    await blogTestMeneger.createPostByBlog(
      blog.createdEntity,
      data,
      HttpStatus.BAD_REQUEST,
      3,
    );

    await request(httpServer).get(RouterPaths.posts).expect(HttpStatus.OK, {
      pagesCount: 0,
      page: 1,
      pageSize: 10,
      totalCount: 0,
      items: [],
    });
  });

  it(`should create post by blogId`, async () => {
    const blog = await blogTestMeneger.createBlog(dataTestBlogCreate01);

    const postByBlog = await blogTestMeneger.createPostByBlog(
      blog.createdEntity,
      dataTestPostByBlogCreate,
    );

    await request(httpServer)
      .get(RouterPaths.posts)
      .expect(HttpStatus.OK, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [postByBlog.createdEntity],
      });
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

  it(`shouldn't update blog with UNAUTHORIZED`, async () => {
    const blog = await blogTestMeneger.createBlog(dataTestBlogCreate01);

    const postByBlog = await blogTestMeneger.createPostByBlog(
      blog.createdEntity,
      dataTestPostByBlogCreate,
    );

    await request(httpServer)
      .put(`${RouterPaths.blogs}/${postByBlog.createdEntity.id}`)
      .set('authorization', 'Basic YWRtaW')
      .send(dataTestBlogUpdate01)
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it(`shouldn't update blog with empty name`, async () => {
    const blog = await blogTestMeneger.createBlog(dataTestBlogCreate01);

    await blogTestMeneger.createPostByBlog(
      blog.createdEntity,
      dataTestPostByBlogCreate,
    );

    const data = {
      ...dataTestBlogUpdate01,
      name: incorrectBlogData.emptyName,
    };

    await blogTestMeneger.updateBlog(
      blog.createdEntity,
      data,
      HttpStatus.BAD_REQUEST,
      1,
    );

    await request(httpServer)
      .get(`${RouterPaths.blogs}/${blog.createdEntity.id}`)
      .expect(HttpStatus.OK, blog.createdEntity);
  });

  it(`shouldn't update blog with name more than 15 characters`, async () => {
    const blog = await blogTestMeneger.createBlog(dataTestBlogCreate01);

    await blogTestMeneger.createPostByBlog(
      blog.createdEntity,
      dataTestPostByBlogCreate,
    );

    const data = {
      ...dataTestBlogUpdate01,
      name: incorrectBlogData.tooLongName,
    };

    await blogTestMeneger.updateBlog(
      blog.createdEntity,
      data,
      HttpStatus.BAD_REQUEST,
      1,
    );

    await request(httpServer)
      .get(`${RouterPaths.blogs}/${blog.createdEntity.id}`)
      .expect(HttpStatus.OK, blog.createdEntity);
  });

  it(`shouldn't update blog with empty description`, async () => {
    const blog = await blogTestMeneger.createBlog(dataTestBlogCreate01);

    await blogTestMeneger.createPostByBlog(
      blog.createdEntity,
      dataTestPostByBlogCreate,
    );

    const data = {
      ...dataTestBlogUpdate01,
      description: incorrectBlogData.emptyDescription,
    };

    await blogTestMeneger.updateBlog(
      blog.createdEntity,
      data,
      HttpStatus.BAD_REQUEST,
      1,
    );

    await request(httpServer)
      .get(`${RouterPaths.blogs}/${blog.createdEntity.id}`)
      .expect(HttpStatus.OK, blog.createdEntity);
  });

  it(`shouldn't update blogs with description more than 500 characters`, async () => {
    const blog = await blogTestMeneger.createBlog(dataTestBlogCreate01);

    await blogTestMeneger.createPostByBlog(
      blog.createdEntity,
      dataTestPostByBlogCreate,
    );

    const data = {
      ...dataTestBlogUpdate01,
      description: incorrectBlogData.tooLongDescription,
    };

    await blogTestMeneger.updateBlog(
      blog.createdEntity,
      data,
      HttpStatus.BAD_REQUEST,
      1,
    );

    await request(httpServer)
      .get(`${RouterPaths.blogs}/${blog.createdEntity.id}`)
      .expect(HttpStatus.OK, blog.createdEntity);
  });

  it(`shouldn't update blogs with empty websiteUrl`, async () => {
    const blog = await blogTestMeneger.createBlog(dataTestBlogCreate01);

    await blogTestMeneger.createPostByBlog(
      blog.createdEntity,
      dataTestPostByBlogCreate,
    );

    const data = {
      ...dataTestBlogUpdate01,
      websiteUrl: incorrectBlogData.emptyWebsiteUrl,
    };

    await blogTestMeneger.updateBlog(
      blog.createdEntity,
      data,
      HttpStatus.BAD_REQUEST,
      2,
    );

    await request(httpServer)
      .get(`${RouterPaths.blogs}/${blog.createdEntity.id}`)
      .expect(HttpStatus.OK, blog.createdEntity);
  });

  it(`shouldn't update blogs with websiteUrl more than 100 characters`, async () => {
    const blog = await blogTestMeneger.createBlog(dataTestBlogCreate01);

    await blogTestMeneger.createPostByBlog(
      blog.createdEntity,
      dataTestPostByBlogCreate,
    );

    const data = {
      ...dataTestBlogUpdate01,
      websiteUrl: incorrectBlogData.tooLongWebsiteUrl,
    };

    await blogTestMeneger.updateBlog(
      blog.createdEntity,
      data,
      HttpStatus.BAD_REQUEST,
      1,
    );

    await request(httpServer)
      .get(`${RouterPaths.blogs}/${blog.createdEntity.id}`)
      .expect(HttpStatus.OK, blog.createdEntity);
  });

  it(`shouldn't update blogs with websiteUrl that does not match the pattern`, async () => {
    const blog = await blogTestMeneger.createBlog(dataTestBlogCreate01);

    await blogTestMeneger.createPostByBlog(
      blog.createdEntity,
      dataTestPostByBlogCreate,
    );

    const data = {
      ...dataTestBlogUpdate01,
      websiteUrl: incorrectBlogData.incorrectWebsiteUrl,
    };

    await blogTestMeneger.updateBlog(
      blog.createdEntity,
      data,
      HttpStatus.BAD_REQUEST,
      1,
    );

    await request(httpServer)
      .get(`${RouterPaths.blogs}/${blog.createdEntity.id}`)
      .expect(HttpStatus.OK, blog.createdEntity);
  });

  it(`shouldn't update blogs with incorrect data`, async () => {
    const blog = await blogTestMeneger.createBlog(dataTestBlogCreate01);

    await blogTestMeneger.createPostByBlog(
      blog.createdEntity,
      dataTestPostByBlogCreate,
    );

    const data = {
      ...dataTestBlogUpdate01,
      name: incorrectBlogData.emptyName,
      description: incorrectBlogData.emptyDescription,
      websiteUrl: incorrectBlogData.incorrectWebsiteUrl,
    };

    await blogTestMeneger.updateBlog(
      blog.createdEntity,
      data,
      HttpStatus.BAD_REQUEST,
      3,
    );

    await request(httpServer)
      .get(`${RouterPaths.blogs}/${blog.createdEntity.id}`)
      .expect(HttpStatus.OK, blog.createdEntity);
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

  it(`should update blog with correct input module`, async () => {
    const blog = await blogTestMeneger.createBlog(dataTestBlogCreate01);

    const blog2 = await blogTestMeneger.createBlog(dataTestBlogCreate02);

    await blogTestMeneger.createPostByBlog(
      blog.createdEntity,
      dataTestPostByBlogCreate,
    );

    await blogTestMeneger.updateBlog(blog.createdEntity, dataTestBlogUpdate01);

    await request(httpServer)
      .get(`${RouterPaths.blogs}/${blog2.createdEntity.id}`)
      .expect(HttpStatus.OK, blog2.createdEntity);
  });

  it(`shouldn't delete  blog UNAUTHORIZED`, async () => {
    const blog = await blogTestMeneger.createBlog(dataTestBlogCreate01);

    await request(httpServer)
      .delete(`${RouterPaths.blogs}/${blog.createdEntity.id}`)
      .set('authorization', 'Basic YWRtaW')
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it(`shouldn't delete  blog`, async () => {
    await request(httpServer)
      .delete(`${RouterPaths.blogs}/7779161`)
      .set('authorization', 'Basic YWRtaW46cXdlcnR5')
      .expect(HttpStatus.NOT_FOUND);
  });

  it(`should delete both blog`, async () => {
    const blog = await blogTestMeneger.createBlog(dataTestBlogCreate01);

    const blog2 = await blogTestMeneger.createBlog(dataTestBlogCreate02);

    await request(httpServer)
      .delete(`${RouterPaths.blogs}/${blog.createdEntity.id}`)
      .set('authorization', 'Basic YWRtaW46cXdlcnR5')
      .expect(HttpStatus.NO_CONTENT);

    await request(httpServer)
      .get(`${RouterPaths.blogs}/${blog.createdEntity.id}`)
      .expect(HttpStatus.NOT_FOUND);

    await request(httpServer)
      .delete(`${RouterPaths.blogs}/${blog2.createdEntity.id}`)
      .set('authorization', 'Basic YWRtaW46cXdlcnR5')
      .expect(HttpStatus.NO_CONTENT);

    await request(httpServer)
      .get(`${RouterPaths.blogs}/${blog2.createdEntity.id}`)
      .expect(HttpStatus.NOT_FOUND);

    await request(httpServer).get(RouterPaths.blogs).expect(HttpStatus.OK, {
      pagesCount: 0,
      page: 1,
      pageSize: 10,
      totalCount: 0,
      items: [],
    });
  });
});
