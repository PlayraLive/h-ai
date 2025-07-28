const OpenAI = require('openai');
require('dotenv').config({ path: '.env.local' });

// OpenAI API Key from environment
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function testRealOpenAI() {
  try {
    console.log('🧪 Testing real OpenAI API...');

    const openai = new OpenAI({
      apiKey: OPENAI_API_KEY,
    });

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: "Hello! This is a test from H-Ai platform. Please respond with a short greeting."
        }
      ],
      max_tokens: 100,
    });

    console.log('✅ OpenAI API Response:');
    console.log(response.choices[0].message.content);
    
    return {
      success: true,
      response: response.choices[0].message.content
    };

  } catch (error) {
    console.error('❌ OpenAI API Error:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Test if this file is run directly
if (require.main === module) {
  testRealOpenAI()
    .then(result => {
      console.log('🎯 Test Result:', result);
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Fatal Error:', error);
      process.exit(1);
    });
}

module.exports = { testRealOpenAI }; 