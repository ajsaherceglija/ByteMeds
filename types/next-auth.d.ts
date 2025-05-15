import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      isDoctor: boolean;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    isDoctor: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    isDoctor: boolean;
  }
} 