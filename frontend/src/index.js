import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import "bootstrap/dist/css/bootstrap.min.css";
import { Amplify } from "aws-amplify";
import config from "./config";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Home, {loader as homeLoader} from "./containers/Home";
import Login from "./containers/Login";
import Signup from "./containers/Signup";
import NotFound from "./containers/NotFound";
import Settings from "./containers/Settings";
import UnauthenticatedRoute from "./components/UnauthenticatedRoute";
import AuthenticatedRoute from "./components/AuthenticatedRoute";
import NewEntry from "./containers/NewEntry";
import { Entry } from "./containers/Entry";

Amplify.configure({
  Auth: {
    mandatorySignIn: true,
    region: config.cognito.REGION,
    userPoolId: config.cognito.USER_POOL_ID,
    identityPoolId: config.cognito.IDENTITY_POOL_ID,
    userPoolWebClientId: config.cognito.APP_CLIENT_ID,
  },
  Storage: {
    region: config.s3.REGION,
    bucket: config.s3.BUCKET,
  },
  API: {
    endpoints: [
      {
        name: "notes",
        endpoint: config.apiGateway.URL,
        region: config.apiGateway.REGION,
      },
    ]
  }
});

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    // loader: rootLoader,
    errorElement: <NotFound />,
    children: [
      {
        path: "",
        element: <Home />,
        loader: homeLoader,
      },
      {
        path: "login",
        element:
          <UnauthenticatedRoute>
            <Login />
          </UnauthenticatedRoute>,
        // loader: teamLoader,
      },
      {
        path: "signup",
        element:
          <UnauthenticatedRoute>
            <Signup />
          </UnauthenticatedRoute>,
        // loader: teamLoader,
      },
      {
        path: "settings",
        element:
          <AuthenticatedRoute>
            <Settings />
          </AuthenticatedRoute>,
        // loader: teamLoader,
      },
      {
        path: "entries/new",
        element:
          <AuthenticatedRoute>
            <NewEntry />
          </AuthenticatedRoute>,
        // loader: teamLoader,
      },
      {
        path: "entries/:id",
        element:
          <AuthenticatedRoute>
            <Entry />
          </AuthenticatedRoute>,
        // loader: teamLoader,
      },
    ],
  },
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
