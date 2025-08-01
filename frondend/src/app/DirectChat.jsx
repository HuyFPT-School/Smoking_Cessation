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
  Modal,
  Badge,
  Divider,
} from "antd";
import {
  SendOutlined,
  MessageOutlined,
  UserOutlined,
  CommentOutlined,
} from "@ant-design/icons";
import WebSocketService from "../services/WebSocketService";
import { directChatAPI } from "../services/directChatAPI";

const { TextArea } = Input;
const { Title, Text } = Typography;

const DirectChat = () => {
  const [chatRooms, setChatRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [availableCoaches, setAvailableCoaches] = useState([]);
  const [showCoachModal, setShowCoachModal] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const messagesEndRef = useRef(null);
  const textAreaRef = useRef(null);

  // Get current user
  const userStr = localStorage.getItem("user");
  const userObj = userStr ? JSON.parse(userStr) : null;
  const currentUser = userObj || { id: null, role: "USER" };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Initialize WebSocket connection
  useEffect(() => {
    const initialize = async () => {
      if (currentUser.id) {
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
          // Chỉ hiển thị error nếu không phải lỗi HTTPS WebSocket disable
          if (!error.message.includes("WebSocket not available")) {
            message.error("Failed to connect to chat service");
          } else {
            console.warn(
              "WebSocket disabled on HTTPS - chat will work without real-time updates"
            );
          }
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
    } catch (error) {
      console.error("Error loading chat rooms:", error);
      message.error("Failed to load chat rooms");
    } finally {
      setIsLoadingRooms(false);
    }
  };

  const loadAvailableCoaches = async () => {
    try {
      const coaches = await directChatAPI.getAvailableCoaches();
      setAvailableCoaches(coaches);
    } catch (error) {
      console.error("Error loading coaches:", error);
      message.error("Failed to load available coaches");
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

  const startChatWithCoach = async (coach) => {
    try {
      const room = await directChatAPI.createOrGetChatRoom(
        currentUser.id,
        coach.id
      );
      setShowCoachModal(false);
      await loadChatRooms();
      await selectRoom(room);
    } catch (error) {
      console.error("Error starting chat with coach:", error);
      message.error("Failed to start chat with coach");
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

  const openCoachModal = async () => {
    await loadAvailableCoaches();
    setShowCoachModal(true);
  };

  return (
    <div style={{ height: "100vh", display: "flex", background: "#f5f5f5" }}>
      {/* Chat Rooms Sidebar */}
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
            padding: "20px",
            borderBottom: "1px solid #e8e8e8",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Title level={4} style={{ margin: 0 }}>
            <MessageOutlined style={{ marginRight: "8px", color: "#22C55E" }} />
            Direct Chat
          </Title>
          <Button
            type="primary"
            icon={<CommentOutlined />}
            onClick={openCoachModal}
            style={{ background: "#22C55E", borderColor: "#22C55E" }}
          >
            New Chat
          </Button>
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
              <CommentOutlined
                style={{
                  fontSize: "48px",
                  color: "#ccc",
                  marginBottom: "16px",
                }}
              />
              <div>No chat rooms yet</div>
              <div style={{ fontSize: "14px", marginTop: "8px" }}>
                Start a conversation with a coach
              </div>
            </div>
          ) : (
            <List
              dataSource={chatRooms}
              renderItem={(room) => {
                const isCurrentUserMember = room.memberId === currentUser.id;
                const otherUser = isCurrentUserMember
                  ? {
                      name: room.coachName,
                      avatarUrl: room.coachAvatarUrl,
                      role: "COACH",
                    }
                  : {
                      name: room.memberName,
                      avatarUrl: room.memberAvatarUrl,
                      role: "MEMBER",
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
                          src={otherUser.avatarUrl}
                          icon={<UserOutlined />}
                          style={{
                            background:
                              otherUser.role === "COACH"
                                ? "#22C55E"
                                : "#1890ff",
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
                          {otherUser.name}
                          {otherUser.role === "COACH" && (
                            <span
                              style={{
                                background: "#22C55E",
                                color: "white",
                                padding: "2px 6px",
                                borderRadius: "10px",
                                fontSize: "10px",
                                fontWeight: "500",
                              }}
                            >
                              COACH
                            </span>
                          )}
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
                Select a chat room to start messaging
              </Title>
              <Text type="secondary">
                Choose a conversation from the sidebar or start a new one
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
                src={
                  activeRoom.memberId === currentUser.id
                    ? activeRoom.coachAvatarUrl
                    : activeRoom.memberAvatarUrl
                }
                icon={<UserOutlined />}
                style={{
                  background:
                    activeRoom.memberId === currentUser.id
                      ? "#22C55E"
                      : "#1890ff",
                }}
              />
              <div>
                <div style={{ fontWeight: "600", fontSize: "16px" }}>
                  {activeRoom.memberId === currentUser.id
                    ? activeRoom.coachName
                    : activeRoom.memberName}
                </div>
                <div style={{ color: "#666", fontSize: "12px" }}>
                  {activeRoom.memberId === currentUser.id ? "Coach" : "Member"}{" "}
                  • Online
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
                            style={{
                              background:
                                msg.senderRole === "COACH"
                                  ? "#22C55E"
                                  : "#1890ff",
                            }}
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
                              {msg.senderName}{" "}
                              {msg.senderRole === "COACH" && "🌟"}
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
                            style={{ background: "#1890ff" }}
                          />
                        )}
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
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
                  placeholder="Type your message..."
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

      {/* Coach Selection Modal */}
      <Modal
        title="Select a Coach to Chat With"
        open={showCoachModal}
        onCancel={() => setShowCoachModal(false)}
        footer={null}
        width={500}
      >
        <List
          dataSource={availableCoaches}
          renderItem={(coach) => (
            <List.Item
              style={{ cursor: "pointer", padding: "12px" }}
              onClick={() => startChatWithCoach(coach)}
            >
              <List.Item.Meta
                avatar={
                  <Avatar
                    size={48}
                    src={coach.avatarUrl}
                    icon={<UserOutlined />}
                    style={{ background: "#22C55E" }}
                  />
                }
                title={
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    {coach.name}
                    <span
                      style={{
                        background: "#22C55E",
                        color: "white",
                        padding: "2px 8px",
                        borderRadius: "12px",
                        fontSize: "10px",
                        fontWeight: "500",
                      }}
                    >
                      COACH
                    </span>
                  </div>
                }
                description="Smoking Cessation Specialist • Available for chat"
              />
            </List.Item>
          )}
        />
      </Modal>
    </div>
  );
};

export default DirectChat;
