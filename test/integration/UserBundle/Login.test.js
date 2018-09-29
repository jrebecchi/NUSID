const AppTester = require('../../utils/app-tester.js');

let appTester;
let request;

let testUser = {
    username: "johnsmith", 
    email: "john@smith.com", 
    password: "password", 
    confirm_password: "password",
    first_name: "john",
    last_name: "smith",
    conditions: true
};

beforeAll(() => {

    appTester = new AppTester({useMockAuthentificaiton: false});
    request = appTester.getRequestSender();
    
    test('Email test options pass to global object', (done) => {
        expect(global.userspaceMailOptions).toBeTruthy();
        done();
    });
});


describe('Test login with good credentials', () => {
    test('Register - login -logout ', (done) => {
        request.post('/register').send(testUser)
        .then((response) => {
            console.log(response.text);
            expect(response.header.location).toBe("/login");
            expect(response.statusCode).toBe(302);
            return request.post('/login').send({username: testUser.email, password: testUser.password})
        })
        .then((response) => {
            expect(response.statusCode).toBe(302);
            expect(response.header.location.includes("dashboard")).toBeTruthy();
            return request.get('/logout');
        })
        .then((response) => {
            expect(response.statusCode).toBe(302);
            expect(response.header.location).toBe('/');
            return request.get('/dashboard');
        })
        .then((response) => {
            expect(response.statusCode).toBe(302);
            done();
        });
    }, 100000);
});

describe('Test login with bad credentials', () => {
    testUser.email = 'alice.smith@test.com';
    testUser.username = 'alicesmith';

    test('Register - login with wring email - login with wrong password ', (done) => {
        request.post('/register').send(testUser)
        .then((response) => {
            console.log(response.text);
            expect(response.header.location).toBe("/login");
            expect(response.statusCode).toBe(302);
            return request.post('/login').send({username: 'badadress@test.com', password: testUser.password});
        })
        .then((response) => {
            expect(response.statusCode).toBe(302);
            expect(response.header.location.includes("login")).toBeTruthy();
            return request.post('/login').send({username: testUser.email, password: 'badpassword'})
        })
        .then((response) => {
            expect(response.statusCode).toBe(302);
            expect(response.header.location.includes("login")).toBeTruthy();
            done();
        })
    }, 100000);
});

afterEach((done) =>{
    appTester.removeUser(testUser.email ,done);
});