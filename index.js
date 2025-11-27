import express from "express";
import { Firestore } from "@google-cloud/firestore";

const app = express();
const port = process.env.PORT || 8080;

// Firestore client
const firestore = new Firestore();

// Middleware per leggere JSON dal body
app.use(express.json());

// GET /hello → ritorna un saluto casuale
app.get("/hello", async (req, res) => {
  try {
    const collection = firestore.collection("greetings");
    console.log("Fetching greetings from Firestore...");
    const snapshot = await collection.get();

    if (snapshot.empty) {
      console.warn("Firestore collection 'greetings' is empty!");
      return res.status(404).json({ error: "No greetings found in database" });
    }

    console.log(`Found ${snapshot.docs.length} greetings in Firestore`);

    const greetings = snapshot.docs.map(doc => doc.data().text);
    const validGreetings = greetings.filter(g => typeof g === "string");

    if (validGreetings.length === 0) {
      console.error("No valid greetings with field 'text'");
      return res.status(500).json({ error: "No valid greetings in DB" });
    }

    const randomGreeting = validGreetings[Math.floor(Math.random() * validGreetings.length)];
    console.log(`Returning greeting: ${randomGreeting}`);
    res.json({ greeting: randomGreeting });
  } catch (error) {
    console.error("Error fetching greetings:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});

// POST /add → aggiunge un nuovo saluto
app.post("/add", async (req, res) => {
  const { text } = req.body;

  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "Missing or invalid 'text' field" });
  }

  try {
    const docRef = await firestore.collection("greetings").add({ text });
    console.log(`Added new greeting with ID: ${docRef.id}`);
    res.json({ success: true, id: docRef.id, text });
  } catch (error) {
    console.error("Error adding greeting:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});

app.listen(port, () => console.log(`🚀 API running on port ${port}`));
