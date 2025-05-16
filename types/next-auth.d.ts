import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      is_doctor: boolean;
      is_admin: boolean;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    is_doctor: boolean;
    is_admin: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    is_doctor: boolean;
    is_admin: boolean;
  }
} 