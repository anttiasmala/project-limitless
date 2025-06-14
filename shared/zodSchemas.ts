import { z } from 'zod';
import { emailRegex, passwordRegex } from './regexPatterns';

export const uuidSchema = z
  .string({ message: 'Invalid UUID! It should be given as a string!' })
  .uuid('UUID pattern was invalid!');

export const dateSchema = z
  .string()
  .min(1, 'Date is mandatory!')
  .datetime({ message: 'Given date is invalid!' })
  .pipe(z.coerce.date());

export const firstNameSchema = z
  .string()
  .min(1, 'Etunimi on pakollinen!')
  .max(128, 'Etunimi on liian pitkä, maksimipituus on 128 merkkiä');

export const lastNameSchema = z
  .string()
  .min(1, 'Sukunimi on pakollinen!')
  .max(128, 'Sukunimi on liian pitkä, maksimipituus on 128 merkkiä');

export const emailSchema = z
  .string()
  .min(1, 'Sähköposti on pakollinen!')
  .max(128, 'Sähköposti on liian pitkä, maksimipituus on 128 merkkiä')
  .regex(emailRegex, 'Sähköposti on virheellinen')
  .transform((value) => value.toLowerCase());

export const passwordSchema = z
  .string()
  .min(1, 'Salasana on pakollinen!')
  .max(128, 'Salasana on liian pitkä, maksimipituus on 128 merkkiä')
  .regex(
    passwordRegex,
    'Salasanan täytyy olla vähintään 8 merkkiä pitkä, maksimissaan 128 merkkiä pitkä, sekä sisältää vähintään yksi iso kirjain, yksi pieni kirjain, yksi numero ja yksi erikoismerkki!',
  );

export const streetAddressSchema = z
  .string({ message: 'Street address should be a string' })
  .max(128, { message: 'Street address is too long' })
  .optional();

export const zipCodeSchema = z
  .string({ message: 'Zip code should be a string' })
  .max(128, { message: 'Zipcode is too long' })
  .optional();

export const citySchema = z
  .string({ message: 'City should be a string' })
  .max(128, { message: 'City is too long' })
  .optional();

// USER

/** Contains ALL the rows in database */
export const fullUserSchema = z.object({
  id: z.number().min(1, 'ID is mandatory!'),
  uuid: uuidSchema,
  firstName: firstNameSchema,
  lastName: lastNameSchema,
  email: emailSchema,
  password: passwordSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});

/** Contains mandatory data to specify a user. Such as email, first name, etc */
export const userSchema = fullUserSchema.pick({
  email: true,
  firstName: true,
  lastName: true,
});

/** Schema to be used when wanting details of user. It does not have password etc for a security reason */
export const getUserSchema = fullUserSchema
  .pick({
    uuid: true,
    createdAt: true,
    updatedAt: true,
  })
  .merge(userSchema);

export const createUserSchema = userSchema.extend({
  password: passwordSchema,
});

// SESSION

export const fullSessionSchema = z.object({
  uuid: uuidSchema,
  userUUID: uuidSchema,
  expiresAt: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
  isLoggedIn: z.boolean(),
});

export const getSessionSchema = fullSessionSchema.pick({
  uuid: true,
  userUUID: true,
  expiresAt: true,
  isLoggedIn: true,
});

export const sessionSchema = getSessionSchema;

export const frontendSessionSchema = getSessionSchema.extend({
  fresh: z.boolean(),
});

export const createSessionSchema = getSessionSchema.pick({
  uuid: true,
  userUUID: true,
  expiresAt: true,
});

export const validSessionResultSchema = z.object({
  status: z.literal('valid'),
  databaseSession: sessionSchema,
  databaseUser: getUserSchema,
});

export const invalidSessionResultSchema = z.object({
  status: z.literal('invalid'),
  databaseSession: z.null(),
  databaseUser: z.null(),
});

// VESIOSUUSKUNTA

export const fullVesiosuuskuntaSchema = z.object({
  id: z.number(),
  uuid: uuidSchema,
  name: z
    .string()
    .min(1, 'Name for Vesiosuuskunta is mandatory!')
    .max(128, { message: 'Name for Vesiosuuskunta is too long!' }),
  streetAddress: streetAddressSchema,
  zipCode: zipCodeSchema,
  city: citySchema,
  ownerUUID: uuidSchema,
  userUUID: uuidSchema,
});

export const getVesiosuuskuntaSchema = fullVesiosuuskuntaSchema.pick({
  uuid: true,
  name: true,
  streetAddress: true,
  zipCode: true,
  city: true,
  ownerUUID: true,
  userUUID: true,
});

export const createVesiosuuskuntaSchema = fullVesiosuuskuntaSchema.pick({
  name: true,
  streetAddress: true,
  zipCode: true,
  city: true,
});

// MEMBERS

export const fullMemberSchema = z.object({
  id: z.number(),
  uuid: uuidSchema,
  lastName: lastNameSchema,
  firstName: firstNameSchema,
  streetAddress: streetAddressSchema,
  zipCode: zipCodeSchema,
  city: citySchema,
  phoneNumber: z
    .string({ message: 'Phonenumber should be a string' })
    .max(128, 'Phonenumber is too long')
    .optional(),
  email: emailSchema,
  paid: z
    .string({ message: 'Paid should be a string' })
    .max(128, 'Paid is too long')
    .optional(),
  connectionPointNumber: z
    .string({ message: 'Connection point number should be a string' })
    .max(128, 'Connection point number is too long')
    .optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  vesiosuuskuntaUUID: z
    .string({ message: 'vesiosuuskuntaUUID should be a string' })
    .uuid(),
  comment: z.string({ message: 'comment should be a string' }).optional(),
});

export const getMemberSchema = fullMemberSchema.omit({
  id: true,
});

export const createMemberSchema = fullMemberSchema.pick({
  lastName: true,
  firstName: true,
  streetAddress: true,
  zipCode: true,
  city: true,
  phoneNumber: true,
  email: true,
  paid: true,
  connectionPointNumber: true,
  comment: true,
});

export const patchMemberSchema = fullMemberSchema.omit({
  id: true,
  uuid: true,
  createdAt: true,
  updatedAt: true,
});

// LOGIN

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});
