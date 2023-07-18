import { NextAuthOptions } from "next-auth";
import { db } from "./db";
import {PrismaAdapter} from '@next-auth/prisma-adapter';
import CredentialsProvider from "next-auth/providers/credentials";
import {nanoid} from 'nanoid';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/sign-in'
  },
  providers: [
    CredentialsProvider({
      // The name to display on the sign in form (e.g. "Sign in with...")
      name: "Credentials",
      // `credentials` is used to generate a form on the sign in page.
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {},
      async authorize(credentials, req) {
        const {email, password} = credentials as {email: String;
        password: String;};
        // Add logic here to look up the user from the credentials supplied
        //const user = { id: "1", name: "J Smith", email: "jsmith@example.com" }
  
        if(email!=='test@gmail.com') {
          throw new Error();
        }
        if (email==='test@gmail.com') {
          // Any object returned will be saved in `user` property of the JWT
          return email
        }
          // If you return null then an error will be displayed advising the user to check their details.
          return null
          // You can also Reject this callback with an Error thus the user will be sent to the error page with the error message as a query parameter
        
      },
      
    })
  ],
  callbacks: {
    async session({token, session}) {
      if(token) {
        session.user.id = token.id
        session.user.name = token.name
        session.user.email = token.email
        session.user.image = token.picture
        session.user.username = token.username
      }
      return session;
    },
    async jwt({token, user}) {
      const dbUser = await db.user.findFirst({
        where: {
          email: token.email,
        }
      })

      if(!dbUser) {
        token.id = user!.id
        return token
      }

      if(!dbUser.username) {
        await db.user.update({
          where: {
            id: dbUser.id
          },
          data: {
            username: nanoid(10),
          }
        })
      }

      return {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        picute: dbUser.image,
        username: dbUser.username
      }
    },
    redirect() {
      return '/'
    }
  }

}

/*
,
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!
    })
*/