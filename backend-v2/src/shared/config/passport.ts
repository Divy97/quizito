import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import pool from './database.js';

dotenv.config();

// Placeholder for the user type
interface User {
  id: string;
  google_id: string;
  email: string;
  username: string;
  avatar_url: string;
}

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: process.env.GOOGLE_CALLBACK_URL!
  },
  async (accessToken, refreshToken, profile, done) => {
    const { id, displayName, emails, photos } = profile;
    if (!emails || emails.length === 0) {
      return done(new Error("No email found from Google profile"));
    }
    const email = emails[0].value;
    const avatarUrl = photos ? photos[0].value : null;

    console.log('in passport', {
      id, 
      email,
      accessToken,
      refreshToken,
      profile,
    })
    
    try {
      const { rows } = await pool.query(
        'SELECT * FROM users WHERE google_id = $1',
        [id]
      );

      if (rows.length > 0) {
        return done(null, rows[0]);
      } else {
        const newUser = await pool.query(
          `INSERT INTO users (google_id, email, username, avatar_url)
           VALUES ($1, $2, $3, $4)
           RETURNING *`,
          [id, email, displayName, avatarUrl]
        );
        return done(null, newUser.rows[0]);
      }
    } catch (error) {
      return done(error);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, (user as User).id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (rows.length > 0) {
      done(null, rows[0]);
    } else {
      done(new Error('User not found'));
    }
  } catch (error) {
    done(error);
  }
});

export default passport; 