import React, { useState } from "react";
import { Input, Button, Card, Avatar, Tag } from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  MessageOutlined,
  TeamOutlined,
  UserOutlined,
  TrophyOutlined,
  LikeOutlined,
  FlagOutlined,
} from "@ant-design/icons";
import "../index.css";

const { TextArea } = Input;

// DiscussionItem Component
const DiscussionItem = ({
  author,
  avatarUrl,
  status,
  title,
  content,
  tags,
  likes,
  comments,
  time,
}) => {
  const initials = author
    .split(" ")
    .map((name) => name[0])
    .join("")
    .toUpperCase();

  return (
    <Card className="discussion-item-card" bodyStyle={{ padding: 20 }}>
      <div className="discussion-item-header">
        <div className="discussion-item-author">
          <Avatar src={avatarUrl} className="discussion-item-avatar">
            {!avatarUrl && initials}
          </Avatar>
          <div>
            <div className="discussion-item-author-name">{author}</div>
            <div className="discussion-item-status">{status}</div>
          </div>
        </div>
        <div className="discussion-item-meta">
          <div>{time}</div>
          <div className="discussion-item-report">
            <FlagOutlined />
            Report
          </div>
        </div>
      </div>
      <div className="discussion-item-title">{title}</div>
      <div className="discussion-item-content">{content}</div>
      <div className="discussion-item-tags">
        {tags.map((tag) => (
          <Tag key={tag} color="green" className="discussion-item-tag">
            {tag}
          </Tag>
        ))}
      </div>
      <div className="discussion-item-footer">
        <div className="discussion-item-stats">
          <span>
            <LikeOutlined className="discussion-item-icon" />
            {likes}
          </span>
          <span>
            <MessageOutlined className="discussion-item-icon" />
            {comments}
          </span>
        </div>
      </div>
    </Card>
  );
};

// SupportGroupItem Component
const SupportGroupItem = ({ name, avatarUrl, description, members, posts }) => {
  return (
    <Card className="support-group-item-card" bodyStyle={{ padding: 20 }}>
      <div className="support-group-item-content">
        <div className="support-group-item-header">
          <Avatar
            src={avatarUrl}
            shape="square"
            size={48}
            className="support-group-item-avatar"
          />
          <div>
            <div className="support-group-item-name">{name}</div>
            <div className="support-group-item-description">{description}</div>
          </div>
        </div>
        <div className="support-group-item-stats">
          <div>
            <b>{members}</b> Members
          </div>
          <div>
            <b>{posts}</b> Posts this week
          </div>
        </div>
      </div>
      <Button type="primary" block className="support-group-item-button">
        Join Group
      </Button>
    </Card>
  );
};

// StartSupportGroup Component
const StartSupportGroup = () => {
  return (
    <Card
      title="Start Your Own Support Group"
      className="start-support-group-card"
      headStyle={{ fontWeight: 600, fontSize: 16 }}
      bodyStyle={{ paddingTop: 16, paddingBottom: 16 }}
    >
      <p className="start-support-group-text">
        Create a dedicated group for people with similar experiences or
        challenges on their quitting journey.
      </p>
      <Button type="primary" className="start-support-group-button">
        Create Group
      </Button>
    </Card>
  );
};

// SupportGroups Component
const SupportGroups = () => {
  const groups = [
    {
      name: "Newcomer Circle",
      avatarUrl:
        "https://anhanime.me/wp-content/uploads/2024/03/anh-goku_14.jpeg",
      description: "For people in their first month of quitting",
      members: 342,
      posts: 56,
    },
    {
      name: "Parents Quitting Together",
      avatarUrl:
        "https://anhanime.me/wp-content/uploads/2024/03/anh-goku_13.jpg",
      description: "Support for parents quitting while raising kids",
      members: 189,
      posts: 34,
    },
    {
      name: "Long-Term Success",
      avatarUrl:
        "https://anhanime.me/wp-content/uploads/2024/03/anh-goku_25.jpeg",
      description: "For those smoke-free for 6+ months",
      members: 276,
      posts: 42,
    },
  ];

  return (
    <>
      <div className="support-groups-list">
        {groups.map((group, index) => (
          <div key={index} className="support-group-item-wrapper">
            <SupportGroupItem {...group} />
          </div>
        ))}
      </div>
      <StartSupportGroup />
    </>
  );
};

// CommunityHeader Component
const CommunityHeader = () => {
  return (
    <div className="community-header">
      <h1 className="community-header-title">Community</h1>
      <p className="community-header-description">
        Connect with others on their smoke-free journey, share experiences, and
        find support
      </p>
    </div>
  );
};

// ShareAndStats Component
const ShareAndStats = () => {
  return (
    <div className="share-and-stats">
      <div className="share-block">
        <Card
          title={
            <div>
              <div className="share-block-title">Share Your Thoughts</div>
              <div className="share-block-description">
                Ask a question, share a victory, or seek support from the
                community
              </div>
            </div>
          }
          className="share-block-card"
          headStyle={{ borderBottom: "none", padding: "10px 20px 4px" }}
          bodyStyle={{ padding: "4px 20px 10px" }}
        >
          <TextArea
            placeholder="What's on your mind?"
            rows={4}
            className="share-block-textarea"
          />
          <div className="share-block-button-container">
            <Button type="primary" className="share-block-button">
              Post
            </Button>
          </div>
        </Card>
      </div>
      <div className="stats-block">
        <Card
          title={<div className="stats-block-title">Community Stats</div>}
          className="stats-block-card"
          headStyle={{ borderBottom: "none", padding: "10px 20px 4px" }}
          bodyStyle={{ padding: "4px 20px 10px" }}
        >
          {[
            {
              icon: <UserOutlined className="stats-block-icon" />,
              label: "Members",
              value: "12,458",
            },
            {
              icon: <MessageOutlined className="stats-block-icon" />,
              label: "Discussions",
              value: "3,842",
            },
            {
              icon: <TrophyOutlined className="stats-block-icon" />,
              label: "Smoke-Free Days",
              value: "8,721",
            },
          ].map((item, index, arr) => (
            <div
              key={item.label}
              className={`stats-block-item ${
                index !== arr.length - 1 ? "stats-block-item-margin" : ""
              }`}
            >
              <span className="stats-block-icon-container">{item.icon}</span>
              <div>
                <div className="stats-block-value">{item.value}</div>
                <div className="stats-block-label">{item.label}</div>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
};

// DiscussionsAndGroups Component
const DiscussionsAndGroups = () => {
  const [activeTab, setActiveTab] = useState("discussions");

  const discussions = [
    {
      author: "Michael T.",
      avatarUrl:
        "https://anhanime.me/wp-content/uploads/2024/03/anh-goku_4.jpeg",
      status: "Smoke-free for 3 months",
      title: "How to handle cravings after meals?",
      content:
        "I'm doing well, but I still struggle with cravings after dinner. Any effective strategies?",
      tags: ["Cravings", "Tips"],
      likes: 24,
      comments: 18,
      time: "2 hours ago",
    },
    {
      author: "Sarah L.",
      avatarUrl:
        "https://anhanime.me/wp-content/uploads/2024/03/anh-goku_6.jpeg",
      status: "Smoke-free for 1 year",
      title: "Celebrating one year smoke-free today!",
      content:
        "Can't believe it's been a year! I wanted to share my journey and some lessons learned...",
      tags: ["Success Story", "Milestone"],
      likes: 156,
      comments: 42,
      time: "5 hours ago",
    },
    {
      author: "James K.",
      avatarUrl:
        "https://anhanime.me/wp-content/uploads/2024/03/anh-goku_15.jpeg",
      status: "Day 5 of quitting",
      title: "Struggling with irritability",
      content:
        "I'm on day 5 and find myself snapping at everyone. Any advice for managing moods?",
      tags: ["Withdrawal", "Support"],
      likes: 18,
      comments: 27,
      time: "1 day ago",
    },
  ];

  return (
    <div className="discussions-and-groups">
      <div className="tabs-container">
        <div className="tabs">
          <Button
            type="text"
            onClick={() => setActiveTab("discussions")}
            className={`tab-button ${
              activeTab === "discussions" ? "active" : ""
            }`}
            icon={<MessageOutlined />}
          >
            Discussions
          </Button>
          <Button
            type="text"
            onClick={() => setActiveTab("groups")}
            className={`tab-button ${activeTab === "groups" ? "active" : ""}`}
            icon={<TeamOutlined />}
          >
            Support Groups
          </Button>
        </div>
      </div>
      {activeTab === "discussions" ? (
        <>
          <div className="discussions-controls">
            <Input
              placeholder="Search discussions..."
              prefix={<SearchOutlined />}
              className="discussions-search"
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              className="discussions-new-button"
            >
              New Discussion
            </Button>
          </div>
          <div className="discussions-list">
            {discussions.map((item, index) => (
              <div key={index} className="discussion-item-wrapper">
                <DiscussionItem {...item} />
              </div>
            ))}
          </div>
          <div
            className="discussions-load-more"
            style={{ marginBottom: "16px" }}
          >
            <Button type="default" className="load-more-button">
              Load More
            </Button>
          </div>
        </>
      ) : (
        <SupportGroups />
      )}
    </div>
  );
};

// MainContent Component
const CommunityBlogPage = () => {
  return (
    <div
      style={{
        width: "65vw",
        margin: "0 auto",
        paddingTop: "23px",
        minHeight: "calc(100vh - 200px)",
      }}
    >
      <div className="community-blog-page">
        <CommunityHeader />
        <ShareAndStats />
        <DiscussionsAndGroups />
      </div>
    </div>
  );
};

export default CommunityBlogPage;
