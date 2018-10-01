const AppTester = require('../../utils/app-tester.js');

let appTester;
let request;

let testUser = {
    username: "JohnT", 
    email: "john.travolta@test.com", 
    password: "password", 
    confirm_password: "password",
    first_name: "John",
    last_name: "Travolta",
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

describe('Test access to the register form when connected and not connected', () => {
    test('Login form accessible when not connected', (done) => {
        request.get("/register")
        .then((response) => {
            expect(response.statusCode).toBe(200);
            done();
        })
    });

    test('Login form not accessible not connected', (done) => {
        request.post('/register').send(testUser)
        .then((response) => {
            expect(response.header.location).toBe("/login");
            expect(response.statusCode).toBe(302);
            return request.post('/login').send({username: testUser.email, password: testUser.password})
        })
        .then((response) => {
            expect(response.statusCode).toBe(302);
            expect(response.header.location.includes("dashboard")).toBeTruthy();
            return request.get('/register');
        })
        .then((response) => {
            expect(response.statusCode).toBe(302);
            done();
        })
    }, 100000);
});

afterAll((done) =>{
    appTester.removeUser(testUser.email ,done);
});