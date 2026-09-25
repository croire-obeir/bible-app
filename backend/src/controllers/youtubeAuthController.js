// import { google } from 'googleapis';

// const oauth2Client = new google.auth.OAuth2(
//   process.env.GOOGLE_OAUTH_CLIENT_ID,
//   process.env.GOOGLE_CLIENT_SECRET,
//   process.env.GOOGLE_REDIRECT_URI
// );

// const scopes = [
//   'https://www.googleapis.com/auth/youtube.readonly',
// ];

// export const authorizeYouTube = (req, res) => {
//   const authorizationUrl = oauth2Client.generateAuthUrl({
//     access_type: 'offline',
//     scope: scopes,
//     prompt: 'consent',
//   });

//   res.redirect(authorizationUrl);
// };

// export const youtubeCallback = async (req, res) => {
//   try {
//     const { code } = req.query;

//     await oauth2Client.getToken(code);

//     res.send('YouTube authorization successful!');
//   } catch (error) {
//     console.error('YouTube OAuth error:', error);
//     res.status(500).send('YouTube authorization failed');
//   }
// };


import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_OAUTH_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Add this
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
    const { code } = req.query;

    await oauth2Client.getToken(code);

    res.send('YouTube authorization successful!');
  } catch (error) {
    console.error('YouTube OAuth error:', error);
    res.status(500).send('YouTube authorization failed');
  }
};

export default oauth2Client;