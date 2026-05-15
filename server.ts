import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import firebaseConfig from "./firebase-applet-config.json" assert { type: "json" };

// Initialize Firebase Admin
if (getApps().length === 0) {
  initializeApp({
    projectId: firebaseConfig.projectId,
  });
}

const db = getFirestore(firebaseConfig.firestoreDatabaseId);
const auth = getAuth();

// Helper to get user doc
const getUserDoc = (uid: string) => db.collection("users").doc(uid);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Claim Reward Endpoint
  app.post("/api/claim-reward", async (req, res) => {
    const { idToken, taskId } = req.body;

    if (!idToken || !taskId) {
      return res.status(400).json({ error: "Missing parameters" });
    }

    try {
      // 1. Verify user
      const decodedToken = await auth.verifyIdToken(idToken);
      const uid = decodedToken.uid;

      // 2. Get task details
      const taskDoc = await db.collection("tasks").doc(taskId).get();
      if (!taskDoc.exists) {
        return res.status(404).json({ error: "Task not found" });
      }
      const taskData = taskDoc.data();
      const reward = taskData?.reward || 0;

      // 3. Update user balance
      const userRef = getUserDoc(uid);
      await db.runTransaction(async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists) {
            transaction.set(userRef, {
                uid,
                email: decodedToken.email,
                coins: reward,
                tasksCompleted: 1,
                totalWithdrawn: 0,
                role: "user",
                createdAt: FieldValue.serverTimestamp()
            });
        } else {
            const currentCoins = userDoc.data()?.coins || 0;
            const currentTasks = userDoc.data()?.tasksCompleted || 0;
            transaction.update(userRef, {
                coins: currentCoins + reward,
                tasksCompleted: currentTasks + 1
            });
        }
      });

      return res.json({ success: true, reward });
    } catch (error) {
      console.error("Error claiming reward:", error);
      return res.status(500).json({ error: "Failed to claim reward" });
    }
  });

  // Seed tasks if empty
  try {
    const tasksCount = await db.collection("tasks").limit(1).get();
    if (tasksCount.empty) {
      console.log("Seeding initial tasks...");
      const initialTasks = [
        { title: "Watch Shortened Video", reward: 10, duration: 15, type: "video", url: "https://example.com/ad1", active: true },
        { title: "Visit Sponsored Link", reward: 15, duration: 30, type: "link", url: "https://example.com/ad2", active: true },
        { title: "Browse Partner Site", reward: 5, duration: 10, type: "link", url: "https://example.com/ad3", active: true },
      ];
      for (const task of initialTasks) {
        await db.collection("tasks").add(task);
      }
    }
  } catch (e) {
    console.error("Task seeding failed (maybe DB not ready):", e);
  }

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
