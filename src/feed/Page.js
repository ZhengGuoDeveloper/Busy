import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Header from '../app/Header';
import MenuFeed from '../app/Menu/MenuFeed';
import TriggerFeed from '../app/Trigger/TriggerFeed';
import Feed from './Feed';
import PageHOC from './PageHOC';
import {
  getFeedContent,
  getMoreFeedContent,
  getUserFeedContent,
  getMoreUserFeedContent,
} from './feedActions';
import {
  getFeedContentFromState,
  getFeedLoadingFromState,
  getUserFeedContentFromState,
  getUserFeedLoadingFromState,
} from './../helpers/stateHelpers';
import * as commentsActions from './../comments/commentsActions';
import { toggleBookmark } from '../app/Bookmarks/bookmarksActions';


@PageHOC
@connect(
  state => ({
    feed: state.feed,
    posts: state.posts,
    bookmarks: state.bookmarks,
  }),
  (dispatch, ownProps) => {
    const { sortBy, category, auth, limit } = ownProps;
    return {
      getFeedContent: () => dispatch(
        getFeedContent({ sortBy, category, limit })
      ),
      getMoreFeedContent: () => dispatch(
        getMoreFeedContent({ sortBy, category, limit })
      ),
      getUserFeedContent: () => dispatch(
        getUserFeedContent({ username: auth.user.name, limit })
      ),
      getMoreUserFeedContent: () => dispatch(
        getMoreUserFeedContent({ username: auth.user.name, limit })
      ),
      openCommentingDraft: bindActionCreators(commentsActions.openCommentingDraft, dispatch),
      closeCommentingDraft: bindActionCreators(commentsActions.closeCommentingDraft, dispatch),
      toggleBookmark: (postId) => dispatch(
        toggleBookmark({ postId })
      ),
    };
  }
)

export default class Page extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { notify, category, sortBy, path, auth, feed, posts, limit, bookmarks } = this.props;
    const { openCommentingDraft, closeCommentingDraft } = this.props;

    let content, isFetching, hasMore, loadContentAction, loadMoreContentAction;

    if (!path && auth.isAuthenticated) {
      content = getUserFeedContentFromState(auth.user.name, feed, posts);
      isFetching = getUserFeedLoadingFromState(auth.user.name, feed);
      hasMore = feed[sortBy][auth.user.name] ? feed[sortBy][auth.user.name].hasMore : true;
      loadContentAction = this.props.getUserFeedContent;
      loadMoreContentAction = this.props.getMoreUserFeedContent;
    } else {
      content = getFeedContentFromState(sortBy, category, feed, posts);
      isFetching = getFeedLoadingFromState(sortBy, category, feed);
      hasMore = feed[sortBy][category] ? feed[sortBy][category].hasMore : true;
      loadContentAction = this.props.getFeedContent;
      loadMoreContentAction = this.props.getMoreFeedContent;
    }

    return (
      <div className="main-panel">
        <Header />
        <MenuFeed category={category} />
        {auth.isAuthenticated &&
          <TriggerFeed category={category} />}
        {!auth.isFetching &&
          <Feed
            content={content}
            isFetching={isFetching}
            hasMore={hasMore}
            loadContent={loadContentAction}
            loadMoreContent={loadMoreContentAction}
            openCommentingDraft={openCommentingDraft}
            closeCommentingDraft={closeCommentingDraft}
            toggleBookmark={this.props.toggleBookmark}
            bookmarks={bookmarks}
            notify={notify}
          />}
      </div>
    );
  }
}

Page.propTypes = {
  account: React.PropTypes.string,
  category: React.PropTypes.string,
  sortBy: React.PropTypes.string,
  path: React.PropTypes.string,
  limit: React.PropTypes.number,
};
