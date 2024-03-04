import request from 'supertest'
import {app} from "../../../src/app";
import {HTTP_STATUSES} from "../../../src/utils/utils";
import {RouterPaths} from "../../../src/routerPaths";
import {ErrorMessage, ERRORS_MESSAGES} from "../../../src/utils/errors";
import {dataTestUserCreate01, incorrectUserData} from "./dataForTest/dataTestforUser";
import {usersTestManager} from "./utils/usersTestManager";
import {dbControl} from "../../../src/db/db";


const getRequest = () => {
    return request(app)
}
describe('/user', () => {
    beforeAll(async () => {
        await dbControl.run()
    })

    beforeEach(async () => {
        await getRequest().delete('/testing/all-data')
    })

    afterAll(async () => {
        await dbControl.stop()
    })

    it('should return 200 and empty array', async () => {
        await getRequest()
            .get(RouterPaths.users)
            .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HTTP_STATUSES.OK_200, {pagesCount: 0, page: 1, pageSize: 10, totalCount: 0, items: []})
    })

    it('should return 404 fot not existing users', async () => {
        await getRequest()
            .get(`${RouterPaths.users}/1`)
            .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })

    it(`shouldn't create user with UNAUTHORIZED`, async () => {
        await request(app)
            .post(RouterPaths.users)
            .set('authorization', 'Basic YWRtaW')
            .send(dataTestUserCreate01)
            .expect(HTTP_STATUSES.UNAUTHORIZED_401)
    })

    it(`shouldn't create user with empty login`, async () => {

        const data = {
            ...dataTestUserCreate01,
            login: incorrectUserData.emptyLogin
        }
        const error: ErrorMessage = [ERRORS_MESSAGES.USER_LOGIN]

        await usersTestManager
            .createUserAdmin(data, HTTP_STATUSES.BAD_REQUEST_400, error)

        await request(app)
            .get(RouterPaths.users)
            .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HTTP_STATUSES.OK_200, {pagesCount: 0, page: 1, pageSize: 10, totalCount: 0, items: []})
    })

    it(`shouldn't create user with login more than 10 characters`, async () => {
        const data = {
            ...dataTestUserCreate01,
            login: incorrectUserData.tooLongLogin
        }
        const error: ErrorMessage = [ERRORS_MESSAGES.USER_LOGIN]

        await usersTestManager
            .createUserAdmin(data, HTTP_STATUSES.BAD_REQUEST_400, error)

        await request(app)
            .get(RouterPaths.users)
            .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HTTP_STATUSES.OK_200, {pagesCount: 0, page: 1, pageSize: 10, totalCount: 0, items: []})
    })

    it(`shouldn't create user with empty email`, async () => {
        const data = {
            ...dataTestUserCreate01,
            email: incorrectUserData.emptyEmail
        }
        const error: ErrorMessage = [ERRORS_MESSAGES.USER_EMAIL]

        await usersTestManager
            .createUserAdmin(data, HTTP_STATUSES.BAD_REQUEST_400, error)

        await request(app)
            .get(RouterPaths.users)
            .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HTTP_STATUSES.OK_200, {pagesCount: 0, page: 1, pageSize: 10, totalCount: 0, items: []})
    })

    it(`shouldn't create user with incorrect email`, async () => {
        const data = {
            ...dataTestUserCreate01,
            email: incorrectUserData.incorrectEmail
        }
        const error: ErrorMessage = [ERRORS_MESSAGES.USER_EMAIL]

        await usersTestManager
            .createUserAdmin(data, HTTP_STATUSES.BAD_REQUEST_400, error)

        await request(app)
            .get(RouterPaths.users)
            .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HTTP_STATUSES.OK_200, {pagesCount: 0, page: 1, pageSize: 10, totalCount: 0, items: []})
    })

    it(`shouldn't create user with empty password`, async () => {
        const data = {
            ...dataTestUserCreate01,
            password: incorrectUserData.emptyPassword
        }
        const error: ErrorMessage = [ERRORS_MESSAGES.USER_PASSWORD]

        await usersTestManager
            .createUserAdmin(data, HTTP_STATUSES.BAD_REQUEST_400, error)

        await request(app)
            .get(RouterPaths.users)
            .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HTTP_STATUSES.OK_200, {pagesCount: 0, page: 1, pageSize: 10, totalCount: 0, items: []})
    })

    it(`shouldn't create user with password more than 20 characters`, async () => {
        const data = {
            ...dataTestUserCreate01,
            password: incorrectUserData.tooLongPassword
        }
        const error: ErrorMessage = [ERRORS_MESSAGES.USER_PASSWORD]

        await usersTestManager
            .createUserAdmin(data, HTTP_STATUSES.BAD_REQUEST_400, error)

        await request(app)
            .get(RouterPaths.users)
            .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HTTP_STATUSES.OK_200, {pagesCount: 0, page: 1, pageSize: 10, totalCount: 0, items: []})
    })

    it(`shouldn't create user with password that does not match the pattern`, async () => {
        const data = {
            ...dataTestUserCreate01,
            password: incorrectUserData.incorrectPassword
        }
        const error: ErrorMessage = [ERRORS_MESSAGES.USER_PASSWORD]

        await usersTestManager
            .createUserAdmin(data, HTTP_STATUSES.BAD_REQUEST_400, error)

        await request(app)
            .get(RouterPaths.users)
            .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HTTP_STATUSES.OK_200, {pagesCount: 0, page: 1, pageSize: 10, totalCount: 0, items: []})
    })

    it(`shouldn't create user with incorrect data`, async () => {
        const data = {
            ...dataTestUserCreate01,
            login: incorrectUserData.emptyLogin,
            email: incorrectUserData.emptyEmail,
            password: incorrectUserData.incorrectPassword
        }
        const error: ErrorMessage = [
            ERRORS_MESSAGES.USER_LOGIN,
            ERRORS_MESSAGES.USER_PASSWORD,
            ERRORS_MESSAGES.USER_EMAIL
        ]

        await usersTestManager
            .createUserAdmin(data, HTTP_STATUSES.BAD_REQUEST_400, error)

        await request(app)
            .get(RouterPaths.users)
            .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HTTP_STATUSES.OK_200, {pagesCount: 0, page: 1, pageSize: 10, totalCount: 0, items: []})
    })

    it(`should create user with correct input data`, async () => {

        const user = await usersTestManager.createUserAdmin(dataTestUserCreate01)

        await request(app)
            .get(RouterPaths.users)
            .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HTTP_STATUSES.OK_200,
                {pagesCount: 1, page: 1, pageSize: 10, totalCount: 1, items: [user.createdEntity]})
    })

/*    it('should return page 3 and page size 3', async () => {
        const users = await usersTestManager.createUsersAdmin(dataTestUserCreate01)

        await getRequest()
            .get(`${RouterPaths.users}/?pageSize=3&pageNumber=3`)
            .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HTTP_STATUSES.OK_200,
                {
                    pagesCount: 4,
                    page: 3,
                    pageSize: 3,
                    totalCount: 12,
                    items: users.slice(6, 9)
                })
    })*/

    it('should return users "asc" ', async () => {

        const users = await usersTestManager.createUsersAdmin(dataTestUserCreate01)

        await getRequest()
            .get(`${RouterPaths.users}/?pageSize=15&sortDirection=asc`)
            .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HTTP_STATUSES.OK_200,
                {
                    pagesCount: 1,
                    page: 1,
                    pageSize: 15,
                    totalCount: 12,
                    items: users.reverse()
                })
    })

    it('should return user with "og9" in login ', async () => {

        const users = await usersTestManager.createUsersAdmin(dataTestUserCreate01)

        await getRequest()
            .get(`${RouterPaths.users}/?searchLoginTerm=og9`)
            .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HTTP_STATUSES.OK_200,
                {
                    pagesCount: 1,
                    page: 1,
                    pageSize: 10,
                    totalCount: 1,
                    items: [users[2]]
                })
    })

    it('should return user with "il8" in email ', async () => {

        const users = await usersTestManager.createUsersAdmin(dataTestUserCreate01)

        await getRequest()
            .get(`${RouterPaths.users}/?searchEmailTerm=il8`)
            .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HTTP_STATUSES.OK_200,
                {
                    pagesCount: 1,
                    page: 1,
                    pageSize: 10,
                    totalCount: 1,
                    items: [users[3]]
                })
    })


    it(`shouldn't delete  user UNAUTHORIZED`, async () => {

        const user = await usersTestManager.createUserAdmin(dataTestUserCreate01)

        await request(app)
            .delete(`${RouterPaths.users}/${user.createdEntity.id}`)
            .set('authorization', 'Basic YWRtaW')
            .expect(HTTP_STATUSES.UNAUTHORIZED_401)
    })

    it(`shouldn't delete  user`, async () => {
        await request(app)
            .delete(`${RouterPaths.users}/7779161`)
            .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })

    it(`should delete both user`, async () => {

        const user = await usersTestManager.createUserAdmin(dataTestUserCreate01)

        await request(app)
            .delete(`${RouterPaths.users}/${user.createdEntity.id}`)
            .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HTTP_STATUSES.NO_CONTENT_204)

        await request(app)
            .get(`${RouterPaths.users}/${user.createdEntity.id}`)
            .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HTTP_STATUSES.NOT_FOUND_404)

        await request(app)
            .get(RouterPaths.users)
            .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HTTP_STATUSES.OK_200,
                {
                    pagesCount: 0,
                    page: 1,
                    pageSize: 10,
                    totalCount: 0,
                    items: []
                })
    })

})




