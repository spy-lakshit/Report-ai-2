// test-gemini.js  (CommonJS)
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(AIzaSyD1BJhDEoqWv2YLS2VVoJCd_TRpy1WGYaQ);

async function test() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Say 'Hello Gemini'");
    console.log(result.response.text());
  } catch (err) {
    console.error("Gemini error:", err);
  }
}

test();
