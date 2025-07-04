import React, { useState, useEffect, useCallback } from "react";
import { Input, Button, Card, Avatar, Tag, message, Popconfirm } from "antd";
import {
  MessageOutlined,
  LikeOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import axios from "axios";
import "../App.css";

const { TextArea } = Input;

// Kiểm tra quyền admin
const isAdminOrSuperAdmin = () => {
  const user = getCurrentUser();
  return user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";
};

// Định dạng thời gian hiển thị
const formatTimeAgo = (date) => {
  const now = new Date(); // Lấy thời gian hiện tại
  const diffMs = now - date; // Tính khoảng cách thời gian (milliseconds)
  const diffMins = Math.floor(diffMs / (1000 * 60)); // Chuyển đổi thành phút
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60)); // Chuyển đổi thành giờ
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)); // Chuyển đổi thành ngày

  // Trả về chuỗi mô tả phù hợp
  if (diffMins < 1) return "Just now"; // Vừa mới
  if (diffMins < 60) return `${diffMins} minutes ago`; // X phút trước
  if (diffHours < 24) return `${diffHours} hours ago`; // X giờ trước
  return `${diffDays} days ago`; // X ngày trước
};

// Tạo chữ viết tắt từ tên người dùng
const getUserInitials = (name) => {
  if (!name) return "";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase();
};

// Lấy URL avatar của người dùng
const getUserAvatarUrl = (user) => {
  if (!user) return "";
  return user.avatar || user.avatarUrl || user.profilePicture || "";
};

// Lấy thông tin người dùng từ localStorage
const getCurrentUser = () => {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
};

// Lấy ID người dùng hiện tại
const getCurrentUserId = () => {
  const userObj = getCurrentUser();
  if (!userObj) return null;
  return userObj.userId || userObj.id || userObj.username || null;
};

// Component hiển thị một bài đăng
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
  onDeletePost,
  onDeleteComment,
}) => {
  const currentUserId = getCurrentUserId();
  const userObj = getCurrentUser();

  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");

  // Kiểm tra xem user hiện tại có phải là tác giả của bài đăng này không
  // Chỉ tác giả mới được phép xóa bài đăng của mình
  const isPostAuthor =
    currentUserId &&
    author &&
    (author.id === currentUserId || author.username === currentUserId);

  /**
   * Hàm xử lý khi user click nút like
   * Gọi function onLike được truyền từ component cha
   */
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
  /**
   * Hàm xử lý khi user submit comment mới
   * Gọi function onAddComment được truyền từ component cha
   */
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
  /**
   * Hàm xử lý khi user xóa bài đăng
   * Chỉ tác giả mới có thể xóa bài đăng của mình
   */
  const handleDeletePost = async () => {
    try {
      await onDeletePost(id);
      message.success("Post deleted successfully");
    } catch (error) {
      console.error("Error deleting post:", error);
      message.error(error.response?.data?.message || "Failed to delete post");
    }
  };
  /**
   * Hàm xử lý khi user xóa comment
   * Chỉ tác giả comment mới có thể xóa comment của mình
   */
  const handleDeleteComment = async (commentId) => {
    try {
      await onDeleteComment(commentId);
      message.success("Comment deleted successfully");
    } catch (error) {
      console.error("Error deleting comment:", error);
      message.error(
        error.response?.data?.message || "Failed to delete comment"
      );
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
        {(isPostAuthor || isAdminOrSuperAdmin()) && (
          <Popconfirm
            title="Delete this post?"
            description="Are you sure you want to delete this post? This action cannot be undone."
            onConfirm={handleDeletePost}
            okText="Yes, Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        )}
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
      {showComments && (
        <div className="comments-section">
          {commentsList.map((comment, index) => {
            const isCommentAuthor =
              currentUserId &&
              comment.author &&
              (comment.author.id === currentUserId ||
                comment.author.username === currentUserId);

            return (
              <div key={comment.id || index} className="comment-item">
                <Avatar src={comment.author.avatarUrl} size="small">
                  {!comment.author.avatarUrl &&
                    getUserInitials(comment.author.name)}
                </Avatar>
                <div className="comment-content-wrapper">
                  <div className="comment-main">
                    <div className="comment-author">{comment.author.name}</div>
                    <div className="comment-content">{comment.content}</div>
                    <div className="comment-time">{comment.time}</div>
                  </div>
                  {(isCommentAuthor || isAdminOrSuperAdmin()) && (
                    <Popconfirm
                      title="Delete this comment?"
                      description="Are you sure you want to delete this comment?"
                      onConfirm={() => handleDeleteComment(comment.id)}
                      okText="Yes, Delete"
                      cancelText="Cancel"
                      okButtonProps={{ danger: true }}
                    >
                      <Button
                        type="text"
                        icon={<DeleteOutlined />}
                        size="small"
                        danger
                        className="comment-delete-btn"
                      />
                    </Popconfirm>
                  )}
                </div>
              </div>
            );
          })}
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

// Component header trang cộng đồng
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

// Component form tạo bài đăng mới
const ShareBlock = ({ onAddPost }) => {
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [loading, setLoading] = useState(false);

  const userObj = getCurrentUser();
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
            onChange={(e) => setPostContent(e.target.value)} // Cập nhật state khi user nhập
            disabled={!isLoggedIn} // Disable nếu chưa đăng nhập
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

// Component hiển thị danh sách bài đăng
const DiscussionsAndGroups = ({
  discussions,
  onLike,
  onAddComment,
  onDeletePost,
  onDeleteComment,
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
              onDeletePost={onDeletePost}
              onDeleteComment={onDeleteComment}
            />
          </div>
        ))}
      </div>
      {/* Nút Load More - chỉ hiển thị nếu còn bài đăng để load */}
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

// Component chính - trang cộng đồng
const CommunityBlogPage = () => {
  const [discussions, setDiscussions] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const API_BASE_URL = "http://localhost:8080/api/community";
  // Lấy danh sách bài đăng từ API
  const fetchPosts = useCallback(async (page = 0, append = false) => {
    try {
      const params = {
        page: page,
        size: 10,
      };

      const userId = getCurrentUserId();
      if (userId) {
        params.currentUserId = userId;
      }

      const response = await axios.get(`${API_BASE_URL}/posts`, {
        params: params,
      });

      if (response.status === 200) {
        const data = response.data;
        const newPosts = data.posts.map((post) => ({
          id: post.id,
          author: post.author,
          status:
            post.author?.role === "ADMIN" || post.author?.role === "SUPER_ADMIN"
              ? "Admin"
              : "Community member",
          title: post.title,
          content: post.content,
          likes: post.likesCount,
          comments: post.commentsCount,
          time: formatTimeAgo(new Date(post.createdAt)),
          likedByCurrentUser: post.likedByCurrentUser || false,
          commentsList: post.comments.map((comment) => ({
            id: comment.id,
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
  }, []);
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Thêm bài đăng mới
  const handleAddPost = async (postData) => {
    const userId = getCurrentUserId();
    if (!userId) {
      message.error("Please log in to create a post");
      return;
    }
    try {
      const response = await axios.post(`${API_BASE_URL}/posts`, {
        title: postData.title,
        content: postData.content,
        userId: userId,
      });

      if (response.status === 201 || response.status === 200) {
        await fetchPosts(0, false);
        return Promise.resolve();
      }
    } catch (error) {
      console.error("Error creating post:", error);
      message.error(error.response?.data?.message || "Failed to create post");
      throw error;
    }
  };

  // Load thêm bài đăng
  const handleLoadMore = async () => {
    if (loadingMore || !hasMorePosts) return;

    setLoadingMore(true);
    await fetchPosts(currentPage + 1, true);
  };

  // Xử lý like/unlike bài đăng
  const handleLike = async (postId) => {
    const userId = getCurrentUserId();
    if (!userId) {
      message.error("Please log in to like posts");
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/posts/${postId}/like`,
        {
          userId: userId,
        }
      );
      if (response.status === 200) {
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

  // Thêm comment vào bài đăng
  const handleAddComment = async (postId, content) => {
    const userId = getCurrentUserId();
    const user = getCurrentUser();
    if (!userId) {
      message.error("Please log in to comment");
      return;
    }
    try {
      const response = await axios.post(
        `${API_BASE_URL}/posts/${postId}/comments`,
        {
          content: content,
          userId: userId,
        }
      );

      if (response.status === 201 || response.status === 200) {
        setDiscussions((prev) =>
          prev.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  comments: post.comments + 1,
                  commentsList: [
                    ...post.commentsList,
                    {
                      id: response.data.id || Date.now(),
                      author: {
                        id: userId,
                        name: user?.name || user?.username || "Unknown",
                        avatarUrl: getUserAvatarUrl(user),
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
  // Xóa bài đăng
  const handleDeletePost = async (postId) => {
    const userId = getCurrentUserId();
    if (!userId) {
      message.error("Please log in to delete posts");
      return;
    }

    try {
      let response;

      if (isAdminOrSuperAdmin()) {
        response = await axios.delete(
          `http://localhost:8080/api/admin/posts/delete/${postId}?adminId=${userId}`
        );
      } else {
        response = await axios.delete(`${API_BASE_URL}/posts/${postId}`, {
          data: { userId: userId },
        });
      }

      if (response.status === 200) {
        setDiscussions((prev) => prev.filter((post) => post.id !== postId));
        message.success("Post deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      message.error(error.response?.data?.message || "Failed to delete post");
      throw error;
    }
  };

  // Xóa comment
  const handleDeleteComment = async (commentId) => {
    const userId = getCurrentUserId();
    if (!userId) {
      message.error("Please log in to delete comments");
      return;
    }

    try {
      let response;

      if (isAdminOrSuperAdmin()) {
        response = await axios.delete(
          `http://localhost:8080/api/admin/comments/delete/${commentId}?adminId=${userId}`
        );
      } else {
        response = await axios.delete(`${API_BASE_URL}/comments/${commentId}`, {
          data: { userId: userId },
        });
      }

      if (response.status === 200) {
        setDiscussions((prev) =>
          prev.map((post) => ({
            ...post,
            commentsList: post.commentsList.filter(
              (comment) => comment.id !== commentId
            ),
            comments: Math.max(0, post.comments - 1),
          }))
        );
        message.success("Comment deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      message.error(
        error.response?.data?.message || "Failed to delete comment"
      );
      throw error;
    }
  };

  console.log("👤 User:", getCurrentUser());
  console.log("🛡️ Role check:", isAdminOrSuperAdmin());

  return (
    <div className="community-blog-container">
      <div className="community-blog-page">
        <CommunityHeader />
        <ShareBlock onAddPost={handleAddPost} />
        <DiscussionsAndGroups
          discussions={discussions}
          onLike={handleLike}
          onAddComment={handleAddComment}
          onDeletePost={handleDeletePost}
          onDeleteComment={handleDeleteComment}
          onLoadMore={handleLoadMore}
          hasMorePosts={hasMorePosts}
          loadingMore={loadingMore}
        />
      </div>
    </div>
  );
};

export default CommunityBlogPage;
