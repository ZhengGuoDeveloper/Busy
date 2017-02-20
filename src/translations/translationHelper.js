import _ from 'lodash';

export const toObject = (body) => {
  const object = {};
  const lines = body.split(/\n/);
  lines.forEach((line) => {
    const message = line.split(':');
    if (message.length === 2) {
      object[message[0].trim()] = message[1].trim();
    }
  });
  return object;
};

export const getMessages = (replies) => {
  const localesMap = {};
  const messages = {};
  const sortedReplies = _.sortBy(replies, 'net_rshares');

  Object.keys(sortedReplies).forEach((key) => {
    const reply = sortedReplies[key];
    if (reply.depth === 1 && reply.body.length === 4 && reply.body.substring(0, 2) === '# ') {
      localesMap[reply.permlink] = reply.body.replace('#', '').replace(' ', '').toLowerCase();
      messages[localesMap[reply.permlink]] = {};
    }
  });

  Object.keys(sortedReplies).forEach((key) => {
    const reply = sortedReplies[key];
    const locale = localesMap[reply.parent_permlink];
    if (locale) {
      const object = toObject(reply.body);
      messages[locale] = Object.assign(messages[locale], object);
    }
  });

  return messages;
};

export const getLocale = (appLocale, messages) => {
  const browserLocale = navigator.language || navigator.userLanguage; // eslint-disable-line
  let locale = appLocale || browserLocale;
  locale = locale.substr(0, 2);
  locale = messages[locale] ? locale : 'en';
  return locale;
};
