import request from "supertest";
import {HTTP_STATUSES, HttpStatusType} from "../../../../src/utils/utils";
import {RouterPaths} from "../../../../src/routerPaths";
import {app} from "../../../../src/app";
import {ErrorMessage} from "../../../../src/utils/errors";
import {CreateFeedbackModel} from "../../../../src/features/feedback/models/CreateFeedbackModel";
import {errors} from "../../../utils/error";


export const feedbacksTestManager = {
    async createComment(data: CreateFeedbackModel,
                        post: any,
                        token: any,
                        expectedStatusCode: HttpStatusType = HTTP_STATUSES.CREATED_201,
                        expectedErrorsMessages?: ErrorMessage) {

        const response = await request(app)
            .post(`${RouterPaths.posts}/${post.id}/comments`)
            .set('authorization', `Bearer ${token}`)
            .send(data)
            .expect(expectedStatusCode)

        if (expectedStatusCode === HTTP_STATUSES.BAD_REQUEST_400) {
            await errors.errors(response.body, expectedErrorsMessages)
        }

        let createdEntity = response.body;
        if (expectedStatusCode === HTTP_STATUSES.CREATED_201) {
            createdEntity = response.body;
            expect(createdEntity).toEqual({
                ...createdEntity,
                id: expect.any(String),
                content: data.content
            })
        }
        return {response: response, createdEntity: createdEntity};
    },

    async createComments(data: CreateFeedbackModel, post: any, token: any) {

        const comments = []

        for (let i = 0; i < 12; i++) {
            const dataContent = {
                content: `${data.content}${i}`
            }
            const result = await feedbacksTestManager
                .createComment(dataContent, post, token)

            comments.unshift(result.createdEntity)
        }

        return comments;
    },

    async updateComment(data: CreateFeedbackModel,
                        comment: any,
                        token: any,
                        expectedStatusCode: HttpStatusType = HTTP_STATUSES.NO_CONTENT_204,
                        expectedErrorsMessages?: ErrorMessage) {

        const response = await request(app)
            .put(`${RouterPaths.feedbacks}/${comment.id}`)
            .set('authorization', `Bearer ${token}`)
            .send(data)
            .expect(expectedStatusCode)

        if (expectedStatusCode === HTTP_STATUSES.BAD_REQUEST_400) {
            await errors.errors(response.body, expectedErrorsMessages)
        }

        if (expectedStatusCode === HTTP_STATUSES.NO_CONTENT_204) {
            await request(app)
                .get(`${RouterPaths.feedbacks}/${comment.id}`)
                .expect(HTTP_STATUSES.OK_200, {
                    ...comment,
                    content: data.content
                })
        }
        return {response: response};
    },
    async deleteComment(comment: any,
                        token: any,
                        expectedStatusCode: HttpStatusType = HTTP_STATUSES.NO_CONTENT_204
    ) {

        const response = await request(app)
            .delete(`${RouterPaths.feedbacks}/${comment.id}`)
            .set('authorization', `Bearer ${token}`)
            .expect(expectedStatusCode)

        if (expectedStatusCode === HTTP_STATUSES.NO_CONTENT_204) {
            await request(app)
                .get(`${RouterPaths.feedbacks}/${comment.id}`)
                .expect(HTTP_STATUSES.NOT_FOUND_404)
        }
        return {response: response};
    }
}