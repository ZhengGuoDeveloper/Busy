import Promise from 'bluebird';
import { createAction } from 'redux-actions';
import SteemConnect from 'steemconnect';
import { createCommentPermlink } from '../helpers/steemitHelpers';

SteemConnect.comment = Promise.promisify(SteemConnect.comment, { context: SteemConnect });

export const GET_COMMENTS = 'GET_COMMENTS';
export const GET_COMMENTS_START = 'GET_COMMENTS_START';
export const GET_COMMENTS_SUCCESS = 'GET_COMMENTS_SUCCESS';
export const GET_COMMENTS_ERROR = 'GET_COMMENTS_ERROR';

export const SHOW_MORE_COMMENTS = 'SHOW_MORE_COMMENTS';

export const SEND_COMMENT = 'SEND_COMMENT';
export const SEND_COMMENT_START = 'SEND_COMMENT_START';
export const SEND_COMMENT_SUCCESS = 'SEND_COMMENT_SUCCESS';
export const SEND_COMMENT_ERROR = 'SEND_COMMENT_ERROR';

export const OPEN_COMMENTING_DRAFT = 'OPEN_COMMENTING_DRAFT';
export const UPDATE_COMMENTING_DRAFT = 'UPDATE_COMMENTING_DRAFT';
export const CLOSE_COMMENTING_DRAFT = 'CLOSE_COMMENTING_DRAFT';


export const openCommentingDraft = createAction(OPEN_COMMENTING_DRAFT);
export const updateCommentingDraft = createAction(UPDATE_COMMENTING_DRAFT);
export const closeCommentingDraft = createAction(CLOSE_COMMENTING_DRAFT);

export const LIKE_COMMENT = '@comments/LIKE_COMMENT';
export const LIKE_COMMENT_START = '@comments/LIKE_COMMENT_START';
export const LIKE_COMMENT_SUCCESS = '@comments/LIKE_COMMENT_SUCCESS';
export const LIKE_COMMENT_ERROR = '@comments/LIKE_COMMENT_ERROR';

export const showMoreComments = createAction(
  SHOW_MORE_COMMENTS,
  () => null,
  meta => ({ id: meta, })
);

export const RELOAD_EXISTING_COMMENT = '@comments/RELOAD_EXISTING_COMMENT';
export const reloadExistingComment = createAction(RELOAD_EXISTING_COMMENT);

/**
 * Will recursively create a tree of comments with their children like this:
 * { id: '2.1.85555', children: [ { id: '2.1.55444', children: [...] ], }
 * @param commentKey - the key of rootComment we want to re-structure
 * @param allComments - all comments received from getState api (usually res.content)
 * @returns {{id: *, children: *}}
 */
const nestCommentsChildren = (commentKey, allComments) => {
  const currentComment = allComments[commentKey];
  return {
    id: currentComment.id,
    children: currentComment.children > 0
      ? currentComment.replies.map(childCommentKey => nestCommentsChildren(childCommentKey, allComments))
      : {},
  };
};

/**
 * Will restructure and sort comments with only id and its children
 * @param apiRes - The result of getState for an article full path with steemAPI
 */
const sortCommentsList = (apiRes) => {
  const rootComments = Object.keys(apiRes.content).filter((commentKey) => {
    return apiRes.content[commentKey].depth === 1;
  });

  return rootComments.map(key => nestCommentsChildren(key, apiRes.content));
};

export const getComments = (postId) => {
  return (dispatch, getState, { steemAPI }) => {
    const { posts } = getState();

    const { author, permlink, category } = posts[postId];

    dispatch({
      type: GET_COMMENTS,
      payload: {
        promise: steemAPI.getStateAsync(`/${category}/@${author}/${permlink}`).then((apiRes) => {
          return {
            list: sortCommentsList(apiRes),
            content: apiRes.content,
          };
        }),
      },
      meta: {
        id: postId,
      },
    });
  };
};

export const sendComment = () => {
  return (dispatch, getState) => {
    const { auth, comments } = getState();

    if(!auth.isAuthenticated) {
      // dispatch error
      return;
    }

    const author = auth.user.name;
    const id = comments.currentDraftId;
    const { parentAuthor, parentPermlink, category, body } = comments.commentingDraft[id];

    const permlink = createCommentPermlink(parentAuthor, parentPermlink);
    const jsonMetadata = `{"tags": ["${category}"]}`;

    const optimisticData = {
      author,
      body,
      isOptimistic: true,
    };

    const optimisticId = Date.now();

    dispatch({
      type: SEND_COMMENT,
      payload: {
        promise: SteemConnect.comment(
          parentAuthor,
          parentPermlink,
          author,
          permlink,
          '',
          body,
          jsonMetadata
        ),
        data: optimisticData,
      },
      meta: {
        optimisticId,
        parentId: id,
      },
    });
    dispatch(closeCommentingDraft());

  };
};

export const likeComment = (commentId, weight = 10000) => {
  return (dispatch, getState, { steemAPI }) => {
    const { auth, comments } = getState();

    if (!auth.isAuthenticated) {
      return;
    }

    const voter = auth.user.name;
    const { author, permlink } = comments.comments[commentId];

    dispatch({
      type: LIKE_COMMENT,
      payload: {
        promise: SteemConnect.vote(voter, author, permlink, weight).then((res) => {
          // reload comment data to fetch payout after vote
          steemAPI.getContentAsync(author, permlink).then(data => {
            dispatch(reloadExistingComment(data));
          });

          return res;
        }),
      },
      meta: { commentId, voter, weight },
    });
  }
};

