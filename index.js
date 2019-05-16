const https = require('https');

const re = /<div class="tweet-text" data-id="(.*?)".*?>.+?<div.*?>\s*(.*?)<\/div>/ms;

module.exports = (username, callback) => {
  let promise = new Promise((resolve, reject) => {
    username = username.replace(/[@/]/g, '');

    https
      .get(`https://mobile.twitter.com/${username}`, res => {
        let html = '';

        res.on('data', d => {
          html += d.toString();
        });

        res.on('end', () => {
          if (res.statusCode === 200) {
            const match = html.match(re);
            if (match && match.length) {
              resolve({
                text: match[2].trim(),
                id: match[1],
              });
              return;
            }
          }
          reject(new Error('not found'));
        });
      })
      .on('error', e => {
        reject(e);
      });
  });

  if (callback) {
    return promise.then(res => callback(null, res)).catch(callback);
  }

  return promise;
};
