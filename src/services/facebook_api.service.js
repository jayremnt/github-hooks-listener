const Request = require('./request.service');
require('dotenv').config();

class FacebookAPI {
  static adAccountId = '';
  static accessToken = '';
  static adsToken = '';
  static lastTokenTime = 0;
  static fbDtsg = '';
  static lastFbDtsgTime = 0;
  static fbId = '';
  static isLoggedIn = '';
  static userId = '';
  static facebookMobileHost = 'https://www.facebook.com';
  static dtsgExpireTime = 4 * 3600 * 1000;
  static tokenExpireTime = 24 * 3600 * 1000;
  static identityLoaded = false;

  constructor() {}

  static mSendMessage(
    receiverId,
    message,
    attachments = [],
    isGroup = false,
    isSticker = false
  ) {
    console.log('fb_dtsg: ', process.env.FB_DTSG);
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
      })
        .then(resolve)
        .catch(reject);
    });
  }

  static advancedSendMessage(
    uid,
    receiverId,
    message,
    attachments = [],
    isGroup = false,
    isSticker = false
  ) {
    // attachments: [{ type: type, id: id }, ...]
    // - type: image_id|gif_id|file_id|video_id|audio_id
    // - id: attachment id

    return new Promise(async (resolve, reject) => {
      let randomId = Math.floor(Math.random() * 100000000000);
      let fbDtsg = process.env.FB_DTSG;
      console.log('fbDtsgggggggggggggggggggggggg', fbDtsg);

      let form = {
        fb_dtsg: fbDtsg,
        client: 'mercury',
        action_type: 'ma-type:user-generated-message',
        author: 'fbid:' + uid,
        timestamp: Date.now(),
        timestamp_absolute: 'Today',
        timestamp_time_passed: '0',
        is_unread: false,
        is_cleared: false,
        is_forward: false,
        is_filtered_content: false,
        is_filtered_content_bh: false,
        is_filtered_content_account: false,
        is_filtered_content_quasar: false,
        is_filtered_content_invalid_app: false,
        is_spoof_warning: false,
        source: 'source:chat:web',
        'source_tags[0]': 'source:chat',
        body: message ? message.toString() : '',
        html_body: false,
        ui_push_phase: 'V3',
        status: '0',
        message_id: randomId,
        offline_threading_id: randomId,
        'ephemeral_ttl_mode:': '0',
        manual_retry_cnt: '0',
        has_attachment: !!attachments.length || isSticker,
        image_ids: [],
        gif_ids: [],
        file_ids: [],
        video_ids: [],
        audio_ids: [],
      };

      if (isGroup) form['thread_fbid'] = receiverId;
      else {
        form['specific_to_list[0]'] = 'fbid:' + receiverId;
        form['specific_to_list[1]'] = 'fbid:' + uid;
        form['other_user_fbid'] = receiverId;
      }

      if (isSticker) form['sticker_id'] = message;

      attachments.forEach((attachment) => {
        form[attachment.type + 's'].push(attachment.id);
      });

      Request.send({
        url: 'https://www.facebook.com/messaging/send/',
        method: 'post',
        data: form,
      })
        .then(resolve)
        .catch(reject);
    });
  }
}

module.exports = FacebookAPI;
