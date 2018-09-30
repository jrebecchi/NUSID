const AppTester = require('../../utils/app-tester.js');

let appTester;
let request;

let testUser = {
    username: "bobsmith", 
    email: "bob@smith.com", 
    password: "password", 
    confirm_password: "password",
    first_name: "bob",
    last_name: "smith",
    conditions: true
};

let testUserDesired = {
    username: "bobbysmith", 
    email: "bobby@smith.com", 
    password: "password2", 
    first_name: "bobby",
    last_name: "smoothy",
};

beforeAll(() => {

    appTester = new AppTester({useMockAuthentificaiton: false});
    request = appTester.getRequestSender();
    
    test('Email test options pass to global object', (done) => {
        expect(global.userspaceMailOptions).toBeTruthy();
        done();
    });
});


describe('Test account modification with good credentials', () => {
    test('Modify : username - email - password - firstname - lastname  ', (done) => {
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
            return request.post('/modify-username').send({username: testUserDesired.username});
        })
        .then((response) => {
            expect(response.statusCode).toBe(302);
            return request.post('/modify-email').send({email: testUserDesired.email});
        })
        .then((response) => {
            expect(response.statusCode).toBe(302);
            return request.post('/modify-firstname').send({first_name: testUserDesired.first_name});
        })
        .then((response) => {
            expect(response.statusCode).toBe(302);
            return request.post('/modify-lastname').send({last_name: testUserDesired.last_name});
        })
        .then((response) => {
            expect(response.statusCode).toBe(302);
            return request.get('/settings');
        })
        .then((response) => {
            expect(response.statusCode).toBe(200);
            expect(response.text.includes(testUserDesired.username)).toBeTruthy();
            expect(response.text.includes(testUserDesired.email)).toBeTruthy();
            expect(response.text.includes(testUserDesired.first_name)).toBeTruthy();
            expect(response.text.includes(testUserDesired.last_name)).toBeTruthy();
            done();
        });
    }, 100000);
});

afterAll((done) =>{
    appTester.removeUser(testUserDesired.email ,done);
});