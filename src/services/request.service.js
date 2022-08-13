require('dotenv').config();

const axios = require('axios');
const qs = require('qs');

module.exports = class Request {
  constructor() {}

  static send = (options) => {
    console.log('cookieeeeeeeeeeeeeeeeeeeeeeeeee', process.env.COOKIE);
    return new Promise(async (resolve, reject) => {
      options = {
        method: options.method.toUpperCase(),
        url: options.url,
				data: options.data,
        headers: {
          accept: '*/*',
          Cookie: process.env.COOKIE,
          'accept-encoding': 'gzip, deflate, br',
          'content-type': 'application/x-www-form-urlencoded',
          'accept-encoding': 'gzip',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'none',
          origin: 'https://m.facebook.com',
          referer: 'https://m.facebook.com',
          'user-agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Safari/537.36',
          ...(options.headers || []),
        },
      };
      if (options.method !== 'GET') {
        options.data = qs.stringify(options.data);
      }
      console.log('options', options);
      axios(options)
        .then((response) => {
          resolve(response);
        })
        .catch(reject);
    });
  };
};
