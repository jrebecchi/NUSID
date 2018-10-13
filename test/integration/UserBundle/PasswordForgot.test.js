const AppTester = require('../../utils/app-tester.js');
const User = require('../../../bundles/UserspaceBundle/model/UserModel.js');
let appTester;
let request;

let testUser = {
    username: "kimk", 
    email: "kim.kardashian@test.com", 
    password: "password", 
    confirm_password: "password",
    first_name: "Kim",
    last_name: "Kardashian",
    conditions: true
};

let newPassword = "password2";
let updatePasswordToken;

beforeAll((done) => {

    appTester = new AppTester({useMockAuthentificaiton: false});
    request = appTester.getRequestSender();
    
    test('Email test options pass to global object', (done) => {
        expect(global.userspaceMailOptions).toBeTruthy();
        done();
    });

    appTester.connectDB(done);
});

describe('User can reset password forgotten', () => {

    test('Test access to the password reset form', (done) => {
        request.get("/password_reset")
        .then((response) => {
            expect(response.statusCode).toBe(200);
            done();
        })
    });

    test('Test access to the password renew form', (done) => {
        request.get("/password_renew")
        .then((response) => {
            expect(response.statusCode).toBe(200);
            done();
        })
    });
    
    test("Password can not be reseted from unexisting email in the database", (done) => {
        let wrongEmail = "wrong.email@test.com";
        return request.post('/password_reset').send({email: wrongEmail})
        .then((response) => {
            expect(response.statusCode).toBe(302);
            expect(response.header.location).toBe("/login");
            return User.userExists({email: wrongEmail});
        })
        .then(exists => {
            expect(exists).toBeFalsy();
            done();
        })
    });

    test('Establishing a new password', (done) => {
        request.post('/register').send(testUser)
        .then((response) => {
            expect(response.header.location).toBe("/login");
            expect(response.statusCode).toBe(302);
            return request.post('/password_reset').send({email: testUser.email});
        })
        .then((response) => {
            expect(response.statusCode).toBe(302);
            expect(response.header.location).toBe("/login");
            return User.getUser({email: testUser.email});
        })
        .then((user) => {
            expect(user).toBeTruthy();
            updatePasswordToken = user.extras.updatePasswordToken;
            expect(updatePasswordToken).toBeTruthy();
            return request.get("/password_renew?token="+updatePasswordToken);
        })
        .then((response) => {
            expect(response.statusCode).toBe(200);
            return request.post("/password_renew").send({password: newPassword, confirm_password: newPassword, token: updatePasswordToken});
        })
        .then((response) => {
            expect(response.statusCode).toBe(302);
            expect(response.header.location).toBe("/login");
            return request.post('/login').send({username: testUser.email, password: newPassword})
        })
        .then((response) => {
            expect(response.statusCode).toBe(302);
            expect(response.header.location.includes("dashboard")).toBeTruthy();
            return request.get("/logout");
        })
        .then((response) => {
            expect(response.statusCode).toBe(302);
            expect(response.header.location).toBe("/");
            done();
        })
    }, 100000);
});

afterAll((done) =>{
    User.removeUser({email: testUser.email})
    .then(() => {
        appTester.disconnectDB(done);
    })
});