// import express from "express";
// import fetch from "node-fetch";
// import fs from "fs";

// const app = express();
// app.use(express.json({ limit: "10mb" }));

// const HF_TOKEN = process.env.HF_TOKEN; // store your token safely

// app.post("/remove-bg", async (req, res) => {
//   try {
//     const { imageBase64 } = req.body; // frontend sends base64 string
//     const imageBuffer = Buffer.from(imageBase64, "base64");

//     const response = await fetch(
//       "https://api-inference.huggingface.co/models/briaai/RMBG-1.4",
//       {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${HF_TOKEN}`,
//           "Content-Type": "application/octet-stream",
//         },
//         body: imageBuffer,
//       }
//     );

//     const result = await response.arrayBuffer();
//     const outputBuffer = Buffer.from(result);

//     // save locally or upload to cloud
//     fs.writeFileSync("output.png", outputBuffer);

//     // send base64 back for frontend preview
//     res.json({
//       success: true,
//       image: `data:image/png;base64,${outputBuffer.toString("base64")}`,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: "Error removing background" });
//   }
// });

// app.listen(3000, () => console.log("Server running on port 3000"));
