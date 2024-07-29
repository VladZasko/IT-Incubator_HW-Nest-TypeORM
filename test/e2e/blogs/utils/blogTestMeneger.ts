import request from 'supertest';
import { CreateBlogModel } from '../../../../src/features/blogs/models/input/CreateBlogModel';
import { RouterPaths } from '../../../../src/routerPaths';
import { UpdateBlogModel } from '../../../../src/features/blogs/models/input/UpdateBlogModule';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { HttpStatusType } from '../../../utils/utils';
import { CreatePostBlogModel } from '../../../../src/features/blogs/models/input/CreatePostByBlogModel';
import { BlogsViewModel } from '../../../../src/features/blogs/models/output/BlogsViewModel';
export class BlogTestMeneger {
  constructor(protected readonly app: INestApplication) {}
  async createBlog(
    data: CreateBlogModel,
    expectedStatusCode: HttpStatusType = HttpStatus.CREATED,
    expectedErrorsMessagesLength?: number,
  ) {
    const response = await request(this.app.getHttpServer())
      .post(RouterPaths.blogsSa)
      .set('authorization', 'Basic YWRtaW46cXdlcnR5')
      .send(data)
      .expect(expectedStatusCode);

    if (expectedStatusCode === HttpStatus.BAD_REQUEST) {
      expect(response.body.errorsMessages.length).toBe(
        expectedErrorsMessagesLength,
      );
    }

    let createdEntity;
    if (expectedStatusCode === HttpStatus.CREATED) {
      createdEntity = response.body;
      expect(createdEntity).toEqual({
        ...createdEntity,
        id: expect.any(String),
        name: data.name,
        description: data.description,
        websiteUrl: data.websiteUrl,
      });
    }
    return { response: response, createdEntity: createdEntity };
  }

  async createBlogs(data: CreateBlogModel) {
    const blogs: any = [];
    const blogsTestManager = new BlogTestMeneger(this.app);

    for (let i = 0; i < 12; i++) {
      const dataBlogs = {
        ...data,
        name: `${data.name}${i}`,
        description: `${data.description}${i}`,
      };
      const result = await blogsTestManager.createBlog(dataBlogs);

      blogs.unshift(result.createdEntity);
    }

    return blogs;
  }

  async createPostByBlog(
    createdNewBlog01: BlogsViewModel,
    data: CreatePostBlogModel,
    expectedStatusCode: HttpStatusType = HttpStatus.CREATED,
    expectedErrorsMessagesLength?: number,
  ) {
    const response = await request(this.app.getHttpServer())
      .post(`${RouterPaths.blogsSa}/${createdNewBlog01.id}/posts`)
      .set('authorization', 'Basic YWRtaW46cXdlcnR5')
      .send(data)
      .expect(expectedStatusCode);

    if (expectedStatusCode === HttpStatus.BAD_REQUEST) {
      expect(response.body.errorsMessages.length).toBe(
        expectedErrorsMessagesLength,
      );
    }

    let createdEntity;
    if (expectedStatusCode === HttpStatus.CREATED) {
      createdEntity = response.body;
      expect(createdEntity).toEqual({
        ...createdEntity,
        title: data.title,
        shortDescription: data.shortDescription,
        content: data.content,
      });
    }
    return { response: response, createdEntity: createdEntity };
  }

  async createPostsByBlog(blog: BlogsViewModel, data: CreatePostBlogModel) {
    const postsByBlogs: any = [];
    const blogsTestManager = new BlogTestMeneger(this.app);

    for (let i = 0; i < 12; i++) {
      const dataPosts = {
        title: `${data.title}${i}`,
        shortDescription: `${data.shortDescription}${i}`,
        content: `${data.content}${i}`,
      };

      const result = await blogsTestManager.createPostByBlog(blog, dataPosts);

      postsByBlogs.unshift(result.createdEntity);
    }

    return postsByBlogs;
  }

  async updateBlog(
    createdNewBlog01: BlogsViewModel,
    data: UpdateBlogModel,
    expectedStatusCode: HttpStatusType = HttpStatus.NO_CONTENT,
    expectedErrorsMessagesLength?: number,
  ) {
    const response = await request(this.app.getHttpServer())
      .put(`${RouterPaths.blogsSa}/${createdNewBlog01.id}`)
      .set('authorization', 'Basic YWRtaW46cXdlcnR5')
      .send(data)
      .expect(expectedStatusCode);

    if (expectedStatusCode === HttpStatus.BAD_REQUEST) {
      expect(response.body.errorsMessages.length).toBe(
        expectedErrorsMessagesLength,
      );
    }

    if (expectedStatusCode === HttpStatus.NO_CONTENT) {
      await request(this.app.getHttpServer())
        .get(`${RouterPaths.blogs}/${createdNewBlog01.id}`)
        .expect(HttpStatus.OK, {
          ...createdNewBlog01,
          name: data.name,
          description: data.description,
          websiteUrl: data.websiteUrl,
        });
    }
    return { response: response };
  }
}
