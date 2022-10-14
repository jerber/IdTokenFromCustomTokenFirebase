import express from "express";
import bodyParser from "body-parser";
import { getAuth, signInWithCustomToken } from "firebase/auth";
import { initializeApp } from "firebase/app";

async function idTokenFromCustomToken(firebaseConfig, customToken) {
  const fb_app = initializeApp(firebaseConfig);
  const auth = getAuth(fb_app);
  const userCredential = await signInWithCustomToken(auth, customToken);
  const user = userCredential.user;
  return user.getIdToken();
}

const app = express();
const port = process.env.port || 3000;
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/token", async (req, res) => {
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
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
