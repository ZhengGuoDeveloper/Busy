import * as bookmarksActions from './bookmarksActions';

const initialState = {};

const bookmarks = (state = initialState, action) => {
  switch (action.type) {
    case bookmarksActions.TOGGLE_BOOKMARK_SUCCESS:
      return action.payload;
    case bookmarksActions.REMOVE_BOOKMARK:
      return {
        ...state,
        [action.payload.user]: state[action.payload.user].filter(
          bookmark => bookmark.id !== action.payload.postId,
        ),
      };
    default:
      return state;
  }
};

export default bookmarks;

export const getBookmarks = state => state;
