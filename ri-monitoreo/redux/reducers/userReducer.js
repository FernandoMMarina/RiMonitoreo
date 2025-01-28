const initialState = {
    username: '',
    email: '',
    gender: '',
    role: '',
    idCliente: null,
    rofile: null,
    loading: false,
    error: null,
  };
  
  export const userReducer = (state = initialState, action) => {
    switch (action.type) {
      case 'SET_USER_PROFILE':
        return {
          ...state,
          ...action.payload,
        };
      default:
        return state;
    }
  };
  