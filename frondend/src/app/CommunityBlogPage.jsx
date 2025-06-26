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


// --- THÊM HÀM KIỂM TRA ADMIN --- //
const isAdminOrSuperAdmin = () => {
  const user = getCurrentUser();
  return user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";
};


/**
 * Hàm tính toán thời gian "bao lâu trước" (như Facebook hiển thị "2 hours ago")
 * date - Ngày cần tính toán
 * Chuỗi mô tả thời gian (VD: "2 hours ago", "Just now")
 */
// Helper function to format time ago
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

/**
 * Hàm tạo chữ viết tắt từ tên người dùng (VD: "Nguyễn Văn A" → "NVA")
 * Dùng để hiển thị trong avatar khi không có ảnh đại diện
 * name - Tên đầy đủ của người dùng
 * Chữ viết tắt in hoa
 */
// Helper function to generate user initials from name
const getUserInitials = (name) => {
  if (!name) return ""; // Nếu không có tên, trả về chuỗi rỗng
  return name
    .split(" ") // Tách tên thành các từ: ["Nguyễn", "Văn", "A"]
    .map((part) => part[0]) // Lấy chữ cái đầu: ["N", "V", "A"]
    .join("") // Ghép lại: "NVA"
    .toUpperCase(); // Chuyển thành chữ hoa: "NVA"
};

/**
 * Hàm lấy URL ảnh đại diện của người dùng
 * Thử nhiều tên trường khác nhau vì backend có thể dùng tên khác nhau
 * Object chứa thông tin người dùng
 * URL của ảnh đại diện hoặc chuỗi rỗng
 */
// Helper function to get user avatar URL
const getUserAvatarUrl = (user) => {
  if (!user) return ""; // Nếu không có user, trả về chuỗi rỗng
  // Thử các tên trường có thể chứa URL ảnh đại diện
  return user.avatar || user.avatarUrl || user.profilePicture || "";
};

/**
 * Hàm lấy thông tin người dùng hiện tại từ localStorage
 * localStorage giống như "hộp lưu trữ" trong trình duyệt
 * Object chứa thông tin user hoặc null nếu chưa đăng nhập
 */
const getCurrentUser = () => {
  const userStr = localStorage.getItem("user"); // Lấy chuỗi JSON từ localStorage
  return userStr ? JSON.parse(userStr) : null; // Chuyển đổi thành object hoặc trả về null
};

/**
 * Hàm lấy ID của người dùng hiện tại
 * Thử nhiều tên trường khác nhau vì backend có thể dùng tên khác nhau
 * ID người dùng hoặc null nếu không tìm thấy
 */
const getCurrentUserId = () => {
  const userObj = getCurrentUser(); // Lấy thông tin user
  if (!userObj) return null; // Nếu không có user, trả về null
  // Thử nhiều tên trường có thể chứa user ID
  return userObj.userId || userObj.id || userObj.username || null;
};

/**
 * COMPONENT DiscussionItem - Hiển thị một bài đăng trong cộng đồng
 * Giống như một "thẻ bài viết" trên Facebook, chứa:
 * - Thông tin tác giả (avatar, tên, thời gian)
 * - Nội dung bài viết (tiêu đề, nội dung)
 * - Tương tác (like, comment, delete)
 * - Danh sách bình luận
 */
// DiscussionItem Component
const DiscussionItem = ({
  // Các props (thuộc tính) được truyền vào component từ component cha
  id, // ID của bài đăng
  author, // Thông tin tác giả (object chứa name, avatar, etc.)
  status, // Trạng thái của tác giả (VD: "Community member")
  title, // Tiêu đề bài đăng
  content, // Nội dung bài đăng
  time, // Thời gian đăng (đã được format)
  likes, // Số lượng like
  comments, // Số lượng comment
  likedByCurrentUser, // Boolean: user hiện tại đã like bài này chưa
  onLike, // Function được gọi khi user click like
  commentsList = [], // Danh sách các comment (mặc định là array rỗng)
  onAddComment, // Function được gọi khi user thêm comment
  onDeletePost, // Function được gọi khi user xóa bài đăng
  onDeleteComment, // Function được gọi khi user xóa comment
}) => {
  // Lấy thông tin người dùng hiện tại sử dụng helper functions
  const currentUserId = getCurrentUserId();
  const userObj = getCurrentUser();

  // useState để quản lý trạng thái hiển thị comments (ẩn/hiện)
  const [showComments, setShowComments] = useState(false);
  // useState để lưu nội dung comment mới đang nhập
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
        await onLike(id); // Gọi API like/unlike
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
        await onAddComment(id, newComment); // Gọi API thêm comment
        setNewComment(""); // Reset input field
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
      await onDeletePost(id); // Gọi API xóa bài đăng
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
      await onDeleteComment(commentId); // Gọi API xóa comment
      message.success("Comment deleted successfully");
    } catch (error) {
      console.error("Error deleting comment:", error);
      message.error(
        error.response?.data?.message || "Failed to delete comment"
      );
    }
  };
  // JSX return - Cấu trúc HTML/UI của component
  return (
    <Card className="discussion-item-card" bodyStyle={{ padding: 20 }}>
      {/* Header của bài đăng - chứa thông tin tác giả và nút delete */}
      <div className="discussion-item-header">
        <div className="discussion-item-author">
          {/* Avatar của tác giả */}
          <Avatar src={author.avatarUrl} className="discussion-item-avatar">
            {/* Nếu không có avatar, hiển thị chữ viết tắt */}
            {!author.avatarUrl && getUserInitials(author.name)}
          </Avatar>
          <div>
            {/* Tên tác giả */}
            <div className="discussion-item-author-name">{author.name}</div>
            {/* Trạng thái tác giả */}
            <div className="discussion-item-status">{status}</div>
            {/* Thời gian đăng bài */}
            <div className="discussion-item-time">{time}</div>
          </div>
        </div>
        {/* Nút xóa bài đăng - chỉ hiển thị cho tác giả */}
       {(isPostAuthor || isAdminOrSuperAdmin()) && (

          <Popconfirm
            title="Delete this post?" // Tiêu đề popup xác nhận
            description="Are you sure you want to delete this post? This action cannot be undone."
            onConfirm={handleDeletePost} // Function được gọi khi user confirm
            okText="Yes, Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }} // Nút Delete có màu đỏ (nguy hiểm)
          >
            <Button type="text" icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        )}
      </div>
      {/* Tiêu đề bài đăng */}
      <div className="discussion-item-title">{title}</div>
      {/* Nội dung bài đăng */}
      <div className="discussion-item-content">{content}</div>
      {/* Footer chứa like và comment buttons */}
      <div className="discussion-item-footer">
        <div className="discussion-item-stats">
          {/* Nút Like */}
          <span
            onClick={handleLikeClick}
            className={`like-button ${
              !currentUserId ? "like-button-disabled" : ""
            } ${likedByCurrentUser ? "like-button-active" : ""}`}
          >
            <LikeOutlined className="discussion-item-icon" />
            {likes}
          </span>
          {/* Nút Comment */}
          <span
            onClick={() => setShowComments(!showComments)} // Toggle hiển thị comments
            className="comment-button"
          >
            <MessageOutlined className="discussion-item-icon" />
            {comments}
          </span>
        </div>
      </div>{" "}
      {/* Comments Section */}
      {/* Section hiển thị comments - chỉ hiện khi showComments = true */}
      {showComments && (
        <div className="comments-section">
          {/* Hiển thị danh sách comments hiện có */}
          {commentsList.map((comment, index) => {
            // Kiểm tra xem user hiện tại có phải là tác giả của comment này không
            const isCommentAuthor =
              currentUserId &&
              comment.author &&
              (comment.author.id === currentUserId ||
                comment.author.username === currentUserId);

            return (
              <div key={comment.id || index} className="comment-item">
                {/* Avatar của người comment */}
                <Avatar src={comment.author.avatarUrl} size="small">
                  {!comment.author.avatarUrl &&
                    getUserInitials(comment.author.name)}
                </Avatar>
                <div className="comment-content-wrapper">
                  <div className="comment-main">
                    {/* Tên người comment */}
                    <div className="comment-author">{comment.author.name}</div>
                    {/* Nội dung comment */}
                    <div className="comment-content">{comment.content}</div>
                    {/* Thời gian comment */}
                    <div className="comment-time">{comment.time}</div>
                  </div>
                  {/* Nút xóa comment - chỉ hiển thị cho tác giả comment */}
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
          {/* Form thêm comment mới - chỉ hiển thị nếu user đã đăng nhập */}
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
                  onChange={(e) => setNewComment(e.target.value)} // Cập nhật state khi user nhập
                  onPressEnter={handleCommentSubmit} // Submit khi nhấn Enter
                  suffix={
                    <Button
                      type="text"
                      size="small"
                      onClick={handleCommentSubmit}
                      disabled={!newComment.trim()} // Disable nút nếu comment rỗng
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

/**
 * COMPONENT CommunityHeader - Hiển thị header của trang cộng đồng
 * Chứa tiêu đề và mô tả về mục đích của trang
 */
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

/**
 * COMPONENT ShareBlock - Form để tạo bài đăng mới
 * Giống như "What's on your mind?" box trên Facebook
 * Cho phép user nhập tiêu đề và nội dung bài đăng
 */
// ShareBlock Component
const ShareBlock = ({ onAddPost }) => {
  // State để lưu tiêu đề bài đăng đang nhập
  const [postTitle, setPostTitle] = useState("");
  // State để lưu nội dung bài đăng đang nhập
  const [postContent, setPostContent] = useState("");
  // State để hiển thị trạng thái loading khi đang tạo bài đăng
  const [loading, setLoading] = useState(false);

  // Get current user info using helper function
  // Lấy thông tin user và kiểm tra đăng nhập
  const userObj = getCurrentUser();
  const isLoggedIn = !!userObj; // Chuyển đổi thành boolean
  /**
   * Hàm xử lý khi user click nút "Post"
   * Validate dữ liệu và gọi API tạo bài đăng mới
   */
  const handlePost = async () => {
    // Kiểm tra user đã đăng nhập chưa
    if (!isLoggedIn) {
      message.warning("Please log in to create a post");
      return;
    }

    // Kiểm tra user đã nhập đầy đủ thông tin chưa
    if (postTitle.trim() && postContent.trim()) {
      setLoading(true); // Bắt đầu loading
      try {
        // Gọi function onAddPost được truyền từ component cha
        await onAddPost({
          title: postTitle.trim(),
          content: postContent.trim(),
        });
        // Reset form sau khi tạo thành công
        setPostTitle("");
        setPostContent("");
        message.success("Post created successfully!");
      } catch (error) {
        console.error("Error creating post:", error);
        message.error(error.response?.data?.message || "Failed to create post");
      } finally {
        setLoading(false); // Kết thúc loading
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
          {" "}
          {/* Input field cho tiêu đề bài đăng */}
          <Input
            placeholder={
              isLoggedIn
                ? "Enter your post title..."
                : "Log in to create a post"
            }
            className="share-block-title-input post-title-input"
            value={postTitle}
            onChange={(e) => setPostTitle(e.target.value)} // Cập nhật state khi user nhập
            disabled={!isLoggedIn} // Disable nếu chưa đăng nhập
          />
          {/* TextArea cho nội dung bài đăng */}
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
          {/* Container chứa nút Post */}
          <div className="share-block-button-container">
            <Button
              type="primary"
              className="share-block-button"
              onClick={handlePost}
              loading={loading} // Hiển thị loading spinner
              disabled={!isLoggedIn || !postTitle.trim() || !postContent.trim()} // Disable nếu không hợp lệ
            >
              {isLoggedIn ? "Post" : "Log in to Post"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

/**
 * COMPONENT DiscussionsAndGroups - Hiển thị danh sách bài đăng và nút Load More
 * Nhận danh sách discussions từ component cha và render từng item
 */
// DiscussionsAndGroups Component
const DiscussionsAndGroups = ({
  discussions, // Danh sách bài đăng
  onLike, // Function xử lý like
  onAddComment, // Function xử lý thêm comment
  onDeletePost, // Function xử lý xóa bài đăng
  onDeleteComment, // Function xử lý xóa comment
  onLoadMore, // Function load thêm bài đăng
  hasMorePosts, // Boolean: còn bài đăng để load không
  loadingMore, // Boolean: đang load thêm bài đăng không
}) => {
  return (
    <div className="discussions-and-groups">
      {/* Danh sách các bài đăng */}
      <div className="discussions-list">
        {discussions.map((item, index) => (
          <div key={item.id || index} className="discussion-item-wrapper">
            {/* Render từng DiscussionItem component */}
            <DiscussionItem
              {...item} // Spread tất cả properties của item
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
            loading={loadingMore} // Hiển thị loading spinner
            disabled={loadingMore} // Disable khi đang loading
          >
            {loadingMore ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}
    </div>
  );
};

/**
 * COMPONENT CHÍNH - CommunityBlogPage
 * Đây là component gốc quản lý toàn bộ trang cộng đồng
 * Chứa logic chính: fetch data, quản lý state, xử lý các actions
 */
// MainContent Component
const CommunityBlogPage = () => {
  // State để lưu danh sách bài đăng
  const [discussions, setDiscussions] = useState([]);
  // State để theo dõi trang hiện tại (cho pagination)
  const [currentPage, setCurrentPage] = useState(0);
  // State để biết còn bài đăng để load không
  const [hasMorePosts, setHasMorePosts] = useState(true);
  // State để theo dõi trạng thái đang load thêm bài đăng
  const [loadingMore, setLoadingMore] = useState(false);

  // API base URL
  // URL gốc của API
  const API_BASE_URL = "http://localhost:8080/api/community";
  /**
   * Hàm fetch posts từ API
   * useCallback để tránh re-render không cần thiết
   * @param {number} page - Số trang cần load (0, 1, 2, ...)
   * @param {boolean} append - True: thêm vào danh sách hiện có, False: thay thế danh sách
   */
  const fetchPosts = useCallback(async (page = 0, append = false) => {
    try {
      // Chuẩn bị parameters cho API call
      const params = {
        page: page, // Trang cần load
        size: 10, // Số bài đăng mỗi trang
      };

      // Only add currentUserId if user is logged in
      // Chỉ thêm currentUserId nếu user đã đăng nhập
      // Để backend biết bài nào user đã like
      const userId = getCurrentUserId();
      if (userId) {
        params.currentUserId = userId;
      }

      // Gọi API để lấy danh sách bài đăng
      const response = await axios.get(`${API_BASE_URL}/posts`, {
        params: params,
      });

      if (response.status === 200) {
        const data = response.data;
        // Chuyển đổi dữ liệu từ backend thành format phù hợp cho frontend
        const newPosts = data.posts.map((post) => ({
          id: post.id,
          author: post.author,
          status: "Community member",
          title: post.title,
          content: post.content,
          likes: post.likesCount,
          comments: post.commentsCount,
          time: formatTimeAgo(new Date(post.createdAt)), // Chuyển đổi thời gian
          likedByCurrentUser: post.likedByCurrentUser || false,
          commentsList: post.comments.map((comment) => ({
            id: comment.id,
            author: comment.author,
            content: comment.content,
            time: formatTimeAgo(new Date(comment.createdAt)),
          })),
        }));

        // Cập nhật state discussions
        if (append) {
          // Thêm vào danh sách hiện có (cho Load More)
          setDiscussions((prev) => [...prev, ...newPosts]);
        } else {
          // Thay thế danh sách hiện có (cho lần đầu load hoặc refresh)
          setDiscussions(newPosts);
        }

        // Cập nhật các state khác
        setHasMorePosts(data.hasNext); // Còn trang tiếp theo không
        setCurrentPage(page); // Trang hiện tại
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      message.error(error.response?.data?.message || "Failed to load posts");
    } finally {
      setLoadingMore(false); // Kết thúc loading
    }
  }, []);
  // useEffect để load posts khi component mount lần đầu
  useEffect(() => {
    // Luôn fetch posts, kể cả khi user chưa đăng nhập (để xem bài đăng công khai)
    fetchPosts();
  }, [fetchPosts]);

  /**
   * Hàm xử lý thêm bài đăng mới
   * postData - Object chứa title và content
   */

  const handleAddPost = async (postData) => {
    const userId = getCurrentUserId();
    if (!userId) {
      message.error("Please log in to create a post");
      return;
    }
    try {
      // Gọi API tạo bài đăng mới
      const response = await axios.post(`${API_BASE_URL}/posts`, {
        title: postData.title,
        content: postData.content,
        userId: userId,
      });

      if (response.status === 201 || response.status === 200) {
        // Refresh danh sách posts để hiển thị bài đăng mới
        await fetchPosts(0, false);
        return Promise.resolve();
      }
    } catch (error) {
      console.error("Error creating post:", error);
      message.error(error.response?.data?.message || "Failed to create post");
      throw error;
    }
  };
  /**
   * Hàm xử lý load thêm bài đăng (pagination)
   * Được gọi khi user click nút "Load More"
   */
  const handleLoadMore = async () => {
    if (loadingMore || !hasMorePosts) return; // Tránh double loading

    setLoadingMore(true);
    await fetchPosts(currentPage + 1, true); // Load trang tiếp theo và append
  };

  /**
   * Hàm xử lý like/unlike bài đăng
   * postId - ID của bài đăng cần like/unlike
   */
  const handleLike = async (postId) => {
    const userId = getCurrentUserId();
    if (!userId) {
      message.error("Please log in to like posts");
      return;
    }

    try {
      // Gọi API like/unlike
      const response = await axios.post(
        `${API_BASE_URL}/posts/${postId}/like`,
        {
          userId: userId,
        }
      );
      if (response.status === 200) {
        // Cập nhật state local để UI phản hồi ngay lập tức
        setDiscussions((prev) =>
          prev.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  likes: response.data.likesCount, // Số lượng like mới
                  likedByCurrentUser: response.data.likedByCurrentUser, // Trạng thái like mới
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

  /**
   * Hàm xử lý thêm comment vào bài đăng
   * postId - ID của bài đăng
   * content - Nội dung comment
   */

  const handleAddComment = async (postId, content) => {
    const userId = getCurrentUserId();
    const user = getCurrentUser();
    if (!userId) {
      message.error("Please log in to comment");
      return;
    }
    try {
      // Gọi API thêm comment
      const response = await axios.post(
        `${API_BASE_URL}/posts/${postId}/comments`,
        {
          content: content,
          userId: userId,
        }
      );

      if (response.status === 201 || response.status === 200) {
        // Cập nhật state local để hiển thị comment mới ngay lập tức
        setDiscussions((prev) =>
          prev.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  comments: post.comments + 1, // Tăng số lượng comment
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
  /**
   * Hàm xử lý xóa bài đăng
   * Chỉ tác giả mới có thể xóa bài đăng của mình
   * postId - ID của bài đăng cần xóa
   */
  const handleDeletePost = async (postId) => {
  const userId = getCurrentUserId();
  if (!userId) {
    message.error("Please log in to delete posts");
    return;
  }

  try {
    let response;

    if (isAdminOrSuperAdmin()) {
      // Gọi API admin
      response = await axios.delete(
        `http://localhost:8080/api/admin/posts/delete/${postId}?adminId=${userId}`
      );
    } else {
      // Gọi API user thường
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

  /**
   * Hàm xử lý xóa comment
   * Chỉ tác giả comment mới có thể xóa comment của mình
   * commentId - ID của comment cần xóa
   */
  const handleDeleteComment = async (commentId) => {
  const userId = getCurrentUserId();
  if (!userId) {
    message.error("Please log in to delete comments");
    return;
  }

  try {
    let response;

    if (isAdminOrSuperAdmin()) {
      // Gọi API dành cho admin
      response = await axios.delete(
        `http://localhost:8080/api/admin/comments/delete/${commentId}?adminId=${userId}`
      );
    } else {
      // Gọi API dành cho user thường
      response = await axios.delete(`${API_BASE_URL}/comments/${commentId}`, {
        data: { userId: userId },
      });
    }

    if (response.status === 200) {
      // Cập nhật lại local state
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

  // JSX return - Cấu trúc UI của trang cộng đồng
  return (
    <div className="community-blog-container">
      <div className="community-blog-page">
        {/* Header của trang */}
        <CommunityHeader />
        {/* Block để tạo bài đăng mới */}
        <ShareBlock onAddPost={handleAddPost} />
        {/* Danh sách bài đăng và nút Load More */}
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