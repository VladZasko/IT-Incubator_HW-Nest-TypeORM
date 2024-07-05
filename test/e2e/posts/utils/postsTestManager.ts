import request from "supertest";
import {RouterPaths} from "../../../../src/routerPaths";
import {CreatePostServiceModel} from "../../../../src/features/posts/models/input/CreatePostModel";
import {HttpStatusType} from "../../../utils/utils";
import {HttpStatus, INestApplication} from "@nestjs/common";
import {URIParamsFeedbackIdModule} from "../../../../src/features/comments/models/input/URIParamsFeedbackIdModule";
import {UpdatePostModel} from "../../../../src/features/posts/models/input/UpdatePostModule";
import {LikesStatus} from "../../../../src/features/posts/models/output/PostsViewModel";

export class PostsTestManager {

    constructor(protected readonly app: INestApplication) {}
    async createPost(data: CreatePostServiceModel,
                     expectedStatusCode: HttpStatusType = HttpStatus.CREATED,
                     expectedErrorsMessagesLength?: number,) {

        const response = await request(this.app.getHttpServer())
            .post(RouterPaths.posts)
            .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(data)
            .expect(expectedStatusCode)

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
                blogId: data.blogId
            })
        }
        return {response: response, createdEntity: createdEntity};
    }

    async createPosts(data: CreatePostServiceModel,) {

        const posts: any = []

        for (let i = 0; i < 12; i++) {
            const dataPosts = {
                title: `${data.title}${i}`,
                shortDescription: `${data.shortDescription}${i}`,
                content: `${data.content}${i}`,
                blogId: data.blogId
            }
            const result = await this.createPost(dataPosts)

            posts.unshift(result.createdEntity)
        }

        return posts;
    }


    async updatePost(paths: URIParamsFeedbackIdModule,
                     data: UpdatePostModel,
                     expectedStatusCode: HttpStatusType = HttpStatus.NO_CONTENT,
                     expectedErrorsMessagesLength?: number,) {

        const response = await request(this.app.getHttpServer())
            .put(`${RouterPaths.posts}/${paths.id}`)
            .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(data)
            .expect(expectedStatusCode)

        if (expectedStatusCode === HttpStatus.BAD_REQUEST) {
            expect(response.body.errorsMessages.length).toBe(
                expectedErrorsMessagesLength,
            );
        }

        let updateEntity;
        if (expectedStatusCode === HttpStatus.NO_CONTENT) {
            updateEntity = response.body;
            await request(this.app.getHttpServer())
                .get(`${RouterPaths.posts}/${paths.id}`)
                .expect(HttpStatus.OK, {
                    ...paths,
                    title: data.title,
                    shortDescription: data.shortDescription,
                    content: data.content,
                    blogId: data.blogId,
                })
        }
        return {response: response};
    }

    async updateLikeForPost(paths: any,
                     data: any,
                     token: any,
                     user: any,
                     expectedStatusCode: HttpStatusType = HttpStatus.NO_CONTENT,
                     expectedErrorsMessagesLength?: number,) {


        const response = await request(this.app.getHttpServer())
            .put(`${RouterPaths.posts}/${paths.id}/like-status`)
            .set('authorization', `Bearer ${token}`)
            .send(data)
            .expect(expectedStatusCode)

        if (expectedStatusCode === HttpStatus.BAD_REQUEST) {
            expect(response.body.errorsMessages.length).toBe(
                expectedErrorsMessagesLength,
            );
        }

        let updateEntity;
        if (expectedStatusCode === HttpStatus.NO_CONTENT) {

            const result = await request(this.app.getHttpServer())
                .get(`${RouterPaths.posts}/${paths.id}`)
                .set('authorization', `Bearer ${token}`)
            updateEntity = result.body;
            expect(updateEntity).toEqual({
                ...updateEntity,
                id: expect.any(String),
                extendedLikesInfo: {
                    likesCount:1,
                    dislikesCount: 0,
                    myStatus: data.likeStatus,
                    newestLikes: [
                        {
                            addedAt: expect.any(String),
                            login: expect.any(String),
                            userId: user.id,
                        }
                    ]
                }
            });

            const result2 = await request(this.app.getHttpServer())
                .get(`${RouterPaths.posts}/${paths.id}`)
            updateEntity = result2.body;
            expect(updateEntity).toEqual({
                ...updateEntity,
                id: expect.any(String),
                extendedLikesInfo: {
                    likesCount:1,
                    dislikesCount: 0,
                    myStatus: 'None',
                    newestLikes: [
                        {
                            addedAt: expect.any(String),
                            login: expect.any(String),
                            userId: user.id,
                        }
                    ]
                }
            });
        }
        return {response: response};
    }
    async updateDislikeForPost(paths: any,
                            data: any,
                            token: any,
                            user: any,
                            expectedStatusCode: HttpStatusType = HttpStatus.NO_CONTENT,
                            expectedErrorsMessagesLength?: number,) {


        const response = await request(this.app.getHttpServer())
            .put(`${RouterPaths.posts}/${paths.id}/like-status`)
            .set('authorization', `Bearer ${token}`)
            .send(data)
            .expect(expectedStatusCode)

        if (expectedStatusCode === HttpStatus.BAD_REQUEST) {
            expect(response.body.errorsMessages.length).toBe(
                expectedErrorsMessagesLength,
            );
        }

        let updateEntity;
        if (expectedStatusCode === HttpStatus.NO_CONTENT) {

            const result = await request(this.app.getHttpServer())
                .get(`${RouterPaths.posts}/${paths.id}`)
                .set('authorization', `Bearer ${token}`)
            updateEntity = result.body;
            expect(updateEntity).toEqual({
                ...updateEntity,
                id: expect.any(String),
                extendedLikesInfo: {
                    likesCount:0,
                    dislikesCount: 1,
                    myStatus: data.likeStatus,
                    newestLikes: []
                }
            });

            const result2 = await request(this.app.getHttpServer())
                .get(`${RouterPaths.posts}/${paths.id}`)
            updateEntity = result2.body;
            expect(updateEntity).toEqual({
                ...updateEntity,
                id: expect.any(String),
                extendedLikesInfo: {
                    likesCount:0,
                    dislikesCount: 1,
                    myStatus: 'None',
                    newestLikes: []
                }
            });
        }
        return {response: response};
    }
}