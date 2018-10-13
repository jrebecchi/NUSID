const AppTester = require('../../utils/app-tester.js');
const User = require('../../../bundles/UserspaceBundle/model/UserModel.js');

let appTester;
let request;

let testUser = {
    username: "jimihendrix", 
    email: "jimi@hendrix.com", 
    password: "password", 
    confirm_password: "password",
    first_name: "Jimi",
    last_name: "Hendrix",
    conditions: true
};

let passwordDesired = "newpassword";

beforeAll((done) => {

    appTester = new AppTester({useMockAuthentificaiton: false});
    request = appTester.getRequestSender();
    
    test('Email test options pass to global object', (done) => {
        expect(global.userspaceMailOptions).toBeTruthy();
        done();
    });

    appTester.connectDB(done);
});


describe('Test Modifying password', () => {
    test('with good user inputs', (done) => {
        request.post('/register').send(testUser)
        .then((response) => {
            expect(response.header.location).toBe("/login");
            expect(response.statusCode).toBe(302);
            return request.post('/login').send({username: testUser.email, password: testUser.password})
        })
        .then((response) => {
            expect(response.statusCode).toBe(302);
            expect(response.header.location.includes("dashboard")).toBeTruthy();
            return request.get('/settings');
        })
        .then((response) => {
            expect(response.statusCode).toBe(200);
            return request.post('/modify-password').send({old_password: "Wrongpassword!", password: passwordDesired, confirm_password: passwordDesired});
        })
        .then((response) => {
            expect(response.statusCode).toBe(302);
            expect(response.header.location).toBe("/settings");
            return request.get('/settings');
        })
        .then((response) => {
            expect(response.statusCode).toBe(200);
            expect(response.text.includes("You entered a wrong password")).toBeTruthy();
            return request.get('/logout');
        })
        .then((response) => {
            expect(response.statusCode).toBe(302);
            expect(response.header.location).toBe('/');
            return request.post('/login').send({username: testUser.email, password: testUser.password})
        })
        .then((response) => {
            expect(response.statusCode).toBe(302);
            expect(response.header.location.includes("dashboard")).toBeTruthy();
            return request.post('/modify-password').send({old_password: testUser.password, password: passwordDesired, confirm_password: passwordDesired+"mistake"});
        })
        .then((response) => {
            expect(response.statusCode).toBe(302);
            expect(response.header.location).toBe("/settings");
            return request.get('/settings');
        })
        .then((response) => {
            expect(response.statusCode).toBe(200);
            expect(response.text.includes("error")).toBeTruthy();
            return request.get('/logout');
        })
        .then((response) => {
            expect(response.statusCode).toBe(302);
            expect(response.header.location).toBe('/');
            return request.post('/login').send({username: testUser.email, password: testUser.password})
        })
        .then((response) => {
            expect(response.statusCode).toBe(302);
            expect(response.header.location).toBe('/dashboard');
            return request.post('/modify-password').send({old_password: testUser.password, password: passwordDesired, confirm_password: passwordDesired});
        })
        .then((response) => {
            expect(response.statusCode).toBe(302);
            return request.get('/logout');
        })
        .then((response) => {
            expect(response.statusCode).toBe(302);
            expect(response.header.location).toBe('/');
            return request.post('/login').send({username: testUser.email, password: passwordDesired})
        })
        .then((response) => {
            expect(response.statusCode).toBe(302);
            expect(response.header.location.includes("dashboard")).toBeTruthy();
            done();
        });
    }, 100000);
});

afterAll((done) =>{
    User.removeUser({email: testUser.email})
    .then(() => {
        appTester.disconnectDB(done);
    })
});