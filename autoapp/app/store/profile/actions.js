export const PROFILE_FETCH_REQUEST = "PROFILE_FETCH_REQUEST";
export const requestProfileFetch = (id) => ({
    type: PROFILE_FETCH_REQUEST,
    id
});

export const PROFILE_LOAD = "PROFILE_LOAD";
export const profileLoadAction = (profile) => ({
    type: PROFILE_LOAD,
    profile
});
