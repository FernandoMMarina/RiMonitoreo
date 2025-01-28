const initialState = {
    maquinas: [],
    lastMaintenances: [],
  };
  
  export const machinesReducer = (state = initialState, action) => {
    switch (action.type) {
      case 'SET_MACHINES':
        return {
          ...state,
          maquinas: action.payload,
        };
      case 'SET_LAST_MAINTENANCES':
        return {
          ...state,
          lastMaintenances: action.payload,
        };
      default:
        return state;
    }
  };
  