import {
  UPDATE_SINGLE_DETAILS_STATE,
  UPDATE_SOFTWARE_DETAILS_STATE,
} from "./actions";

type State = {
  showAlert: boolean;
  alertText: string;
  alertType: string;
  singleStateData: any;
  email: string | null;
  token: string | false;
  username: string | null;
  isUserLoggedIn: string | false;
  singleSoftwareData: any;
};

type Action = {
  type: string;
  payload?: any;
};

export const AppReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case UPDATE_SINGLE_DETAILS_STATE:
      return {
        ...state,
        singleStateData: action.payload.details,
      };

    case UPDATE_SOFTWARE_DETAILS_STATE:
      return {
        ...state,
        singleSoftwareData: action.payload.details,
      };

    default:
      throw new Error(`${action.type} does not exist`);
  }
};
