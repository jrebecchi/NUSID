const UserspaceBundle = require("../../../bundles/UserspaceBundle/UserspaceBundle");
const Router = require('../../../bundles/UserspaceBundle/router/Router');
const Passport = require('../../../bundles/UserspaceBundle/service/authentification/PassportAuthentification');


test('Function init exists', () => {
  expect(UserspaceBundle.init).toBeTruthy();
});

test('MainBundle router added', () => {
    const app  = jest.fn();
    Router.init = jest.fn();
    Passport.init = jest.fn();
    UserspaceBundle.init(app);
    expect(Router.init).toHaveBeenCalledTimes(1);
    expect(Passport.init).toHaveBeenCalledTimes(1);
});