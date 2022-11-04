import { api } from "@serverless/cloud";
import express from "express";
import bodyParser from "body-parser";
import { getAuth, signInWithCustomToken } from "firebase/auth";
import { initializeApp } from "firebase/app";

export async function idTokenFromCustomToken(firebaseConfig, customToken) {
  const fb_app = initializeApp(firebaseConfig);
  const auth = getAuth(fb_app);
  const userCredential = await signInWithCustomToken(auth, customToken);
  const user = userCredential.user;
  return user.getIdToken();
}

export const tokenHandler = async (req, res) => {
  const firebaseConfig = req.body.firebaseConfig;
  const customToken = req.body.customToken;
  try {
    const idToken = await idTokenFromCustomToken(firebaseConfig, customToken);
    res.send(idToken);
  } catch (error) {
    console.log("error", error);
    res.statusCode = 500;
    res.send({ error: error.message });
  }
};

const DEPLOY_TYPE = process.env.DEPLOY_TYPE || "SERVERLESS_CLOUD";

if (DEPLOY_TYPE == "SERVERLESS_CLOUD") {
  api.get("/", (req, res) => {
    res.send("Hello World");
  });
  api.post("/token", tokenHandler);
} else {
  const app = express();
  const port = process.env.port || 3000;
  app.use(bodyParser.json());

  app.get("/", (req, res) => {
    res.send("Hello World!");
  });

  app.post("/token", tokenHandler);

  app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
  });
}
