const { GoogleGenerativeAI } = require('@google/generative-ai');

// @desc    Get build advice from Gemini
// @route   POST /api/advisor
// @access  Private
const getBuildAdvice = async (req, res, next) => {
  try {
    const { stats, weaponPreference } = req.body;

    // Initialize the Gemini API
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // THE FIX: Using the exact model string authorized by your 2026 API key
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // The System Prompt
    const prompt = `
      You are an expert Dark Souls theory-crafter. A player has provided their current stats:
      Vigor: ${stats?.vigor || 10}, Endurance: ${stats?.endurance || 10}, Strength: ${stats?.strength || 10}, Dexterity: ${stats?.dexterity || 10}.
      They prefer using: ${weaponPreference || 'any effective weapon'}.
      
      Give them a short, punchy 2-to-3 sentence recommendation. Tell them one specific weapon that scales well with these stats, and tell them which stat they should focus on leveling up next to maximize their damage output. Do not use markdown formatting.
    `;

    // Fetch the response
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const adviceText = response.text();

    res.status(200).json({ 
      success: true, 
      advice: adviceText 
    });

  } catch (error) {
    console.error('🔥 Gemini Error:', error);
    res.status(500);
    next(new Error('The AI Advisor is currently resting at a bonfire. Try again later.'));
  }
};

module.exports = { getBuildAdvice };