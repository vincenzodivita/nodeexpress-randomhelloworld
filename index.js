import express from "express";
import { Firestore } from "@google-cloud/firestore";

const app = express();
const port = process.env.PORT || 8080;

// Firestore client
const firestore = new Firestore();

app.get("/hello", async (req, res) => {
  try {
    const collection = firestore.collection("greetings");
    const snapshot = await collection.get();

    if (snapshot.empty) {
      return res.status(404).json({ error: "No greetings found in database" });
    }

    const greetings = snapshot.docs.map(doc => doc.data().text);
    const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];

    res.json({ greeting: randomGreeting });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(port, () => console.log(`🚀 API running on port ${port}`));
