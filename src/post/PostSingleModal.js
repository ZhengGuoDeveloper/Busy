import React, { Component } from 'react';
import { withRouter } from 'react-router';
import './PostSingleModal.scss';

@withRouter
export default class PostSingleModal extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    if (window.history) {
      // manipulate address bar to show the article's address
      const { content } = this.props;
      const postPath = `/${content.parent_permlink}/@${content.author}/${content.permlink}`;
      window.history.pushState({}, content.title, postPath);
    }
  }

  handleClose = (e) => {
    if (window.history) {
      window.history.back();
    }
  };

  render() {
    const { content, onClickReblog } = this.props;

    return (
      <div className="PostSingleModal">
        <h1 className="mvl">{content.title}</h1>
        <button onClick={this.handleClose}>Close</button>
        @{content.author}
        <p>
          {content.body}
        </p>
      </div>
    );
  }
}
