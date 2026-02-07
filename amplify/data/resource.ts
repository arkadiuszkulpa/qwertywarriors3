import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  Score: a
    .model({
      username: a.string().required(),
      score: a.integer().required(),
      wordsCompleted: a.integer().required(),
      accuracy: a.float().required(),
      maxCombo: a.integer().required(),
      difficultyLevel: a.integer().required(),
    })
    .authorization((allow) => [allow.guest()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'identityPool',
    apiKeyAuthorizationMode: {
      expiresInDays: 365,
    },
  },
});
