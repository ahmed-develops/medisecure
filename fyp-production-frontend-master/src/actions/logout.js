import { LOGOUT_PRODUCTION } from "../config/constants";

const logoutAction = (cb = () => { }) => async dispatch => {
    try {
        dispatch({ type: LOGOUT_PRODUCTION.REQUEST });

        dispatch({ type: LOGOUT_PRODUCTION.SUCCESS, });
        cb(response);
    }
    catch (e) {
        dispatch({ type: LOGOUT_PRODUCTION.FAIL });
    }
    finally {
        dispatch({ type: LOGOUT_PRODUCTION.COMPLETE });
    }
};
export default logoutAction;
