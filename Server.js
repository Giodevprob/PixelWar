// server.js

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB (replace with your MongoDB URI)
mongoose.connect("YOUR_MONGODB_CONNECTION_STRING", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// Define a schema and model for Pixel Art Data
const pixelSchema = new mongoose.Schema({
  pixels: [String],   // Array of pixel color data
  timeLeft: Number,   // Time remaining for drawing
  drawnPixels: Object // Tracks drawn pixels by index
});

const PixelArt = mongoose.model("PixelArt", pixelSchema);

// Route to save pixel data
app.post("/save", async (req, res) => {
  const { pixels, timeLeft, drawnPixels } = req.body;

  try {
    const newPixelArt = new PixelArt({
      pixels,
      timeLeft,
      drawnPixels
    });

    const savedPixelArt = await newPixelArt.save();
    res.json({ message: "Data saved!", id: savedPixelArt._id });
  } catch (error) {
    res.status(500).json({ message: "Error saving data", error });
  }
});

// Route to load pixel data by ID
app.get("/load/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const pixelArt = await PixelArt.findById(id);
    if (!pixelArt) {
      return res.status(404).json({ message: "Data not found" });
    }
    res.json(pixelArt);
  } catch (error) {
    res.status(500).json({ message: "Error loading data", error });
  }
});

// Start the server
const port = 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
