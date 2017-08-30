import { OPEN_TRANSFER, CLOSE_TRANSFER } from './walletActions';

const initialState = {
  transferVisible: false,
  transferTo: '',
};

export default function walletReducer(state = initialState, action) {
  switch (action.type) {
    case OPEN_TRANSFER:
      return {
        ...state,
        transferVisible: true,
        transferTo: action.payload.to,
      };
    case CLOSE_TRANSFER:
      return {
        ...state,
        transferVisible: false,
      };
    default:
      return state;
  }
}
