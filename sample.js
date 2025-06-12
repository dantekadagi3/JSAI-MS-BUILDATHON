import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

const token = process.env.GITHUB_TOKEN;
const endpoint = "https://models.github.ai/inference";
const model = "meta/Llama-4-Maverick-17B-128E-Instruct-FP8";

const imageUrl = "https://i.imgur.com/t0RX3i7.jpg";

async function main() {
  if (!token) {
    throw new Error("GITHUB_TOKEN is not defined in environment variables.");
  }

  const client = ModelClient(endpoint, new AzureKeyCredential(token));

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await client.path("/chat/completions").post({
        body: {
          messages: [
            { role: "system", content: "You are a frontend developer." },
            {
              role: "user",
              content: [
                { type: "text", text: "Describe the layout in this image." },
                { type: "image_url", image_url: { url: imageUrl } }
              ]
            }
          ],
          temperature: 0.7,
          top_p: 1.0,
          max_tokens: 500,
          model
        }
      });

      if (isUnexpected(response)) {
        console.error("Unexpected response status:", response.status);
        console.error("Full response body:", response.body);
        throw new Error("Unexpected response. Check logs for details.");
      }

      console.log(response.body.choices[0].message.content);
      break;
    } catch (err) {
      console.error(`Attempt ${attempt} failed:`, err.message);
      if (attempt === 3) throw err;
    }
  }
}

main().catch((err) => {
  console.error("The sample encountered an error:");
  console.error(err?.message || err?.toString() || err);
});
