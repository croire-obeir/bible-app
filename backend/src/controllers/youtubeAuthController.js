
import { google } from 'googleapis';


const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_OAUTH_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

oauth2Client.setCredentials({
  refresh_token: process.env.YOUTUBE_REFRESH_TOKEN,
});

const scopes = [
  'https://www.googleapis.com/auth/youtube.readonly',
];

export const authorizeYouTube = (req, res) => {
  const authorizationUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
  });

  res.redirect(authorizationUrl);
};

export const youtubeCallback = async (req, res) => {
  try {
    const { code, error } = req.query;

    if (error) {
      return res.status(400).send('YouTube authorization was denied.');
    }

    if (!code) {
      return res.status(400).send('Missing authorization code.');
    }

    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.refresh_token) {
      return res.status(400).send(
        'No refresh token returned. Please authorize again.'
      );
    }

    console.log('YouTube authorization successful.');
    res.send('YouTube authorization successful.');
  } catch (error) {
    console.error('YouTube OAuth error:', error.message);
    res.status(500).send('YouTube authorization failed.');
  }
};

export default oauth2Client;
