import dotenv from "dotenv";

dotenv.config();

export const config = {
  instagram: {
    clientId: process.env.INSTAGRAM_CLIENT_ID!,
    clientSecret: process.env.INSTAGRAM_CLIENT_SECRET!,
    redirectUri: process.env.INSTAGRAM_REDIRECT_URI!,
  },
};
