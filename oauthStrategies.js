// oauthStrategies.js
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import 'dotenv/config';

function mapProfile(provider, profile) {
  const email = profile.emails?.[0]?.value ?? null;
  const name = profile.displayName || profile.username || '';
  const avatar = profile.photos?.[0]?.value ?? null;
  return {
    id: `${provider}:${profile.id}`, // ID artificial estable
    name, email, avatar
  };
}

passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
  },
  async (_accessToken, _refreshToken, profile, done) => {
    try { done(null, mapProfile('google', profile)); }
    catch (e) { done(e); }
  }
));

passport.use(new GitHubStrategy(
  {
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL,
    scope: ['user:email'],
  },
  async (_accessToken, _refreshToken, profile, done) => {
    try { done(null, mapProfile('github', profile)); }
    catch (e) { done(e); }
  }
));
