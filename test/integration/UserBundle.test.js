const AppTester = require('../utils/app-tester.js');
const DB = require('../../bundles/UserspaceBundle/service/db/MongodbService');

describe('Test UserBundle API', () => {

    let appTester = new AppTester({useMockAuthentificaiton: false});
    let request = appTester.getRequestSender();
    
    test('Email test options pass to global object', (done) => {
        expect(global.userspaceMailOptions).toBeTruthy();
        done();
    });

    

    test('Acces to sign up form', (done) => {
        request.get('/register').then((response) => {
            expect(response.statusCode).toBe(200);
            done();
        });
    });

    test('Register user with correct entries', (done) => {
        request.post('/register').send({
            username: "username", 
            email: "test@test.com", 
            password: "password", 
            confirm_password: "password",
            first_name: "firstname",
            last_name: "lastname",
            conditions: true
        })
        .then((response) => {
            expect(response.header.location).toBe("/login");
            expect(response.statusCode).toBe(302);
            done();
        });
    }, 15000);
    
});

afterAll((done) =>{
    var db = new DB({});
    var COLLECTION = 'users';
    db.connect((err) => {
        if (err) {
            done(err);
        }
        db.loadCollection(COLLECTION, (err) => {
            if (err) {
                done(err);
            }
            db.dropCollection(COLLECTION, (err) => {
                if (err) {
                    done(err);
                }
                db.disconnect(() => {
                    done();
                });
            });
        });
    });  
});

