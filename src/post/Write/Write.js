import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import kebabCase from 'lodash/kebabCase';
import debounce from 'lodash/debounce';
import isArray from 'lodash/isArray';
import 'url-search-params-polyfill';
import { createPost, saveDraft, newPost } from './EditorActions';
import Editor from '../../components/Editor/Editor';

const version = require('../../../package.json').version;

@connect(state => ({
  user: state.auth.user,
  editor: state.editor,
}), {
  createPost, saveDraft, newPost,
})
class Write extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      initialTitle: '',
      initialTopics: [],
      initialBody: '',
    };
  }
  componentDidMount() {
    this.props.newPost();
    const { editor: { draftPosts }, location: { search } } = this.props;
    const draftId = new URLSearchParams(search).get('draft');
    const draftPost = draftPosts[draftId];
    const postData = draftPost.postData;

    if (postData) {
      const { jsonMetadata } = postData;
      let tags = [];
      if (isArray(jsonMetadata.tags)) { tags = jsonMetadata.tags; }
      // eslint-disable-next-line
      this.setState({
        initialTitle: postData.title || '',
        initialTopics: tags || [],
        initialBody: postData.body || '',
      });
    }
  }

  onSubmit = (form) => {
    const data = this.getNewPostData(form);
    const { location: { search } } = this.props;
    const id = new URLSearchParams(search).get('draft');
    if (id) {
      data.draftId = id;
    }
    this.props.createPost(data);
  }

  getNewPostData = (form) => {
    const data = {
      body: form.body,
      title: form.title,
    };

    data.parentAuthor = '';
    data.author = this.props.user.name || '';

    // TODO: Extract images

    const tags = form.topics;
    const users = [];
    const userRegex = /@([a-zA-Z.0-9-]+)/g;
    const links = [];
    const linkRegex = /\[.+?]\((.*?)\)/g;
    let matches;

    const postBody = data.body;

    // eslint-disable-next-line
    while (matches = userRegex.exec(postBody)) {
      if (users.indexOf(matches[1]) === -1) {
        users.push(matches[1]);
      }
    }

    // eslint-disable-next-line
    while (matches = linkRegex.exec(postBody)) {
      if (links.indexOf(matches[1]) === -1 && matches[1].search(/https?:\/\//) === 0) {
        links.push(matches[1]);
      }
    }

    if (data.title && !data.permalink) {
      data.permlink = kebabCase(data.title);
    }

    const metaData = {
      app: `busy/${version}`,
      format: 'markdown',
    };

    if (tags.length) { metaData.tags = tags; }
    if (users.length) { metaData.users = users; }
    if (links.length) { metaData.links = links; }
    // if (image.length) { metaData.image = image; }

    data.parentPermlink = tags.length ? tags[0] : 'general';
    data.jsonMetadata = metaData;

    return data;
  }

  saveDraft = debounce((form) => {
    const data = this.getNewPostData(form);
    const postBody = data.body;
    const { location: { search } } = this.props;
    let id = new URLSearchParams(search).get('draft');

    // Remove zero width space
    const isBodyEmpty = postBody.replace(/[\u200B-\u200D\uFEFF]/g, '').trim().length === 0;

    if (isBodyEmpty) return;

    if (id === null) {
      id = Date.now().toString(16);
    }

    this.props.saveDraft({ postData: data, id });
  }, 400);

  render() {
    const { initialTitle, initialTopics, initialBody } = this.state;

    return (
      <div className="shifted">
        <div className="container">
          <Editor
            ref={this.setForm}
            title={initialTitle}
            topics={initialTopics}
            body={initialBody}
            onUpdate={this.saveDraft}
            onSubmit={this.onSubmit}
          />
        </div>
      </div>
    );
  }
}

export default withRouter(Write);
