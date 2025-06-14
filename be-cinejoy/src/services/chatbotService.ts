import axios from "axios";
import chatbotConfig from "../chatbot/chatbotConfig";

const { model, cache, conversationCache, PROMPT_CONFIG } = chatbotConfig;

const ChatbotService = {
    // Lưu tin nhắn vào lịch sử trò chuyện
    saveMessage: (sessionId: string, message: any) => {
        const conversationKey = `conversation:${sessionId}`;
        let conversation: any[] = conversationCache.get(conversationKey) || [];

        // Thêm tin nhắn mới vào cuối mảng
        conversation.push(message);

        // Giới hạn lịch sử trò chuyện tối đa 10 tin nhắn để tránh prompt quá dài
        if (conversation.length > PROMPT_CONFIG.MAX_CONVERSATION_LENGTH) {
            conversation = conversation.slice(-PROMPT_CONFIG.MAX_CONVERSATION_LENGTH);
        }

        // Lưu lại vào cache
        conversationCache.set(conversationKey, conversation);

        return conversation;
    },

    // Lấy lịch sử trò chuyện
    getConversation: (sessionId: string) => {
        const conversationKey = `conversation:${sessionId}`;
        return (conversationCache.get(conversationKey) || []) as any[];
    },

    // Lấy thông tin phim từ API
    getMovieInfo: async () => {
        try {
            const response = await axios.get('http://localhost:5000/movies');
            const movies = response.data;

            if (!movies || !Array.isArray(movies)) {
                return "Hiện không có thông tin phim.";
            }

            return movies.map(movie => `
- Tên phim: ${movie.title || "Chưa có tên"}
- Thể loại: ${movie.genre?.join(", ") || "Chưa phân loại"}
- Thời lượng: ${movie.duration || "Chưa cập nhật"} phút
- Ngày khởi chiếu: ${movie.releaseDate ? new Date(movie.releaseDate).toLocaleDateString('vi-VN') : "Chưa cập nhật"}
- Đạo diễn: ${movie.director || "Chưa cập nhật"}
- Diễn viên: ${movie.actors?.join(", ") || "Chưa cập nhật"}
- Ngôn ngữ: ${movie.language?.join(", ") || "Chưa cập nhật"}
- Độ tuổi: ${movie.ageRating || "Chưa cập nhật"}
- Trạng thái: ${movie.status || "Chưa cập nhật"}
- Đánh giá: ${movie.averageRating ? movie.averageRating.toFixed(1) + "/5" : "Chưa có đánh giá"}
- poster: ${movie.posterImage || "Chưa có poster"}
-hình: ${movie.image || "Chưa có "}
- Mô tả: ${movie.description || "Chưa có mô tả"}
-video tra

            `).join('\n');
        } catch (error) {
            console.error("Error fetching movies:", error);
            return "Không thể lấy thông tin phim do lỗi hệ thống.";
        }
    },

    getResponse: async (userMessage: string, sessionId = "default") => {
        const cacheKey = `response:${userMessage}`;
        const cachedResponse = cache.get(cacheKey);

        if (cachedResponse) {
            // Lưu tin nhắn người dùng và phản hồi vào lịch sử
            ChatbotService.saveMessage(sessionId, {
                sender: "user",
                text: userMessage,
            });
            ChatbotService.saveMessage(sessionId, {
                sender: "bot",
                text: cachedResponse,
            });
            return cachedResponse;
        }

        try {
            // Lưu tin nhắn người dùng vào lịch sử
            ChatbotService.saveMessage(sessionId, {
                sender: "user",
                text: userMessage,
            });

            // Lấy thông tin phim
            const movieInfo = await ChatbotService.getMovieInfo();

            // Lấy lịch sử trò chuyện
            const pastMessages: any[] = ChatbotService.getConversation(sessionId);

            const prompt = `
            Bạn là một chatbot thông minh của rạp chiếu phim CineJoy, được thiết kế để trả lời các câu hỏi của người dùng về phim ảnh và rạp chiếu phim một cách ngắn gọn, chính xác và chuyên nghiệp.
            
            Thông tin về rạp chiếu phim:
            - Có nhiều rạp chiếu phim hiện đại với công nghệ IMAX, 4DX
            - Giá vé dao động từ 50.000đ - 200.000đ tùy loại ghế và suất chiếu
            - Có chương trình khuyến mãi cho thành viên và các ngày lễ
            - Có thể đặt vé online qua website hoặc ứng dụng
            - Có dịch vụ combo đồ ăn và nước uống
            - Có các suất chiếu sớm và đêm muộn
            - Hỗ trợ đặt vé nhóm và tổ chức sự kiện

            Danh sách phim hiện có:
            ${movieInfo}
            
            Lịch sử hội thoại:
            ${pastMessages.length > 0
                    ? pastMessages.map(
                        (msg) => `${msg.sender === "user" ? "Người dùng" : "Chatbot"}: ${msg.text}`
                    ).join("\n")
                    : "Không có lịch sử hội thoại."
                }
        
            Câu hỏi: ${userMessage}
            
            Trả lời dưới ${PROMPT_CONFIG.MAX_RESPONSE_WORDS} từ.
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const botResponse =
                response.text() ||
                "Xin lỗi, tôi không thể trả lời ngay lúc này. Bạn có thể hỏi thêm về phim hoặc rạp chiếu phim không?";

            // Lưu phản hồi vào cache và lịch sử trò chuyện
            cache.set(cacheKey, botResponse);
            ChatbotService.saveMessage(sessionId, {
                sender: "bot",
                text: botResponse,
            });

            return botResponse;
        } catch (error) {
            console.error("Error calling Gemini API:", error);
            return "Xin lỗi, tôi không thể trả lời ngay lúc này. Bạn có thể hỏi thêm về phim hoặc rạp chiếu phim không?";
        }
    },

    // Gửi tin nhắn đến Facebook Messenger
    sendMessage: async (recipientId: string, message: string) => {
        try {
            const response = await axios.post(
                `https://graph.facebook.com/v18.0/me/messages`,
                {
                    recipient: {
                        id: recipientId
                    },
                    message: {
                        text: message
                    }
                },
                {
                    params: {
                        access_token: process.env.FACEBOOK_PAGE_ACCESS_TOKEN
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error sending message to Facebook:', error);
            throw error;
        }
    },


};

export default ChatbotService;
