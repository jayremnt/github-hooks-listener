require('dotenv').config();

const express = require('express');
const path = require('path');
const FacebookAPI = require('./services/facebook_api.service.js');
const PORT = process.env.PORT || 4567;

const app = express();

app
  .use(express.json())
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

app.post('/hooks', function (req, res) {
  res.json({
    message: 'ok got it!',
  });

  try {
    const body = req.body;
    let message = '';

    if (req.headers['x-github-event'] === 'deployment') {
      message = `🔃 ${body?.deployment?.creator?.login} is deploying ${body?.repository?.full_name}...`;
    } else if (req.headers['x-github-event'] === 'deployment_status') {
      body?.deployment_status &&
        body?.deployment_status?.state === 'success' &&
        (message += `✅ ${body?.repository?.full_name} is deployed successfully!
Link: ${body?.deployment_status?.environment_url}`);

      body?.deployment_status &&
        body?.deployment_status?.state === 'failure' &&
        (message += `❌ ${body?.repository?.full_name} failed to deploy!`);
    } else if (req.headers['x-github-event'] === 'push') {
      message += `${body?.pusher?.name} just pushed on ${
        body?.repository?.full_name
      }!
➡️ This push includes ${body?.commits?.length || 0} commits.
🔥 Head commit: ${body.head_commit?.url} - ${body.head_commit?.message}
✖️ ${body.head_commit?.added?.length || 0} files were added.
➖ ${body.head_commit?.removed?.length || 0} files were removed.
🛠️ ${body.head_commit?.modified?.length || 0} files were modified.
⏰ At ${body.head_commit?.timestamp?.split('T')[0]} ${
        body.head_commit?.timestamp?.split('T')[1]?.split('.')[0]
      }`;
    }

    message !== '' &&
      FacebookAPI.mSendMessage(process.env.DESTINATION_INBOX, message, [], true)
        .then((res) => console.log(res.data))
        .catch(console.error);
  } catch (err) {
    console.error(err);
  }
});
