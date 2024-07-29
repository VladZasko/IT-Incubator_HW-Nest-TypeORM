import request from 'supertest';
import { RouterPaths } from '../../../../src/routerPaths';
import { HttpStatusType } from '../../../utils/utils';
import { HttpStatus, INestApplication } from '@nestjs/common';

export class PostsTestManager {
  constructor(protected readonly app: INestApplication) {}
  async updateLikeForPost(
    paths: any,
    data: any,
    token: any,
    user: any,
    expectedStatusCode: HttpStatusType = HttpStatus.NO_CONTENT,
    expectedErrorsMessagesLength?: number,
  ) {
    const response = await request(this.app.getHttpServer())
      .put(`${RouterPaths.posts}/${paths.id}/like-status`)
      .set('authorization', `Bearer ${token}`)
      .send(data)
      .expect(expectedStatusCode);

    if (expectedStatusCode === HttpStatus.BAD_REQUEST) {
      expect(response.body.errorsMessages.length).toBe(
        expectedErrorsMessagesLength,
      );
    }

    let updateEntity;
    if (expectedStatusCode === HttpStatus.NO_CONTENT) {
      const result = await request(this.app.getHttpServer())
        .get(`${RouterPaths.posts}/${paths.id}`)
        .set('authorization', `Bearer ${token}`);
      updateEntity = result.body;
      expect(updateEntity).toEqual({
        ...updateEntity,
        id: expect.any(String),
        extendedLikesInfo: {
          likesCount: 1,
          dislikesCount: 0,
          myStatus: data.likeStatus,
          newestLikes: [
            {
              addedAt: expect.any(String),
              login: expect.any(String),
              userId: user.id,
            },
          ],
        },
      });

      const result2 = await request(this.app.getHttpServer()).get(
        `${RouterPaths.posts}/${paths.id}`,
      );
      updateEntity = result2.body;
      expect(updateEntity).toEqual({
        ...updateEntity,
        id: expect.any(String),
        extendedLikesInfo: {
          likesCount: 1,
          dislikesCount: 0,
          myStatus: 'None',
          newestLikes: [
            {
              addedAt: expect.any(String),
              login: expect.any(String),
              userId: user.id,
            },
          ],
        },
      });
    }
    return { response: response };
  }
  async updateDislikeForPost(
    paths: any,
    data: any,
    token: any,
    user: any,
    expectedStatusCode: HttpStatusType = HttpStatus.NO_CONTENT,
    expectedErrorsMessagesLength?: number,
  ) {
    const response = await request(this.app.getHttpServer())
      .put(`${RouterPaths.posts}/${paths.id}/like-status`)
      .set('authorization', `Bearer ${token}`)
      .send(data)
      .expect(expectedStatusCode);

    if (expectedStatusCode === HttpStatus.BAD_REQUEST) {
      expect(response.body.errorsMessages.length).toBe(
        expectedErrorsMessagesLength,
      );
    }

    let updateEntity;
    if (expectedStatusCode === HttpStatus.NO_CONTENT) {
      const result = await request(this.app.getHttpServer())
        .get(`${RouterPaths.posts}/${paths.id}`)
        .set('authorization', `Bearer ${token}`);
      updateEntity = result.body;
      expect(updateEntity).toEqual({
        ...updateEntity,
        id: expect.any(String),
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 1,
          myStatus: data.likeStatus,
          newestLikes: [],
        },
      });

      const result2 = await request(this.app.getHttpServer()).get(
        `${RouterPaths.posts}/${paths.id}`,
      );
      updateEntity = result2.body;
      expect(updateEntity).toEqual({
        ...updateEntity,
        id: expect.any(String),
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 1,
          myStatus: 'None',
          newestLikes: [],
        },
      });
    }
    return { response: response };
  }
}
