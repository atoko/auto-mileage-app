export const AUTH_LOGIN = "AUTH_LOGIN";
export const authLoginAction = (id, token, expires = null) => ({
    type: AUTH_LOGIN,
    id,
    token,
    expires
});


export const AUTH_VERIFIED = "AUTH_VERIFIED";
export const AUTH_VERIFY_REQUEST = "AUTH_VERIFY_REQUEST";
export const requestAuthVerify = (token) => ({
    type: AUTH_VERIFY_REQUEST,
    token
});

export const authVerifiedAction = () => ({
    type: AUTH_VERIFIED
});


export const AUTH_LOGOUT = "AUTH_LOGOUT";
export const authLogoutAction = () => ({
    type: AUTH_LOGOUT
});
