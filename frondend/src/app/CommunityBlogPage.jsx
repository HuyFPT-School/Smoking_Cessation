import React, { useState, useEffect, useCallback } from "react";
import { Input, Button, Card, Avatar, Tag, message } from "antd";
import { MessageOutlined, LikeOutlined } from "@ant-design/icons";
import axios from "axios";
import "../App.css";

const { TextArea } = Input;

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

// Helper function to generate user initials from name
const getUserInitials = (name) => {
  if (!name) return "";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase();
};

// Helper function to get user avatar URL
const getUserAvatarUrl = (user) => {
  if (!user) return "";
  return user.avatar || user.avatarUrl || user.profilePicture || "";
};

// DiscussionItem Component
const DiscussionItem = ({
  id,
  author,
  status,
  title,
  content,
  time,
  likes,
  comments,
  likedByCurrentUser,
  onLike,
  commentsList = [],
  onAddComment,
}) => {
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
        message.error(
          error.response?.data?.message || "Failed to like/unlike post"
        );
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
        message.error(error.response?.data?.message || "Failed to add comment");
      }
    }
  };
  return (
    <Card className="discussion-item-card" bodyStyle={{ padding: 20 }}>
      <div className="discussion-item-header">
        <div className="discussion-item-author">
          <Avatar src={author.avatarUrl} className="discussion-item-avatar">
            {!author.avatarUrl && getUserInitials(author.name)}
          </Avatar>
          <div>
            <div className="discussion-item-author-name">{author.name}</div>
            <div className="discussion-item-status">{status}</div>
            <div className="discussion-item-time">{time}</div>
          </div>
        </div>
      </div>
      <div className="discussion-item-title">{title}</div>
      <div className="discussion-item-content">{content}</div>
      <div className="discussion-item-footer">
        <div className="discussion-item-stats">
          <span
            onClick={handleLikeClick}
            className={`like-button ${
              !currentUserId ? "like-button-disabled" : ""
            } ${likedByCurrentUser ? "like-button-active" : ""}`}
          >
            <LikeOutlined className="discussion-item-icon" />
            {likes}
          </span>
          <span
            onClick={() => setShowComments(!showComments)}
            className="comment-button"
          >
            <MessageOutlined className="discussion-item-icon" />
            {comments}
          </span>
        </div>
      </div>
      {/* Comments Section */}
      {showComments && (
        <div className="comments-section">
          {/* Display existing comments */}
          {commentsList.map((comment, index) => (
            <div key={index} className="comment-item">
              <Avatar src={comment.author.avatarUrl} size="small">
                {!comment.author.avatarUrl &&
                  getUserInitials(comment.author.name)}
              </Avatar>
              <div>
                <div className="comment-author">{comment.author.name}</div>
                <div className="comment-content">{comment.content}</div>
                <div className="comment-time">{comment.time}</div>
              </div>
            </div>
          ))}
          {/* Add new comment */}
          {currentUserId && (
            <div className="add-comment">
              <Avatar src={getUserAvatarUrl(userObj)} size="small">
                {!getUserAvatarUrl(userObj) &&
                  getUserInitials(userObj?.name || userObj?.username || "A")}
              </Avatar>
              <div className="add-comment-input">
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

  // Get current user info
  const userStr = localStorage.getItem("user");
  const userObj = userStr ? JSON.parse(userStr) : null;
  const isLoggedIn = !!userObj;

  const handlePost = async () => {
    if (!isLoggedIn) {
      message.warning("Please log in to create a post");
      return;
    }

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
        message.error(error.response?.data?.message || "Failed to create post");
      } finally {
        setLoading(false);
      }
    }
  };
  return (
    <div className="share-and-stats full-width">
      <div className="share-block full-width">
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
          className="share-block-card full-width"
          headStyle={{ borderBottom: "none", padding: "10px 20px 4px" }}
          bodyStyle={{ padding: "4px 20px 10px" }}
        >
          <Input
            placeholder={
              isLoggedIn
                ? "Enter your post title..."
                : "Log in to create a post"
            }
            className="share-block-title-input post-title-input"
            value={postTitle}
            onChange={(e) => setPostTitle(e.target.value)}
            disabled={!isLoggedIn}
          />
          <TextArea
            placeholder={
              isLoggedIn
                ? "Share your thoughts, experiences, or ask for support..."
                : "Log in to share your thoughts"
            }
            rows={4}
            className="share-block-textarea"
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            disabled={!isLoggedIn}
          />
          <div className="share-block-button-container">
            <Button
              type="primary"
              className="share-block-button"
              onClick={handlePost}
              loading={loading}
              disabled={!isLoggedIn || !postTitle.trim() || !postContent.trim()}
            >
              {isLoggedIn ? "Post" : "Log in to Post"}
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
        <div className="discussions-load-more">
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
        const params = {
          page: page,
          size: 10,
        };

        // Only add currentUserId if user is logged in
        if (currentUserId) {
          params.currentUserId = currentUserId;
        }

        const response = await axios.get(`${API_BASE_URL}/posts`, {
          params: params,
        });

        if (response.status === 200) {
          const data = response.data;
          const newPosts = data.posts.map((post) => ({
            id: post.id,
            author: post.author,
            status: "Community member", // You can modify this based on user data
            title: post.title,
            content: post.content,
            likes: post.likesCount,
            comments: post.commentsCount,
            time: formatTimeAgo(new Date(post.createdAt)),
            likedByCurrentUser: post.likedByCurrentUser || false,
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
        message.error(error.response?.data?.message || "Failed to load posts");
      } finally {
        setLoadingMore(false);
      }
    },
    [currentUserId]
  );

  useEffect(() => {
    // Always fetch posts, even if user is not logged in
    fetchPosts();
  }, [fetchPosts]);

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
      message.error(error.response?.data?.message || "Failed to create post");
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
      message.error(
        error.response?.data?.message || "Failed to like/unlike post"
      );
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
                        avatarUrl: getUserAvatarUrl(userObj),
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
      message.error(error.response?.data?.message || "Failed to add comment");
      throw error;
    }
  };
  return (
    <div className="community-blog-container">
      <div className="community-blog-page">
        <CommunityHeader />
        <ShareBlock onAddPost={handleAddPost} />
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
