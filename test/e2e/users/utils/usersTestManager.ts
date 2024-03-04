import request from "supertest";
import {HTTP_STATUSES, HttpStatusType} from "../../../../src/utils/utils";
import {RouterPaths} from "../../../../src/routerPaths";
import {app} from "../../../../src/app";
import {ErrorMessage} from "../../../../src/utils/errors";
import {CreateUserModel} from "../../../../src/features/users/models/input/CreateUserModel";
import {errors} from "../../../utils/error";



export const usersTestManager = {
    async createUserAdmin(data: CreateUserModel,
                          expectedStatusCode: HttpStatusType = HTTP_STATUSES.CREATED_201,
                          expectedErrorsMessages?: ErrorMessage) {

        const response = await request(app)
            .post(RouterPaths.users)
            .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(data)
            .expect(expectedStatusCode)

        if (expectedStatusCode === HTTP_STATUSES.BAD_REQUEST_400) {
            await errors.errors(response.body, expectedErrorsMessages)
        }

        let createdEntity;
        if (expectedStatusCode === HTTP_STATUSES.CREATED_201) {
            createdEntity = response.body;
            expect(createdEntity).toEqual({
                ...createdEntity,
                id: expect.any(String),
                login: data.login,
                email: data.email
            })
        }
        return {response: response, createdEntity: createdEntity};
    },

    async createUsersAdmin(data: CreateUserModel) {

        const users = []

        for (let i = 0; i < 12; i++) {
            const dataUsers = {
                login: `${data.login}${i}`,
                email: `newemail${i}@gmail.com`,
                password: data.password
            }
            const result = await usersTestManager.createUserAdmin(dataUsers)

            users.unshift(result.createdEntity)
        }

        return users;
    },

}

