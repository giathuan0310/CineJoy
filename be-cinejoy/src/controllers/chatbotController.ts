import chatbotService from "../services/chatbotService";

const ChatbotController = {
    getChatResponse: async (req: any, res: any) => {
        const { message, sessionId = "default" } = req.body;

        if (!message) {
            return res.status(400).json({ error: "Tin nhắn không được để trống." });
        }

        const response = await chatbotService.getResponse(message, sessionId);
        res.json({ reply: response });
    },
};

export default ChatbotController;
