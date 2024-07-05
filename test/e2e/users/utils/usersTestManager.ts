import request from 'supertest';
import { RouterPaths } from '../../../../src/routerPaths';
import { CreateUserModel } from '../../../../src/features/users/models/input/CreateUserModel';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { HttpStatusType } from '../../../utils/utils';

export class UsersTestManager {
    constructor(protected readonly app: INestApplication) {}
    async createUserAdmin(
        data: CreateUserModel,
        expectedStatusCode: HttpStatusType = HttpStatus.CREATED,
        expectedErrorsMessagesLength?: number,
    ) {
        const response = await request(this.app.getHttpServer())
            .post(RouterPaths.users)
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
                login: data.login,
                email: data.email,
            });
        }
        return { response: response, createdEntity: createdEntity };
    }

    async createUsersAdmin(data: CreateUserModel) {
        const users: any = [];

        for (let i = 0; i < 12; i++) {
            const dataUsers = {
                login: `${data.login}${i}`,
                email: `newemail${i}@gmail.com`,
                password: data.password,
            };
            const result = await this.createUserAdmin(dataUsers);

            users.unshift(result.createdEntity);
        }

        return users;
    }
}
