// /* eslint-disable @typescript-eslint/explicit-function-return-type */
// import { INestApplication } from '@nestjs/common';
// import request from 'supertest';
//
// export class BlogTestManager1 {
//   public adminData: {
//     login: string;
//     password: string;
//   };
//   public basicBlogData: {
//     name: string;
//     description: string;
//     websiteUrl: string;
//   };
//   constructor(protected readonly app: INestApplication) {
//     this.adminData = {
//       login: 'admin',
//       password: 'qwerty',
//     };
//     this.basicBlogData = {
//       name: 'test',
//       description: 'description_test',
//       websiteUrl: 'https://test.com',
//     };
//   }
//
//   async createBlog(
//     blogData = this.basicBlogData,
//     status: number = 201,
//     adminData?: { login: string; password: string },
//   ) {
//     const authData = adminData ?? this.adminData;
//     return request(this.app.getHttpServer())
//       .post('/blogs')
//       .auth(authData.login, authData.password)
//       .send(blogData)
//       .expect(status);
//   }
//
//   async updateBlog(
//     blogData,
//     blogId: string,
//     status: number,
//     adminData?: { login: string; password: string },
//   ) {
//     const authData = adminData ?? this.adminData;
//     return request(this.app.getHttpServer())
//       .put(`/blogs/${blogId}`)
//       .auth(authData.login, authData.password)
//       .send(blogData)
//       .expect(status);
//   }
// }
