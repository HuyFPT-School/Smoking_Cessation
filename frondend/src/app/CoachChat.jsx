import React, { useState, useRef, useEffect } from 'react';
import { Row, Col, Card, Avatar, Tag, Input, Button } from 'antd';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  LikeOutlined,
  PaperClipOutlined,
  SmileOutlined,
  SendOutlined,
  MessageOutlined
} from '@ant-design/icons';

const { TextArea } = Input;

const CoachChat = () => {
  const [messages, setMessages] = useState([
    {
      from: 'coach',
      text: "Hello! I'm Sarah, your smoking cessation coach. How can I help you today?",
      time: '06:05 PM',
    },
    {
      from: 'user',
      text: 'Coach Sarah is here to provide personalized support for your quit journey. Feel free to ask questions or share your challenges.',
      time: '06:06 PM',
    },
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const textAreaRef = useRef(null);

  const scrollToBottom = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  };

  useEffect(() => {
    scrollToBottom(messagesEndRef);
    if (textAreaRef.current) {
      textAreaRef.current.scrollTop = textAreaRef.current.scrollHeight;
    }
  }, [messages, input]);

  const handleSend = () => {
    if (!input.trim()) return;

    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMessage = {
      from: 'user',
      text: input,
      time,
    };

    setMessages([...messages, newMessage]);
    setInput('');
    

    // Giả lập coach trả lời 
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          from: 'coach',
          text: 'Thanks for sharing. Let’s talk more about that.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 1000);
  };

  return (
    <div
      className="chat-container"
      style={{
        padding: '24px',
        flex: 1,
        overflow: 'auto',
        minHeight: 0, // Tránh tràn nếu trong flex
        scrollbarWidth: 'none',         // Firefox
        msOverflowStyle: 'none',        // IE/Edge
      }}
    >
      <h1 className="chat-title">Chat with Your Coach</h1>

      <Row gutter={24} className="chat-layout">
        {/* LEFT COLUMN */}
        <Col xs={24} sm={24} md={8} className="coach-profile-col">
          <Card className="coach-profile-card">
            <div className="coach-header" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Avatar size={64}>S</Avatar>
              <div className="coach-info">
                <h2 style={{ marginBottom: 0 }}>Sarah Chen</h2>
                <p style={{ color: '#888' }}>Smoking Cessation Coach</p>
              </div>
            </div>

            <div style={{ marginTop: '16px' }}>
              <Tag color="green" style={{ borderRadius: '16px', fontWeight: 'bold', color: '#000' }}>
                Certified Coach
              </Tag>
              <Tag color="blue" style={{ borderRadius: '16px', fontWeight: 'bold', color: '#000' }}>
                5+ Years Experience
              </Tag>
              <Tag color="purple" style={{ borderRadius: '16px', fontWeight: 'bold', color: '#000' }}>
                Behavioral Therapy
              </Tag>
            </div>



            <p style={{ marginTop: '16px' }}>
              Sarah helps people overcome nicotine addiction through personalized support and evidence-based strategies.
            </p>

            <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
              <li><CalendarOutlined style={{ color: 'green' }} /> Available Monday–Friday</li>
              <li><ClockCircleOutlined style={{ color: 'green' }} /> 9:00 AM – 5:00 PM EST</li>
              <li><LikeOutlined style={{ color: 'green' }} /> 98% Positive Feedback</li>
              <li><MessageOutlined style={{ color: 'green' }} /> Response time: ~2 hours</li>
            </ul>

          </Card>
        </Col>

        {/* RIGHT COLUMN */}
        <Col xs={24} sm={24} md={16} className="chat-box-col">
          <Card title="Chat with Coach Sarah" className="chat-box-card" >
            <div className="chat-messages">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    justifyContent: msg.from === 'user' ? 'flex-end' : 'flex-start',
                    alignItems: 'flex-start',
                    marginBottom: '12px',
                    gap: '8px',
                  }}
                >
                  {msg.from === 'coach' && (
                    <Avatar size={32}>S</Avatar>
                  )}
                  <div
                    style={{
                      background: msg.from === 'user' ? '#1890ff' : '#f1f1f1',
                      color: msg.from === 'user' ? 'white' : 'black',
                      padding: '8px 12px',
                      borderRadius: '16px',
                      maxWidth: '70%',
                      wordBreak: 'break-word',
                    }}
                  >
                    {msg.text}
                    <div
                      style={{
                        fontSize: '12px',
                        color: msg.from === 'user' ? '#d9e8ff' : '#999',
                        marginTop: '4px',
                        textAlign: msg.from === 'user' ? 'right' : 'left',
                      }}
                    >
                      {msg.time}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="chat-input" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                className="chat-textarea"
                style={{ flex: 1, margin: 0 }}
              />
              <Button icon={<PaperClipOutlined />} />
              <Button icon={<SmileOutlined />} />
              <Button type="primary" icon={<SendOutlined />} onClick={handleSend} />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CoachChat;