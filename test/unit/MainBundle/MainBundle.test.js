const MainBundle = require("../../../bundles/MainBundle/MainBundle");
const Router = require('../../../bundles/MainBundle/router/Router')

test('Function init exists', () => {
  expect(MainBundle.init).toBeTruthy();
});

test('MainBundle router added', () => {
    const app  = jest.fn();
    Router.init = jest.fn();
    MainBundle.init(app);
    expect(Router.init).toHaveBeenCalledTimes(1);
});