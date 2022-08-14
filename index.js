require('dotenv').config();

process.env.USER_ID; // "239482"
process.env.USER_KEY; // "foobar"
process.env.NODE_ENV; // "development"

const express = require('express');
const path = require('path');
const FacebookAPI = require('./src/services/facebook_api.service.js');
const PORT = process.env.PORT || 4567;

const app = express();

app
  .use(express.json())
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

app.post('/hooks', async function (req, res) {
  var body = req.body;

  res.json({
    message: 'ok got it!',
  });
  console.log(body);

  let message = '';
  message += `${
    body?.pusher?.name
  } just pushed on ${body?.repository?.full_name}!
➡️ This push includes ${body?.commits?.length} commits.
🔥 Head commit: ${body?.head_commit?.url} - ${body?.head_commit?.message}
➕ ${body?.head_commit?.added.length} files were added.
➖ ${body?.head_commit?.removed.length} files were removed.
🔧 ${body?.head_commit?.modified.length} files were modified.
⏰ At ${body?.head_commit?.timestamp}`;

  FacebookAPI.mSendMessage(process.env.DESTINATION_INBOX, message, [], true)
    .then((response) => {
      console.log('response: ', response.data);
    })
    .catch((error) => {
      console.log('err: ', error);
      // console.log(error.response.data);
    });

  console.log(message);
});
