// src/services/cognito.js
import { Amplify } from 'aws-amplify';
import {
  signIn,
  signUp,
  signOut,
  getCurrentUser,
  confirmSignUp,
  fetchAuthSession,
  resetPassword,
  confirmResetPassword,
} from 'aws-amplify/auth';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId:       process.env.REACT_APP_COGNITO_USER_POOL_ID,
      userPoolClientId: process.env.REACT_APP_COGNITO_CLIENT_ID,
      region:           'us-east-2',
    },
  },
});

export {
  signIn,
  signUp,
  signOut,
  getCurrentUser,
  confirmSignUp,
  fetchAuthSession,
  resetPassword,
  confirmResetPassword,
};