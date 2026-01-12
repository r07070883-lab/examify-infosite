import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// serve your static frontend (index.html) from this folder
app.use(express.static("."));

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post("/api/chat", async (req, res) => {
  try {
    const { exam, question } = req.body || {};

    const systemPrompt =
  "You are an exam assistant for Indian entrance exams. " +
  "Answer briefly and clearly. You can answer any question the student asks " +
  "about this exam: importance, courses, eligibility, pattern, difficulty, cutoffs, preparation, etc. " +
  "Be factual and avoid making up institutes or courses.";


    const userPrompt =
      "Exam: " + (exam || "Unknown") + "\n" +
      "Question: " + (question || "") + "\n\n" +
      "After answering, add this sentence exactly once at the end:\n" +
      "'If this does not answer your question, please contact ground support (TEAM EXAMIFY).'";

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 250,
      temperature: 0.4
    });

    const answer =
      completion.choices?.[0]?.message?.content?.trim() ||
      "I am unable to answer right now. Please contact ground support (TEAM EXAMIFY).";

    res.json({ answer });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      answer:
        "Server error while contacting the AI. Please contact ground support (TEAM EXAMIFY)."
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running at http://localhost:" + PORT);
});
