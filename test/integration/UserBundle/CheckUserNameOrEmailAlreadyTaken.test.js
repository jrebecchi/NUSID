const AppTester = require('../../utils/app-tester.js');
let appTester;
let request;

let testUser = {
    username: "JamieF", 
    email: "jamie.fox@test.com", 
    password: "password", 
    confirm_password: "password",
    first_name: "Jamie",
    last_name: "Fox",
    conditions: true
};

beforeAll((done) => {

    appTester = new AppTester({useMockAuthentificaiton: false});
    request = appTester.getRequestSender();

    request.post('/register').send(testUser)
    .then((response) => {
        expect(response.header.location).toBe("/login");
        expect(response.statusCode).toBe(302);
        done();
    })
});

describe("Test if detect email/username already taken", () => {
    test('Test email', (done) => {
        return request.get("/email-exists?email="+testUser.email)
        .then((response) => {
            let answer = JSON.parse(response.text);
            expect(answer.emailExists).toBeTruthy();
            return request.get("/email-exists?email="+"anotheremail@test.com");
        })
        .then((response) => {
            let answer = JSON.parse(response.text);
            expect(answer.emailExists).toBeFalsy();
            done();
        });
    }, 100000);

    test('Test username', (done) => {
        return request.get("/username-exists?username="+testUser.username)
        .then((response) => {
            let answer = JSON.parse(response.text);            
            expect(answer.usernameExists).toBeTruthy();
            return request.get("/username-exists?username="+"another_username");
        })
        .then((response) => {
            let answer = JSON.parse(response.text);
            expect(answer.usernameExists).toBeFalsy();
            done();
        })
    }, 100000);
});

afterAll((done) =>{
    appTester.removeUser(testUser.email ,done);
});