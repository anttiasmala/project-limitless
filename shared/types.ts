import { z } from 'zod';
import {
  fullUserSchema,
  userSchema,
  getUserSchema,
  fullSessionSchema,
  sessionSchema,
  getSessionSchema,
  createSessionSchema,
  invalidSessionResultSchema,
  validSessionResultSchema,
  frontendSessionSchema,
  fullVesiosuuskuntaSchema,
  getVesiosuuskuntaSchema,
  createVesiosuuskuntaSchema,
  createUserSchema,
  fullMemberSchema,
  getMemberSchema,
  createMemberSchema,
  patchMemberSchema,
} from './zodSchemas';

// USER

export type FullUser = z.infer<typeof fullUserSchema>;

export type User = z.infer<typeof userSchema>;

export type GetUser = z.infer<typeof getUserSchema>;

export type CreateUser = z.infer<typeof createUserSchema>;

// SESSION

export type FullSession = z.infer<typeof fullSessionSchema>;

export type Session = z.infer<typeof sessionSchema>;

export type GetSession = z.infer<typeof getSessionSchema>;

export type FrontendSession = z.infer<typeof frontendSessionSchema>;

export type CreateSession = z.infer<typeof createSessionSchema>;

type validSessionResult = z.infer<typeof validSessionResultSchema>;

type invalidSessionResult = z.infer<typeof invalidSessionResultSchema>;

export type GetUserAndSessionResult = validSessionResult | invalidSessionResult;

// VESIOSUUSKUNTA

export type FullVesiosuuskunta = z.infer<typeof fullVesiosuuskuntaSchema>;

export type GetVesiosuuskunta = z.infer<typeof getVesiosuuskuntaSchema>;

export type CreateVesiosuuskunta = z.infer<typeof createVesiosuuskuntaSchema>;

// MEMBER

export type FullMember = z.infer<typeof fullMemberSchema>;

export type GetMember = z.infer<typeof getMemberSchema>;

export type CreateMember = z.infer<typeof createMemberSchema>;

export type PatchMember = z.infer<typeof patchMemberSchema>;

// DATABASE

export type DatabaseAdapter = {
  createSession: (sessionData: CreateSession) => Promise<Session | null>;
  deleteSession: (sessionUUID: string) => Promise<void>;

  //prettier-ignore

  /* No use for these? */
  //getSession: (sessionUUID: string) => Promise<Session | null>;
  //getUserFromSession: (sessionUUID: string) => Promise<User | null>; // potentially a dangerous function
  //getUserAndSessions: (userUUID: string) => Promise<[Session[], User] | null>; // gets the user and ALL the sessions

  // prettier-ignore
  //prettier-ignore
  getUserAndSession: (sessionUUID: string) => Promise<GetUserAndSessionResult>; // gets the user and ONLY ONE session
  getUserSessions: (userUUID: string) => Promise<Session[]>; // gets all the sessions belonging to a ONE user
  // prettier-ignore
  updateSessionExpirationDate: (sessionUUID: string, newSessionExpirationDate: Date) => Promise<void>;
  deleteUserSessions: (userUUID: string) => Promise<void>; // deletes all the sessions belonging to a user
  deleteExpiredSessions: () => Promise<void>;
};
