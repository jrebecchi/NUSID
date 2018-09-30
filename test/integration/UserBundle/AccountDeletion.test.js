const AppTester = require('../../utils/app-tester.js');

let appTester;
let request;

let testUser = {
    username: "davidgilmour", 
    email: "david@gilmour.com", 
    password: "password", 
    confirm_password: "password",
    first_name: "DAvid",
    last_name: "Gilmour",
    conditions: true
};

let passwordDesired = "newpassword";

beforeAll(() => {

    appTester = new AppTester({useMockAuthentificaiton: false});
    request = appTester.getRequestSender();
    
    test('Email test options pass to global object', (done) => {
        expect(global.userspaceMailOptions).toBeTruthy();
        done();
    });
});


describe('Test account account deletion', () => {
    test('with good user input', (done) => {
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
            return request.get('/settings');
        })
        .then((response) => {
            expect(response.statusCode).toBe(200);
            return request.post('/delete-account').send({password: testUser.password});
        })
        .then((response) => {
            expect(response.statusCode).toBe(302);
            expect(response.header.location).toBe('/');
            return request.post('/login').send({username: testUser.email, password: testUser.password})
        })
        .then((response) => {
            expect(response.statusCode).toBe(302);
            expect(response.header.location).toBe('/login');
            done();
        });
    }, 100000);
});

afterAll((done) =>{
    appTester.removeUser(testUser.email ,done);
});