require('dotenv').config();
const Request = require('./request.service');

class FacebookAPI {
  constructor() {}

  static mSendMessage(
    receiverId,
    message,
    attachments = [],
    isGroup = false,
    isSticker = false
  ) {
    return new Promise(async (resolve, reject) => {
      let json = {};
      if (!isGroup) {
        json['ids[' + receiverId + ']'] = receiverId;
      } else {
        json['tids'] = 'cid.g.' + receiverId;
      }
      json['body'] = isSticker ? '' : message;
      if (isSticker) {
        json['sticker_id'] = message;
      }
      json['waterfall_source'] = 'message';
      json['fb_dtsg'] = process.env.FB_DTSG;
      if (!isSticker)
        attachments.forEach((a) => {
          json['photo_ids[' + a + ']'] = a;
        });

      Request.send({
        url: 'https://m.facebook.com/messages/send/?icm=1&refid=12&ref=dbl',
        method: 'post',
        data: json,
        headers: {
          origin: 'https://m.facebook.com',
          referer: 'https://m.facebook.com',
        },
      })
        .then(resolve)
        .catch(reject);
    });
  }
}

module.exports = FacebookAPI;
