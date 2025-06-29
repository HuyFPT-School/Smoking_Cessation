import React, { useState, useRef, useEffect } from "react";
import { Avatar, Input, Button, Spin } from "antd";
import { SendOutlined } from "@ant-design/icons";
import axios from "axios";

const { TextArea } = Input;

const CoachChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const messagesEndRef = useRef(null);
  const textAreaRef = useRef(null);

  // Temporary user ID - in real app, get from authentication context
  const userStr = localStorage.getItem("user");

  // Parse chuỗi JSON thành object, nếu không có thì null
  const userObj = userStr ? JSON.parse(userStr) : null;

  // Lấy userId từ object user nếu tồn tại, nếu không thì null
  const userId = userObj ? userObj.id : null;

  const scrollToBottom = (ref) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  };

  // ✅ THÊM: Function để load lịch sử chat
  const loadChatHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const response = await axios.get(
        `http://localhost:8080/api/ai-coach/conversation/${userId}`,
        { timeout: 10000 }
      );

      const history = response.data;

      if (history && history.length > 0) {
        // Convert backend format to frontend format
        const formattedMessages = history.map((msg) => ({
          from: msg.senderType === "USER" ? "user" : "coach",
          text: msg.message,
          time: new Date(msg.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        }));

        setMessages(formattedMessages);
      } else {
        // Nếu không có lịch sử, hiển thị tin nhắn chào mặc định
        setMessages([
          {
            from: "coach",
            text: "Hello! I'm Sarah Chen - a smoking cessation specialist with 15 years of clinical experience. I've helped over 5,000 people quit smoking successfully! 🌟 How can I support you today in your quit smoking journey? 💪😊",
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ]);
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
      // Fallback với tin nhắn chào mặc định
      setMessages([
        {
          from: "coach",
          text: "Hello! I'm Sarah Chen - a smoking cessation specialist with 15 years of clinical experience. I've helped over 5,000 people quit smoking successfully! 🌟 How can I support you today in your quit smoking journey? 💪😊",
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // ✅ THÊM: Load lịch sử khi component mount
  useEffect(() => {
    loadChatHistory();
  }, [userId]);

  useEffect(() => {
    scrollToBottom(messagesEndRef);
    if (textAreaRef.current) {
      textAreaRef.current.scrollTop = textAreaRef.current.scrollHeight;
    }
  }, [messages, input]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const now = new Date();
    const time = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    // Add user message to chat
    const newMessage = {
      from: "user",
      text: input,
      time,
    };

    setMessages((prev) => [...prev, newMessage]);
    const userMessage = input;
    setInput("");
    setIsLoading(true);
    try {
      // ✅ CHUYỂN: Từ fetch sang axios
      const response = await axios.post(
        "http://localhost:8080/api/ai-coach/chat",
        {
          userId: userId,
          message: userMessage,
        },
        {
          timeout: 30000, // 30 seconds timeout
        }
      );

      // ✅ SỬA: Axios tự động parse JSON, không cần .json()
      const data = response.data;

      // ✅ THÊM: Kiểm tra response data
      if (!data || !data.response) {
        throw new Error("Empty response from server");
      }

      // Add AI response to chat with a slight delay for natural feel
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            from: "coach",
            text: data.response,
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ]);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error calling AI API:", error);

      // ✅ CẢI THIỆN: Axios error handling tốt hơn
      let fallbackMessage =
        "Sorry, I'm experiencing technical difficulties. But I believe you can overcome this challenge! 💪";

      if (error.code === "ECONNABORTED") {
        fallbackMessage = "Request timeout. Please try again later! ⏰";
      } else if (error.response?.status === 500) {
        fallbackMessage =
          "The server is experiencing issues. I will get back to assist you later! ⏰";
      } else if (
        error.response?.status >= 400 &&
        error.response?.status < 500
      ) {
        fallbackMessage = "An error occurred. Please try asking in a different way! 🤔";
      } else if (!error.response) {
        fallbackMessage =
          "Unable to connect to the server. Please check your network connection! 🔄";
      } else if (error.message.includes("Empty response")) {
        fallbackMessage =
          "I'm thinking... Please try asking in a different way! 🤔";
      }

      // Fallback response
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            from: "coach",
            text: fallbackMessage,
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ]);
        setIsLoading(false);
      }, 1000);
    }
  };
  return (
    <div
      className="chat-container"
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          flex: 1,
          background: "rgba(255, 255, 255, 0.95)",
          borderRadius: "20px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
          overflow: "hidden",
          backdropFilter: "blur(10px)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: " #22C55E",
            color: "white",
            padding: "20px 30px",
            display: "flex",
            alignItems: "center",
            gap: "15px",
          }}
        >
          <Avatar
            size={50}
            style={{
              background: "rgba(255,255,255,0.2)",
              border: "2px solid rgba(255,255,255,0.3)",
              fontSize: "20px",
              fontWeight: "bold",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 25 20"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
              <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
            </svg>
          </Avatar>
          <div>
            <h1 style={{ margin: 0, fontSize: "24px", fontWeight: "600" }}>
              AI Coach Sarah
            </h1>
            <p style={{ margin: 0, opacity: 0.9, fontSize: "14px" }}>
              Smoking Cessation Specialist • Online • Always ready to help
            </p>
          </div>
        </div>{" "}
        {/* Chat Messages Area */}
        <div
          style={{
            flex: 1,
            padding: "20px 30px",
            overflowY: "auto",
            background: "#f8f9fa",
            scrollbarWidth: "thin",
            scrollbarColor: "#ddd transparent",
          }}
        >
          {isLoadingHistory ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "200px",
                flexDirection: "column",
                gap: "15px",
              }}
            >
              <Spin size="large" />
              <span style={{ color: "#666", fontSize: "16px" }}>
                Loading chat history...
              </span>
            </div>
          ) : (
            <>
              {messages.map((msg, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    justifyContent:
                      msg.from === "user" ? "flex-end" : "flex-start",
                    alignItems: "flex-start",
                    marginBottom: "20px",
                    gap: "12px",
                  }}
                >
                  {msg.from === "coach" && (
                    <Avatar
                      size={36}
                      style={{
                        background: " #22C55E",
                        border: "2px solid white",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        fontSize: "16px",
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 20"
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                        <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
                      </svg>
                    </Avatar>
                  )}
                  <div
                    style={{
                      background: msg.from === "user" ? " #22C55E" : "white",
                      color: msg.from === "user" ? "white" : "#333",
                      padding: "15px 20px",
                      borderRadius:
                        msg.from === "user"
                          ? "20px 20px 5px 20px"
                          : "20px 20px 20px 5px",
                      maxWidth: "70%",
                      wordBreak: "break-word",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      border:
                        msg.from === "coach" ? "1px solid #e8e8e8" : "none",
                      fontSize: "15px",
                      lineHeight: "1.5",
                    }}
                  >
                    {msg.text}
                    <div
                      style={{
                        fontSize: "11px",
                        color:
                          msg.from === "user"
                            ? "rgba(255,255,255,0.8)"
                            : "#999",
                        marginTop: "8px",
                        textAlign: msg.from === "user" ? "right" : "left",
                      }}
                    >
                      {msg.time}
                    </div>
                  </div>
                  {msg.from === "user" && (
                    <Avatar
                      size={36}
                      style={{
                        background: "#52c41a",
                        border: "2px solid white",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        fontSize: "16px",
                      }}
                    >
                      👤
                    </Avatar>
                  )}
                </div>
              ))}

              {isLoading && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "20px",
                  }}
                >
                  <Avatar
                    size={36}
                    style={{
                      background: " #22C55E",
                      border: "2px solid white",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 20"
                      fill="none"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
                    </svg>
                  </Avatar>
                  <div
                    style={{
                      background: "white",
                      padding: "15px 20px",
                      borderRadius: "20px 20px 20px 5px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      border: "1px solid #e8e8e8",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <Spin size="small" />
                    <span style={{ color: "#666", fontSize: "14px" }}>
                      Sarah is typing...
                    </span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
        {/* Input Area */}
        <div
          style={{
            padding: "20px 30px",
            background: "white",
            borderTop: "1px solid #e8e8e8",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: "15px",
              background: "#f8f9fa",
              padding: "10px",
              borderRadius: "25px",
              border: "2px solid #e8e8e8",
              transition: "border-color 0.3s ease",
            }}
          >
            <TextArea
              ref={textAreaRef}
              placeholder="Enter your message... 💬"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onPressEnter={(e) => {
                if (!e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              style={{
                flex: 1,
                border: "none",
                background: "transparent",
                resize: "none",
                fontSize: "15px",
                boxShadow: "none",
              }}
              rows={1}
              maxLength={500}
              autoSize={{ minRows: 1, maxRows: 4 }}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              loading={isLoading}
              style={{
                background: " #22C55E",
                border: "none",
                borderRadius: "20px",
                height: "40px",
                paddingLeft: "20px",
                paddingRight: "20px",
                fontSize: "14px",
                fontWeight: "500",
                boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)",
              }}
            >
              Send
            </Button>
          </div>

          {/* Quick Actions */}
          <div
            style={{
              display: "flex",
              gap: "10px",
              marginTop: "15px",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={() => setInput("I want to start quitting smoking")}
              style={{
                background: "rgba(102, 126, 234, 0.1)",
                border: "1px solid rgba(102, 126, 234, 0.3)",
                borderRadius: "20px",
                padding: "8px 16px",
                fontSize: "13px",
                color: "#667eea",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
            >
              🚭 Start quitting
            </button>
            <button
              onClick={() =>
                setInput("I'm having trouble quitting smoking")
              }
              style={{
                background: "rgba(102, 126, 234, 0.1)",
                border: "1px solid rgba(102, 126, 234, 0.3)",
                borderRadius: "20px",
                padding: "8px 16px",
                fontSize: "13px",
                color: "#667eea",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
            >
              💪 Need encouragement
            </button>
            <button
              onClick={() => setInput("Give me health advice")}
              style={{
                background: "rgba(102, 126, 234, 0.1)",
                border: "1px solid rgba(102, 126, 234, 0.3)",
                borderRadius: "20px",
                padding: "8px 16px",
                fontSize: "13px",
                color: "#667eea",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
            >
              🏥 Give me health advice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoachChat;
