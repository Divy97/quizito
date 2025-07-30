/* eslint-disable @typescript-eslint/no-non-null-assertion */
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { getClient } from '../utils/database.js';

// Configure Google OAuth strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  callbackURL: process.env.GOOGLE_CALLBACK_URL!
}, async (accessToken, refreshToken, profile, done) => {
  try {
    console.log('in passport', {
      id: profile.id,
      email: profile.emails?.[0]?.value,
      accessToken,
      refreshToken,
      profile
    });

    const client = await getClient();
    
    try {
      // Check if user exists
      const existingUser = await client.query(
        'SELECT * FROM users WHERE google_id = $1',
        [profile.id]
      );

      if (existingUser.rows.length > 0) {
        return done(null, existingUser.rows[0]);
      }

      // Create new user
      const newUser = await client.query(
        `INSERT INTO users (google_id, email, username, avatar_url)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [
          profile.id,
          profile.emails?.[0]?.value,
          profile.displayName,
          profile.photos?.[0]?.value
        ]
      );

      return done(null, newUser.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    return done(error as Error);
  }
}));

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const client = await getClient();
    
    try {
      const result = await client.query('SELECT * FROM users WHERE id = $1', [id]);
      done(null, result.rows[0] || null);
    } finally {
      client.release();
    }
  } catch (error) {
    done(error as Error);
  }
});

export default passport; 