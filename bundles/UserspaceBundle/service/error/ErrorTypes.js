module.exports = {
    EmailAlreadyExistsError: class EmailAlreadyExistsError extends Error {
        constructor(user){
            super();
            this.user = user;
        }
    },
    UsernameAlreadyExistsError: class UsernameAlreadyExistsError extends Error {
        constructor(user){
            super();
            this.user = user;
        }
    },
    WrongPasswordError: class WrongPasswordError extends Error {},
    WrongPasswordError: class WrongPasswordError extends Error {},
    WrongLoginError:class WrongLoginError extends Error {},
    UpdatePasswordTooLateError:class UpdatePasswordTooLateError extends Error {},
    EmailNotSentError: class EmailNotSentError extends Error {},
    UserNotFound: class UserNotFound extends Error {},
    EmailNotSentError: class EmailNotSentError extends Error {}, 
}