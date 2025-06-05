import React, { useState, useEffect, useCallback } from "react";
import { Input, Button, Card, Avatar, Tag, message } from "antd";
import { MessageOutlined, LikeOutlined } from "@ant-design/icons";
import axios from "axios";
import "../index.css";

const { TextArea } = Input;

// DiscussionItem Component
const DiscussionItem = ({
  id,
  author,
  status,
  title,
  content,
  tags,
  likes,
  comments,
  likedByCurrentUser,
  onLike,
  commentsList = [],
  onAddComment,
}) => {
  const initials = author.name
    .split(" ")
    .map((name) => name[0])
    .join("")
    .toUpperCase();

  // Get current user info
  const userStr = localStorage.getItem("user");
  const userObj = userStr ? JSON.parse(userStr) : null;
  const currentUserId = userObj ? userObj.id || userObj.username : null;

  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");

  const handleLikeClick = async () => {
    if (currentUserId) {
      try {
        await onLike(id);
      } catch (error) {
        console.error("Error liking post:", error);
        message.error("Failed to like/unlike post");
      }
    }
  };

  const handleCommentSubmit = async () => {
    if (newComment.trim() && currentUserId) {
      try {
        await onAddComment(id, newComment);
        setNewComment("");
      } catch (error) {
        console.error("Error adding comment:", error);
        message.error("Failed to add comment");
      }
    }
  };
  return (
    <Card className="discussion-item-card" bodyStyle={{ padding: 20 }}>
      <div className="discussion-item-header">
        <div className="discussion-item-author">
          <Avatar src={author.avatarUrl} className="discussion-item-avatar">
            {!author.avatarUrl && initials}
          </Avatar>
          <div>
            <div className="discussion-item-author-name">{author.name}</div>
            <div className="discussion-item-status">{status}</div>
          </div>{" "}
        </div>
      </div>
      <div className="discussion-item-title">{title}</div>
      <div className="discussion-item-content">{content}</div>
      <div className="discussion-item-tags">
        {tags &&
          tags.map((tag) => (
            <Tag key={tag} color="green" className="discussion-item-tag">
              {tag}
            </Tag>
          ))}
      </div>{" "}
      <div className="discussion-item-footer">
        <div className="discussion-item-stats">
          {" "}
          <span
            onClick={handleLikeClick}
            style={{
              cursor: currentUserId ? "pointer" : "default",
              color: likedByCurrentUser ? "#1890ff" : "inherit",
              opacity: currentUserId ? 1 : 0.6,
            }}
          >
            <LikeOutlined className="discussion-item-icon" />
            {likes}
          </span>
          <span
            onClick={() => setShowComments(!showComments)}
            style={{
              cursor: "pointer",
            }}
          >
            <MessageOutlined className="discussion-item-icon" />
            {comments}
          </span>
        </div>
      </div>
      {/* Comments Section */}
      {showComments && (
        <div
          className="comments-section"
          style={{
            marginTop: "16px",
            borderTop: "1px solid #f0f0f0",
            paddingTop: "16px",
          }}
        >
          {" "}
          {/* Display existing comments */}
          {commentsList.map((comment, index) => (
            <div
              key={index}
              className="comment-item"
              style={{ marginBottom: "12px", display: "flex", gap: "8px" }}
            >
              <Avatar src={comment.author.avatarUrl} size="small">
                {!comment.author.avatarUrl &&
                  comment.author.name
                    .split(" ")
                    .map((name) => name[0])
                    .join("")
                    .toUpperCase()}
              </Avatar>
              <div>
                <div style={{ fontWeight: "500", fontSize: "14px" }}>
                  {comment.author.name}
                </div>
                <div style={{ fontSize: "14px", color: "#666" }}>
                  {comment.content}
                </div>
              </div>
            </div>
          ))}
          {/* Add new comment */}
          {currentUserId && (
            <div
              className="add-comment"
              style={{ marginTop: "12px", display: "flex", gap: "8px" }}
            >
              <Avatar
                src={
                  userObj?.avatar ||
                  userObj?.avatarUrl ||
                  userObj?.profilePicture ||
                  ""
                }
                size="small"
              >
                {!userObj?.avatar &&
                  !userObj?.avatarUrl &&
                  !userObj?.profilePicture &&
                  (userObj?.name || userObj?.username || "A")
                    .split(" ")
                    .map((name) => name[0])
                    .join("")
                    .toUpperCase()}
              </Avatar>
              <div style={{ flex: 1 }}>
                <Input
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onPressEnter={handleCommentSubmit}
                  suffix={
                    <Button
                      type="text"
                      size="small"
                      onClick={handleCommentSubmit}
                      disabled={!newComment.trim()}
                    >
                      Post
                    </Button>
                  }
                />
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
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

// ShareBlock Component
const ShareBlock = ({ onAddPost }) => {
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePost = async () => {
    if (postTitle.trim() && postContent.trim()) {
      setLoading(true);
      try {
        await onAddPost({
          title: postTitle.trim(),
          content: postContent.trim(),
        });
        setPostTitle("");
        setPostContent("");
        message.success("Post created successfully!");
      } catch (error) {
        console.error("Error creating post:", error);
        message.error("Failed to create post");
      } finally {
        setLoading(false);
      }
    }
  };
  return (
    <div className="share-and-stats" style={{ width: "100%" }}>
      <div className="share-block" style={{ width: "100%" }}>
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
          style={{ width: "100%" }}
        >
          {" "}
          <Input
            placeholder="Enter your post title..."
            className="share-block-title-input"
            value={postTitle}
            onChange={(e) => setPostTitle(e.target.value)}
            style={{ marginBottom: "12px" }}
          />
          <TextArea
            placeholder="Share your thoughts, experiences, or ask for support..."
            rows={4}
            className="share-block-textarea"
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
          />
          <div className="share-block-button-container">
            {" "}
            <Button
              type="primary"
              className="share-block-button"
              onClick={handlePost}
              loading={loading}
              disabled={!postTitle.trim() || !postContent.trim()}
            >
              Post
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

// DiscussionsAndGroups Component
const DiscussionsAndGroups = ({
  discussions,
  onLike,
  onAddComment,
  onLoadMore,
  hasMorePosts,
  loadingMore,
}) => {
  return (
    <div className="discussions-and-groups">
      <div className="discussions-list">
        {" "}
        {discussions.map((item, index) => (
          <div key={item.id || index} className="discussion-item-wrapper">
            <DiscussionItem
              {...item}
              onLike={onLike}
              onAddComment={onAddComment}
            />
          </div>
        ))}
      </div>
      {hasMorePosts && (
        <div className="discussions-load-more" style={{ marginBottom: "16px" }}>
          <Button
            type="default"
            className="load-more-button"
            onClick={onLoadMore}
            loading={loadingMore}
            disabled={loadingMore}
          >
            {loadingMore ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}
    </div>
  );
};

// MainContent Component
const CommunityBlogPage = () => {
  const [discussions, setDiscussions] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Get current user info
  const userStr = localStorage.getItem("user");
  const userObj = userStr ? JSON.parse(userStr) : null;
  const currentUserId = userObj ? userObj.id : null;

  // API base URL
  const API_BASE_URL = "http://localhost:8080/api/community"; // Fetch posts from API
  const fetchPosts = useCallback(
    async (page = 0, append = false) => {
      try {
        const response = await axios.get(`${API_BASE_URL}/posts`, {
          params: {
            page: page,
            size: 10,
            currentUserId: currentUserId,
          },
        });

        if (response.status === 200) {
          const data = response.data;
          const newPosts = data.posts.map((post) => ({
            id: post.id,
            author: post.author,
            avatarUrl: post.author.avatarUrl,
            status: "Community member", // You can modify this based on user data
            title: post.title,
            content: post.content,
            tags: [],
            likes: post.likesCount,
            comments: post.commentsCount,
            time: formatTimeAgo(new Date(post.createdAt)),
            likedByCurrentUser: post.likedByCurrentUser,
            timestamp: new Date(post.createdAt),
            commentsList: post.comments.map((comment) => ({
              author: comment.author,
              content: comment.content,
              time: formatTimeAgo(new Date(comment.createdAt)),
            })),
          }));

          if (append) {
            setDiscussions((prev) => [...prev, ...newPosts]);
          } else {
            setDiscussions(newPosts);
          }

          setHasMorePosts(data.hasNext);
          setCurrentPage(page);
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
        message.error("Failed to load posts");
      } finally {
        setLoadingMore(false);
      }
    },
    [currentUserId]
  );

  // Helper function to format time ago
  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };
  useEffect(() => {
    if (currentUserId) {
      fetchPosts();
    }
  }, [currentUserId, fetchPosts]);

  // Handle adding a new post
  const handleAddPost = async (postData) => {
    if (!currentUserId) {
      message.error("Please log in to create a post");
      return;
    }
    try {
      const response = await axios.post(`${API_BASE_URL}/posts`, {
        title: postData.title,
        content: postData.content,
        userId: currentUserId,
      });

      if (response.status === 201 || response.status === 200) {
        // Refresh posts to show the new post
        await fetchPosts(0, false);
        return Promise.resolve();
      }
    } catch (error) {
      console.error("Error creating post:", error);
      throw error;
    }
  };

  // Handle loading more posts
  const handleLoadMore = async () => {
    if (loadingMore || !hasMorePosts) return;

    setLoadingMore(true);
    await fetchPosts(currentPage + 1, true);
  };
  // Handle liking/unliking a post
  const handleLike = async (postId) => {
    if (!currentUserId) {
      message.error("Please log in to like posts");
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/posts/${postId}/like`,
        {
          userId: currentUserId,
        }
      );
      if (response.status === 200) {
        // Update the post in local state
        setDiscussions((prev) =>
          prev.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  likes: response.data.likesCount,
                  likedByCurrentUser: response.data.likedByCurrentUser,
                }
              : post
          )
        );
      }
    } catch (error) {
      console.error("Error liking post:", error);
      throw error;
    }
  };

  // Handle adding a comment to a post
  const handleAddComment = async (postId, content) => {
    if (!currentUserId) {
      message.error("Please log in to comment");
      return;
    }
    try {
      const response = await axios.post(
        `${API_BASE_URL}/posts/${postId}/comments`,
        {
          content: content,
          userId: currentUserId,
        }
      );

      if (response.status === 201 || response.status === 200) {
        // Update the post's comments in local state
        setDiscussions((prev) =>
          prev.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  comments: post.comments + 1,
                  commentsList: [
                    ...post.commentsList,
                    {
                      author: {
                        id: currentUserId,
                        name: userObj?.name || userObj?.username || "Unknown",
                        avatarUrl:
                          userObj?.avatar ||
                          userObj?.avatarUrl ||
                          userObj?.profilePicture ||
                          "",
                      },
                      content: content,
                      time: "Just now",
                    },
                  ],
                }
              : post
          )
        );
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      throw error;
    }
  };

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
        <ShareBlock onAddPost={handleAddPost} />{" "}
        <DiscussionsAndGroups
          discussions={discussions}
          onLike={handleLike}
          onAddComment={handleAddComment}
          onLoadMore={handleLoadMore}
          hasMorePosts={hasMorePosts}
          loadingMore={loadingMore}
        />
      </div>
    </div>
  );
};

export default CommunityBlogPage;
