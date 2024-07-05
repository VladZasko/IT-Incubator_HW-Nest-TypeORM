import request from 'supertest'
import {RouterPaths} from "../../../src/routerPaths";
import {dataTestUserCreate01, incorrectUserData} from "./dataForTest/dataTestforUser";
import {HttpStatus, INestApplication} from "@nestjs/common";
import {UsersTestManager} from "./utils/usersTestManager";
import {Test, TestingModule} from "@nestjs/testing";
import {AppModule} from "../../../src/app.module";
import {applyAppSettings} from "../../../src/settings/apply.app.settings";


describe('/user', () => {
    let app: INestApplication;
    let httpServer;
    let usersTestManager: UsersTestManager;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        applyAppSettings(app);
        await app.init();

        httpServer = app.getHttpServer();

        usersTestManager = new UsersTestManager(app);
        // authQueryRepository = moduleFixture.get<AuthQueryRepository>(AuthQueryRepository);
        // authTestManager = new AuthTestManager(
        //     authQueryRepository,
        //     app,
        //     emailAdapter,
        // );
    })

    beforeEach(async () => {
        await request(httpServer).delete('/testing/all-data')
    })

    afterAll(async () => {
        await app.close();
    })

    it('should return 200 and empty array', async () => {
        await request(httpServer)
            .get(RouterPaths.users)
            .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HttpStatus.OK, {pagesCount: 0, page: 1, pageSize: 10, totalCount: 0, items: []})
    })

    it('should return 404 fot not existing users', async () => {
        await request(httpServer)
            .get(`${RouterPaths.users}/1`)
            .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HttpStatus.NOT_FOUND)
    })

    it(`shouldn't create user with UNAUTHORIZED`, async () => {
        await request(httpServer)
            .post(RouterPaths.users)
            .set('authorization', 'Basic YWRtaW')
            .send(dataTestUserCreate01)
            .expect(HttpStatus.UNAUTHORIZED)
    })

    it(`shouldn't create user with empty login`, async () => {

        const data = {
            ...dataTestUserCreate01,
            login: incorrectUserData.emptyLogin
        }

        await usersTestManager
            .createUserAdmin(data, HttpStatus.BAD_REQUEST, 1)

        await request(httpServer)
            .get(RouterPaths.users)
            .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HttpStatus.OK, {pagesCount: 0, page: 1, pageSize: 10, totalCount: 0, items: []})
    })

    it(`shouldn't create user with login more than 10 characters`, async () => {
        const data = {
            ...dataTestUserCreate01,
            login: incorrectUserData.tooLongLogin
        }

        await usersTestManager
            .createUserAdmin(data, HttpStatus.BAD_REQUEST, 1)

        await request(httpServer)
            .get(RouterPaths.users)
            .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HttpStatus.OK, {pagesCount: 0, page: 1, pageSize: 10, totalCount: 0, items: []})
    })

    it(`shouldn't create user with empty email`, async () => {
        const data = {
            ...dataTestUserCreate01,
            email: incorrectUserData.emptyEmail
        }

        await usersTestManager
            .createUserAdmin(data, HttpStatus.BAD_REQUEST, 1)

        await request(httpServer)
            .get(RouterPaths.users)
            .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HttpStatus.OK, {pagesCount: 0, page: 1, pageSize: 10, totalCount: 0, items: []})
    })

    it(`shouldn't create user with incorrect email`, async () => {
        const data = {
            ...dataTestUserCreate01,
            email: incorrectUserData.incorrectEmail
        }

        await usersTestManager
            .createUserAdmin(data, HttpStatus.BAD_REQUEST, 1)

        await request(httpServer)
            .get(RouterPaths.users)
            .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HttpStatus.OK, {pagesCount: 0, page: 1, pageSize: 10, totalCount: 0, items: []})
    })

    it(`shouldn't create user with empty password`, async () => {
        const data = {
            ...dataTestUserCreate01,
            password: incorrectUserData.emptyPassword
        }

        await usersTestManager
            .createUserAdmin(data, HttpStatus.BAD_REQUEST, 1)

        await request(httpServer)
            .get(RouterPaths.users)
            .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HttpStatus.OK, {pagesCount: 0, page: 1, pageSize: 10, totalCount: 0, items: []})
    })

    it(`shouldn't create user with password more than 20 characters`, async () => {
        const data = {
            ...dataTestUserCreate01,
            password: incorrectUserData.tooLongPassword
        }

        await usersTestManager
            .createUserAdmin(data, HttpStatus.BAD_REQUEST, 1)

        await request(httpServer)
            .get(RouterPaths.users)
            .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HttpStatus.OK, {pagesCount: 0, page: 1, pageSize: 10, totalCount: 0, items: []})
    })

    it(`shouldn't create user with password that does not match the pattern`, async () => {
        const data = {
            ...dataTestUserCreate01,
            password: incorrectUserData.incorrectPassword
        }

        await usersTestManager
            .createUserAdmin(data, HttpStatus.BAD_REQUEST, 1)

        await request(httpServer)
            .get(RouterPaths.users)
            .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HttpStatus.OK, {pagesCount: 0, page: 1, pageSize: 10, totalCount: 0, items: []})
    })

    it(`shouldn't create user with incorrect data`, async () => {
        const data = {
            ...dataTestUserCreate01,
            login: incorrectUserData.emptyLogin,
            email: incorrectUserData.emptyEmail,
            password: incorrectUserData.incorrectPassword
        }

        await usersTestManager
            .createUserAdmin(data, HttpStatus.BAD_REQUEST, 3)

        await request(httpServer)
            .get(RouterPaths.users)
            .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HttpStatus.OK, {pagesCount: 0, page: 1, pageSize: 10, totalCount: 0, items: []})
    })

    it(`should create user with correct input data`, async () => {

        const user = await usersTestManager.createUserAdmin(dataTestUserCreate01)

        await request(httpServer)
            .get(RouterPaths.users)
            .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HttpStatus.OK,
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

        await request(httpServer)
            .get(`${RouterPaths.users}/?pageSize=15&sortDirection=asc`)
            .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HttpStatus.OK,
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

        await request(httpServer)
            .get(`${RouterPaths.users}/?searchLoginTerm=og9`)
            .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HttpStatus.OK,
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

        await request(httpServer)
            .get(`${RouterPaths.users}/?searchEmailTerm=il8`)
            .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HttpStatus.OK,
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

        await request(httpServer)
            .delete(`${RouterPaths.users}/${user.createdEntity.id}`)
            .set('authorization', 'Basic YWRtaW')
            .expect(HttpStatus.UNAUTHORIZED)
    })

    it(`shouldn't delete  user`, async () => {
        await request(httpServer)
            .delete(`${RouterPaths.users}/7779161`)
            .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HttpStatus.BAD_REQUEST)
    })

    it(`should delete both user`, async () => {

        const user = await usersTestManager.createUserAdmin(dataTestUserCreate01)

        await request(httpServer)
            .delete(`${RouterPaths.users}/${user.createdEntity.id}`)
            .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HttpStatus.NO_CONTENT)

        await request(httpServer)
            .get(`${RouterPaths.users}/${user.createdEntity.id}`)
            .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HttpStatus.NOT_FOUND)

        await request(httpServer)
            .get(RouterPaths.users)
            .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HttpStatus.OK,
                {
                    pagesCount: 0,
                    page: 1,
                    pageSize: 10,
                    totalCount: 0,
                    items: []
                })
    })

})




