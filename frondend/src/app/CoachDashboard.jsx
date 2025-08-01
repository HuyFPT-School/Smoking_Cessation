import React, { useState, useRef, useEffect } from "react";
import {
  Avatar,
  Input,
  Button,
  Spin,
  List,
  Card,
  Typography,
  message,
  Badge,
  Tabs,
  Row,
  Col,
  Statistic,
} from "antd";
import {
  SendOutlined,
  MessageOutlined,
  UserOutlined,
  TeamOutlined,
  CommentOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import WebSocketService from "../services/WebSocketService";
import { directChatAPI } from "../services/directChatAPI";

const { TextArea } = Input;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

const CoachDashboard = () => {
  const [chatRooms, setChatRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [stats, setStats] = useState({
    totalChats: 0,
    activeChats: 0,
    unreadMessages: 0,
  });
  const messagesEndRef = useRef(null);
  const textAreaRef = useRef(null);

  // Get current user (coach)
  const userStr = localStorage.getItem("user");
  const userObj = userStr ? JSON.parse(userStr) : null;
  const currentUser = userObj || { id: null, role: "COACH" };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Initialize WebSocket connection
  useEffect(() => {
    const initialize = async () => {
      if (currentUser.id && currentUser.role === "COACH") {
        await initializeWebSocket();
        await loadChatRooms();
      }
    };

    initialize();

    return () => {
      WebSocketService.disconnect();
    };
  }, [currentUser.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const initializeWebSocket = async () => {
    setIsConnecting(true);
    try {
      await WebSocketService.connect(
        () => {
          console.log("WebSocket connected successfully");
          // Subscribe to user notifications
          WebSocketService.subscribeToUserNotifications(
            currentUser.id,
            (notification) => {
              console.log("Received notification:", notification);
              // Update chat rooms to show new message count
              loadChatRooms();
            }
          );
          setIsConnecting(false);
        },
        (error) => {
          console.error("WebSocket connection failed:", error);
          message.error("Failed to connect to chat service");
          setIsConnecting(false);
        }
      );
    } catch (error) {
      console.error("WebSocket initialization failed:", error);
      setIsConnecting(false);
    }
  };

  const loadChatRooms = async () => {
    if (!currentUser.id) return;

    setIsLoadingRooms(true);
    try {
      const rooms = await directChatAPI.getUserChatRooms(currentUser.id);
      setChatRooms(rooms);

      // Calculate stats
      const totalUnread = rooms.reduce(
        (sum, room) => sum + room.unreadCount,
        0
      );
      setStats({
        totalChats: rooms.length,
        activeChats: rooms.filter((room) => room.isActive).length,
        unreadMessages: totalUnread,
      });
    } catch (error) {
      console.error("Error loading chat rooms:", error);
      message.error("Failed to load chat rooms");
    } finally {
      setIsLoadingRooms(false);
    }
  };

  const selectRoom = async (room) => {
    setActiveRoom(room);
    setIsLoadingMessages(true);

    try {
      // Unsubscribe from previous room
      if (activeRoom) {
        WebSocketService.unsubscribeFromRoom(activeRoom.roomId);
      }

      // Subscribe to new room
      WebSocketService.subscribeToRoom(room.roomId, (newMessage) => {
        setMessages((prev) => [...prev, newMessage]);
        scrollToBottom();
      });

      // Load messages
      const roomMessages = await directChatAPI.getRoomMessages(room.roomId);
      setMessages(roomMessages);

      // Mark messages as read
      await directChatAPI.markMessagesAsRead(room.roomId, currentUser.id);
      WebSocketService.markAsRead(room.roomId, currentUser.id);

      // Update room unread count
      setChatRooms((prev) =>
        prev.map((r) =>
          r.roomId === room.roomId ? { ...r, unreadCount: 0 } : r
        )
      );
    } catch (error) {
      console.error("Error selecting room:", error);
      message.error("Failed to load chat room");
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading || !activeRoom) return;

    const messageData = {
      roomId: activeRoom.roomId,
      senderId: currentUser.id,
      receiverId:
        activeRoom.memberId === currentUser.id
          ? activeRoom.coachId
          : activeRoom.memberId,
      content: input.trim(),
      messageType: "TEXT",
      timestamp: new Date().toISOString(),
    };

    setInput("");
    setIsLoading(true);

    try {
      WebSocketService.sendMessage(messageData);
    } catch (error) {
      console.error("Error sending message:", error);
      message.error("Failed to send message");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Quick reply templates for coaches
  const quickReplies = [
    "How are you feeling today?",
    "That's great progress! Keep it up! 💪",
    "Remember, every day without smoking is a victory! 🏆",
    "What triggers are you experiencing?",
    "Let's work on a coping strategy together.",
    "You're doing amazing! I'm proud of your commitment! 🌟",
  ];

  const insertQuickReply = (reply) => {
    setInput(reply);
    textAreaRef.current?.focus();
  };

  if (currentUser.role !== "COACH") {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f5f5f5",
        }}
      >
        <Card style={{ textAlign: "center" }}>
          <Title level={3}>Access Denied</Title>
          <Text type="secondary">
            This dashboard is only available for coaches.
          </Text>
        </Card>
      </div>
    );
  }

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#f5f5f5",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "white",
          padding: "16px 24px",
          borderBottom: "1px solid #e8e8e8",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <Row align="middle" justify="space-between">
          <Col>
            <Title level={3} style={{ margin: 0, color: "#22C55E" }}>
              <TeamOutlined style={{ marginRight: "8px" }} />
              Coach Dashboard
            </Title>
            <Text type="secondary">Manage your client conversations</Text>
          </Col>
          <Col>
            <Row gutter={24}>
              <Col>
                <Statistic
                  title="Total Conversations"
                  value={stats.totalChats}
                  prefix={<MessageOutlined />}
                />
              </Col>
              <Col>
                <Statistic
                  title="Active Chats"
                  value={stats.activeChats}
                  prefix={<CommentOutlined />}
                />
              </Col>
              <Col>
                <Statistic
                  title="Unread Messages"
                  value={stats.unreadMessages}
                  prefix={
                    <Badge dot={stats.unreadMessages > 0}>
                      <MessageOutlined />
                    </Badge>
                  }
                  valueStyle={{
                    color: stats.unreadMessages > 0 ? "#ff4d4f" : undefined,
                  }}
                />
              </Col>
            </Row>
          </Col>
        </Row>
      </div>

      <div style={{ flex: 1, display: "flex" }}>
        {/* Client List Sidebar */}
        <div
          style={{
            width: "350px",
            background: "white",
            borderRight: "1px solid #e8e8e8",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid #e8e8e8",
              background: "#fafafa",
            }}
          >
            <Title level={5} style={{ margin: 0 }}>
              <UserOutlined style={{ marginRight: "8px", color: "#22C55E" }} />
              Client Conversations
            </Title>
          </div>

          <div style={{ flex: 1, overflowY: "auto" }}>
            {isLoadingRooms ? (
              <div style={{ padding: "20px", textAlign: "center" }}>
                <Spin size="large" />
              </div>
            ) : chatRooms.length === 0 ? (
              <div
                style={{ padding: "20px", textAlign: "center", color: "#666" }}
              >
                <UserOutlined
                  style={{
                    fontSize: "48px",
                    color: "#ccc",
                    marginBottom: "16px",
                  }}
                />
                <div>No client conversations yet</div>
                <div style={{ fontSize: "14px", marginTop: "8px" }}>
                  Conversations will appear here when clients reach out
                </div>
              </div>
            ) : (
              <List
                dataSource={chatRooms}
                renderItem={(room) => {
                  const client = {
                    name: room.memberName,
                    avatarUrl: room.memberAvatarUrl,
                  };

                  return (
                    <List.Item
                      style={{
                        padding: "16px 20px",
                        cursor: "pointer",
                        background:
                          activeRoom?.roomId === room.roomId
                            ? "#f0f9ff"
                            : "white",
                        borderLeft:
                          activeRoom?.roomId === room.roomId
                            ? "4px solid #22C55E"
                            : "4px solid transparent",
                      }}
                      onClick={() => selectRoom(room)}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          width: "100%",
                        }}
                      >
                        <Badge count={room.unreadCount} size="small">
                          <Avatar
                            size={48}
                            src={client.avatarUrl}
                            icon={<UserOutlined />}
                            style={{
                              background: "#1890ff",
                              marginRight: "12px",
                            }}
                          />
                        </Badge>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontWeight: "600",
                              marginBottom: "4px",
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            {client.name}
                            <span
                              style={{
                                background: "#1890ff",
                                color: "white",
                                padding: "2px 6px",
                                borderRadius: "10px",
                                fontSize: "10px",
                                fontWeight: "500",
                              }}
                            >
                              CLIENT
                            </span>
                          </div>
                          {room.lastMessage && (
                            <div
                              style={{
                                color: "#666",
                                fontSize: "13px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {room.lastMessage}
                            </div>
                          )}
                          {room.lastMessageTime && (
                            <div
                              style={{
                                color: "#999",
                                fontSize: "11px",
                                marginTop: "2px",
                              }}
                            >
                              {room.lastMessageTime}
                            </div>
                          )}
                        </div>
                      </div>
                    </List.Item>
                  );
                }}
              />
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {!activeRoom ? (
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "white",
              }}
            >
              <div style={{ textAlign: "center", color: "#666" }}>
                <MessageOutlined
                  style={{
                    fontSize: "64px",
                    color: "#ccc",
                    marginBottom: "16px",
                  }}
                />
                <Title level={3} style={{ color: "#999" }}>
                  Select a client conversation
                </Title>
                <Text type="secondary">
                  Choose a conversation from the sidebar to start coaching
                </Text>
              </div>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div
                style={{
                  background: "white",
                  padding: "16px 24px",
                  borderBottom: "1px solid #e8e8e8",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                {isConnecting && <Spin size="small" />}
                <Avatar
                  size={40}
                  src={activeRoom.memberAvatarUrl}
                  icon={<UserOutlined />}
                  style={{ background: "#1890ff" }}
                />
                <div>
                  <div style={{ fontWeight: "600", fontSize: "16px" }}>
                    {activeRoom.memberName}
                  </div>
                  <div style={{ color: "#666", fontSize: "12px" }}>
                    Client • Seeking smoking cessation support
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "20px",
                  background: "#f8f9fa",
                }}
              >
                {isLoadingMessages ? (
                  <div style={{ textAlign: "center", padding: "40px" }}>
                    <Spin size="large" />
                    <div style={{ marginTop: "16px", color: "#666" }}>
                      Loading messages...
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((msg, index) => {
                      const isOwnMessage = msg.senderId === currentUser.id;
                      return (
                        <div
                          key={index}
                          style={{
                            display: "flex",
                            justifyContent: isOwnMessage
                              ? "flex-end"
                              : "flex-start",
                            alignItems: "flex-start",
                            marginBottom: "16px",
                            gap: "8px",
                          }}
                        >
                          {!isOwnMessage && (
                            <Avatar
                              size={32}
                              src={msg.senderAvatarUrl}
                              icon={<UserOutlined />}
                              style={{ background: "#1890ff" }}
                            />
                          )}
                          <div
                            style={{
                              background: isOwnMessage ? "#22C55E" : "white",
                              color: isOwnMessage ? "white" : "#333",
                              padding: "12px 16px",
                              borderRadius: isOwnMessage
                                ? "18px 18px 4px 18px"
                                : "18px 18px 18px 4px",
                              maxWidth: "70%",
                              wordBreak: "break-word",
                              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                            }}
                          >
                            {!isOwnMessage && (
                              <div
                                style={{
                                  fontSize: "11px",
                                  color: "#666",
                                  marginBottom: "4px",
                                  fontWeight: "500",
                                }}
                              >
                                {msg.senderName}
                              </div>
                            )}
                            <div>{msg.content}</div>
                            <div
                              style={{
                                fontSize: "10px",
                                color: isOwnMessage
                                  ? "rgba(255,255,255,0.8)"
                                  : "#999",
                                marginTop: "4px",
                                textAlign: isOwnMessage ? "right" : "left",
                              }}
                            >
                              {new Date(msg.timestamp).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>
                          {isOwnMessage && (
                            <Avatar
                              size={32}
                              src={currentUser.avatarUrl}
                              icon={<UserOutlined />}
                              style={{ background: "#22C55E" }}
                            />
                          )}
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Quick Replies */}
              <div
                style={{
                  background: "white",
                  padding: "12px 24px",
                  borderTop: "1px solid #e8e8e8",
                }}
              >
                <Title
                  level={5}
                  style={{
                    margin: "0 0 8px 0",
                    fontSize: "12px",
                    color: "#666",
                  }}
                >
                  Quick Replies:
                </Title>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {quickReplies.map((reply, index) => (
                    <Button
                      key={index}
                      size="small"
                      onClick={() => insertQuickReply(reply)}
                      style={{
                        background: "rgba(34, 197, 94, 0.1)",
                        border: "1px solid rgba(34, 197, 94, 0.3)",
                        color: "#22C55E",
                        borderRadius: "16px",
                        fontSize: "11px",
                      }}
                    >
                      {reply}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Input Area */}
              <div
                style={{
                  background: "white",
                  padding: "16px 24px",
                  borderTop: "1px solid #e8e8e8",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-end",
                    gap: "12px",
                    background: "#f8f9fa",
                    padding: "8px",
                    borderRadius: "20px",
                    border: "1px solid #e8e8e8",
                  }}
                >
                  <TextArea
                    ref={textAreaRef}
                    placeholder="Type your response to help your client..."
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
                      background: "#22C55E",
                      borderColor: "#22C55E",
                      borderRadius: "16px",
                      height: "36px",
                      paddingLeft: "16px",
                      paddingRight: "16px",
                    }}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoachDashboard;
