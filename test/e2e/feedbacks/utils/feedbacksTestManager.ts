import request from "supertest";
import {RouterPaths} from "../../../../src/routerPaths";
import {ErrorMessage} from "../../../../src/utils/errors";
import {HttpStatus, INestApplication} from "@nestjs/common";
import {HttpStatusType} from "../../../utils/utils";
import {CreateCommentModel} from "../../../../src/features/comments/models/input/CreateCommentModel";


export class FeedbacksTestManager {
    constructor(protected readonly app: INestApplication) {}
    async createComment(data: CreateCommentModel,
                        post: any,
                        token: any,
                        expectedStatusCode: HttpStatusType = HttpStatus.CREATED,
                        expectedErrorsMessagesLength?: number) {

        const response = await request(this.app.getHttpServer())
            .post(`${RouterPaths.posts}/${post.id}/comments`)
            .set('authorization', `Bearer ${token}`)
            .send(data)
            .expect(expectedStatusCode)

        if (expectedStatusCode === HttpStatus.BAD_REQUEST) {
            expect(response.body.errorsMessages.length).toBe(
                expectedErrorsMessagesLength,
            );
        }

        let createdEntity = response.body;
        if (expectedStatusCode === HttpStatus.CREATED) {
            createdEntity = response.body;
            expect(createdEntity).toEqual({
                ...createdEntity,
                id: expect.any(String),
                content: data.content
            })
        }
        return {response: response, createdEntity: createdEntity};
    }

    async createComments(data: CreateCommentModel, post: any, token: any) {

        const comments: any = []

        for (let i = 0; i < 12; i++) {
            const dataContent = {
                content: `${data.content}${i}`
            }
            const result = await this.createComment(dataContent, post, token)

            comments.unshift(result.createdEntity)
        }

        return comments;
    }
    async updateComment(data: CreateCommentModel,
                        comment: any,
                        token: any,
                        expectedStatusCode: HttpStatusType = HttpStatus.NO_CONTENT,
                        expectedErrorsMessagesLength?: number) {

        const response = await request(this.app.getHttpServer())
            .put(`${RouterPaths.feedbacks}/${comment.id}`)
            .set('authorization', `Bearer ${token}`)
            .send(data)
            .expect(expectedStatusCode)

        if (expectedStatusCode === HttpStatus.BAD_REQUEST) {
            expect(response.body.errorsMessages.length).toBe(
                expectedErrorsMessagesLength,
            );
        }

        if (expectedStatusCode === HttpStatus.NO_CONTENT) {
            await request(this.app.getHttpServer())
                .get(`${RouterPaths.feedbacks}/${comment.id}`)
                .expect(HttpStatus.OK, {
                    ...comment,
                    content: data.content
                })
        }
        return {response: response};
    }
    async deleteComment(comment: any,
                        token: any,
                        expectedStatusCode: HttpStatusType = HttpStatus.NO_CONTENT
    ) {

        const response = await request(this.app.getHttpServer())
            .delete(`${RouterPaths.feedbacks}/${comment.id}`)
            .set('authorization', `Bearer ${token}`)
            .expect(expectedStatusCode)

        if (expectedStatusCode === HttpStatus.NO_CONTENT) {
            await request(this.app.getHttpServer())
                .get(`${RouterPaths.feedbacks}/${comment.id}`)
                .expect(HttpStatus.NOT_FOUND)
        }
        return {response: response};
    }
}