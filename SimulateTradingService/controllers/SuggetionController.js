const {GoogleGenerativeAI} = require("@google/generative-ai");

// Access your API key as an environment variable AIzaSyBepmoqxvpcfnhoCfcHmJnxNwhyRS964Gs
const genAI = new GoogleGenerativeAI('AIzaSyBepmoqxvpcfnhoCfcHmJnxNwhyRS964Gs');
const model = genAI.getGenerativeModel({model: "gemini-pro"});
const buyOrderSuggestion = async (req, res) => {
    try {
        console.log('Request Body:', req.body);
        const {coinName, tradePrice, tradingData, quantity} = req.body;

        if (!coinName || !tradePrice || !tradingData) {
            return res.status(400).json({error: 'Bad Request: Missing required fields'});
        }

        const tradingDataString = JSON.stringify(tradingData);

        const prompt = `Consider the scenario where you recently made a trade involving ${coinName}. You purchased ${quantity} units of ${coinName} at a price of $${tradePrice}. Throughout this trade, the price of ${coinName} fluctuated as follows:
${tradingDataString}.
Now, based on this trade, I'd like your suggestions on how to optimize future buy orders and some advice for improving trading strategies.
Please format your response in JSON like this:
{
  "coin": "Bitcoin",
  "bestPrice": "1000",
  "time":"1716257160",
  "profitFromBestPrice": "100",
  "suggestions": "",
  "advices": ""
}.
Ensure all fields are represented as strings and the suggestions and the advices should be point form.`;


        console.log(prompt);

        const result = await model.generateContent(prompt);
        const response = await result.response;
        console.log('Response Text:', response.text());
        const suggestions = JSON.parse(response.text());

        if (suggestions.bestPrice !== null && suggestions.profitFromBestPrice !== null) {
            console.log('Suggestions:', suggestions);
            res.json(suggestions);
        } else {
            await buyOrderSuggestion(req, res);
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({error: 'Internal Server Error'});
    }
}

module.exports = {
    buyOrderSuggestion
};

