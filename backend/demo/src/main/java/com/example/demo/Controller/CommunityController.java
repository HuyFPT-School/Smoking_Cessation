package com.example.demo.Controller;

import com.example.demo.DTO.CommentDTO;
import com.example.demo.DTO.PostDTO;
import com.example.demo.DTO.UserDTO;
import com.example.demo.entity.Comment;
import com.example.demo.entity.Post;
import com.example.demo.entity.PostLike;
import com.example.demo.entity.User;
import com.example.demo.Repo.CommentRepo;
import com.example.demo.Repo.PostLikeRepo;
import com.example.demo.Repo.PostRepo;
import com.example.demo.Repo.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@CrossOrigin  // Cho phép truy cập API từ các domain khác
@RequestMapping("/api/community") // Đường dẫn cơ sở cho tất cả API trong controller này
public class CommunityController {
    //lấy thông tin từ cơ sở dữ liệu.
    // Repository để truy vấn bảng trong cơ sở dữ liệu  

    @Autowired
    private PostRepo postRepo;

    @Autowired
    private CommentRepo commentRepo;

    @Autowired
    private PostLikeRepo postLikeRepo;

    @Autowired
    private UserRepo userRepo;

    //   API lấy tất cả bài đăng với phân trang
    //   
    //   Đây là API chính để hiển thị danh sách bài đăng trên trang community.
    //   Sử dụng Spring Data JPA Pagination để tối ưu hiệu suất.
    //   
    //   page - Số trang (bắt đầu từ 0)
    //   size - Số bài đăng mỗi trang (mặc định 10)
    //   currentUserId - ID người dùng hiện tại (để kiểm tra đã like chưa)
    //   return Danh sách bài đăng với thông tin phân trang
    //   
    //   URL: GET /api/community/posts?page=0&size=10&currentUserId=123
    //   
    //   Response: {
    //     "posts": [...],
    //     "totalPages": 5,
    //     "totalElements": 47,
    //     "currentPage": 0,
    //     "hasNext": true
    //   }
    // @RequestParam: Đánh dấu tham số được truyền qua URL query string
    @GetMapping("/posts")
    public ResponseEntity<?> getAllPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Integer currentUserId) {
        try {
            // Tạo đối tượng Pageable để phân trang
            Pageable pageable = PageRequest.of(page, size);
            // Lấy bài đăng theo trang, sắp xếp theo thời gian tạo (mới nhất trước)
            Page<Post> postsPage = postRepo.findAllByOrderByCreatedAtDesc(pageable);
            
            // Chuyển đổi danh sách Post entity thành PostDTO
            List<PostDTO> postDTOs = postsPage.getContent().stream()
                    .map(post -> convertToPostDTO(post, currentUserId))
                    .collect(Collectors.toList());

            // Trả về dữ liệu với thông tin phân trang đầy đủ
            return ResponseEntity.ok(Map.of(
                    "posts", postDTOs,                               // Danh sách bài đăng
                    "totalPages", postsPage.getTotalPages(),         // Tổng số trang
                    "totalElements", postsPage.getTotalElements(),   // Tổng số bài đăng
                    "currentPage", page,                             // Trang hiện tại
                    "hasNext", postsPage.hasNext()                   // Còn trang tiếp theo không
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error fetching posts: " + e.getMessage()));
        }
    }

    //   API lấy bài đăng của một người dùng cụ thể
    //   
    //   userId - ID của người dùng cần xem bài đăng
    //   page - Số trang
    //   size - Số bài đăng mỗi trang
    //   currentUserId - ID người dùng hiện tại
    //   return Danh sách bài đăng của người dùng với phân trang
    //   
    //   URL: GET /api/community/posts/user/123?page=0&size=5
    //   Sử dụng để hiển thị profile người dùng hoặc xem tất cả bài đăng của ai đó

    @GetMapping("/posts/user/{userId}")
    public ResponseEntity<?> getPostsByUserId(
            @PathVariable Integer userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Integer currentUserId) {
        try {
            // Tạo đối tượng phân trang
            Pageable pageable = PageRequest.of(page, size);
            // Tìm bài đăng theo userId với phân trang
            Page<Post> postsPage = postRepo.findByUserIdOrderByCreatedAtDesc(userId, pageable);
            // Chuyển đổi entity thành DTO
            List<PostDTO> postDTOs = postsPage.getContent().stream()
                    .map(post -> convertToPostDTO(post, currentUserId))
                    .collect(Collectors.toList());
            // Trả về kết quả với thông tin phân trang
            return ResponseEntity.ok(Map.of(
                    "posts", postDTOs,
                    "totalPages", postsPage.getTotalPages(),
                    "totalElements", postsPage.getTotalElements(),
                    "currentPage", page,
                    "hasNext", postsPage.hasNext()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error fetching user posts: " + e.getMessage()));
        }
    }

    //   API tạo bài đăng mới
    //   
    //   requestBody - Dữ liệu bài đăng từ client
    //   return Bài đăng vừa được tạo hoặc thông báo lỗi
    //   
    //   URL: POST /api/community/posts
    //   Body: {
    //     "title": "Kinh nghiệm cai thuốc tuần đầu",
    //     "content": "Chia sẻ kinh nghiệm của tôi về tuần đầu cai thuốc...",
    //     "userId": 123
    //   }

    @PostMapping("/posts")
    public ResponseEntity<?> createPost(@RequestBody Map<String, Object> requestBody) {
        try {
            // Lấy dữ liệu từ request body
            String title = (String) requestBody.get("title");
            String content = (String) requestBody.get("content");
            Integer userId = (Integer) requestBody.get("userId");

            // Validate dữ liệu đầu vào
            if (title == null || title.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Title is required"));
            }

            if (content == null || content.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Content is required"));
            }

            if (userId == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "User ID is required"));
            }

            // Kiểm tra người dùng có tồn tại không
            Optional<User> userOpt = userRepo.findById(userId);
            if (userOpt.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "User not found"));
            }

            // Tạo bài đăng mới
            Post post = new Post(title.trim(), content.trim(), userOpt.get());
            Post savedPost = postRepo.save(post);

            // Chuyển đổi thành DTO và trả về
            PostDTO postDTO = convertToPostDTO(savedPost, userId);
            return ResponseEntity.status(HttpStatus.CREATED).body(postDTO);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error creating post: " + e.getMessage()));
        }
    }

    
    //   API like/unlike bài đăng (toggle)
    //   
    //   Chức năng này cho phép người dùng like hoặc unlike một bài đăng.
    //   Nếu đã like rồi thì sẽ unlike, nếu chưa like thì sẽ like.
    //   
    //   postId - ID của bài đăng
    //   requestBody - Chứa userId của người thực hiện like
    //   return Trạng thái like mới và số lượng like hiện tại
    //   
    //   URL: POST /api/community/posts/123/like
    //   Body: { "userId": 456 }
    //   
    //   Response: {
    //     "likedByCurrentUser": true,
    //     "likesCount": 15
    //   }

    @PostMapping("/posts/{postId}/like")
    @Transactional // Đảm bảo tính nhất quán dữ liệu khi cập nhật nhiều bảng
    public ResponseEntity<?> toggleLike(@PathVariable Integer postId, @RequestBody Map<String, Integer> requestBody) {
        try {
            Integer userId = requestBody.get("userId");
 
            // Validate dữ liệu đầu vào
            if (userId == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "User ID is required"));
            }

            // Kiểm tra bài đăng có tồn tại không
            Optional<Post> postOpt = postRepo.findById(postId);
            if (postOpt.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Post not found"));
            }

            // Kiểm tra người dùng có tồn tại không
            Optional<User> userOpt = userRepo.findById(userId);
            if (userOpt.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "User not found"));
            }

            Post post = postOpt.get();
            User user = userOpt.get();

            // Kiểm tra xem người dùng đã like bài đăng này chưa
            Optional<PostLike> existingLike = postLikeRepo.findByPostIdAndUserId(postId, userId);

            boolean isLiked;
            if (existingLike.isPresent()) {
                // Đã like rồi -> Unlike: xóa like và giảm số lượng
                postLikeRepo.delete(existingLike.get());
                post.setLikesCount(post.getLikesCount() - 1);
                isLiked = false;
            } else {
                // Chưa like -> Like: tạo like mới và tăng số lượng
                PostLike newLike = new PostLike(post, user);
                postLikeRepo.save(newLike);
                post.setLikesCount(post.getLikesCount() + 1);
                isLiked = true;
            }

            // Lưu cập nhật số lượng like
            postRepo.save(post);

            return ResponseEntity.ok(Map.of(
                    "likedByCurrentUser", isLiked,
                    "likesCount", post.getLikesCount()
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error toggling like: " + e.getMessage()));
        }
    }

    
    //   API thêm bình luận vào bài đăng
    //   
    //   postId - ID của bài đăng cần bình luận
    //   requestBody - Chứa nội dung bình luận và userId
    //   return Bình luận vừa được tạo
    //   
    //   URL: POST /api/community/posts/123/comments
    //   Body: {
    //     "content": "Cảm ơn bạn đã chia sẻ, rất hữu ích!",
    //     "userId": 456
    //   }

    @PostMapping("/posts/{postId}/comments")
    @Transactional // Đảm bảo cập nhật cả bình luận và số lượng bình luận
    public ResponseEntity<?> addComment(@PathVariable Integer postId, @RequestBody Map<String, Object> requestBody) {
        try {
            // Lấy dữ liệu từ request
            String content = (String) requestBody.get("content");
            Integer userId = (Integer) requestBody.get("userId");

            // Validate dữ liệu đầu vào
            if (content == null || content.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Comment content is required"));
            }

            if (userId == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "User ID is required"));
            }
            
            // Kiểm tra bài đăng có tồn tại không
            Optional<Post> postOpt = postRepo.findById(postId);
            if (postOpt.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Post not found"));
            }
            
            // Kiểm tra người dùng có tồn tại không
            Optional<User> userOpt = userRepo.findById(userId);
            if (userOpt.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "User not found"));
            }

            Post post = postOpt.get();
            User user = userOpt.get();

            // Tạo bình luận mới
            Comment comment = new Comment(content.trim(), post, user);
            Comment savedComment = commentRepo.save(comment);

            // Cập nhật số lượng bình luận của bài đăng
            post.setCommentsCount(post.getCommentsCount() + 1);
            postRepo.save(post);
            
            // Chuyển đổi thành DTO và trả về
            CommentDTO commentDTO = convertToCommentDTO(savedComment);
            return ResponseEntity.status(HttpStatus.CREATED).body(commentDTO);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error adding comment: " + e.getMessage()));
        }
    }

    //   API lấy tất cả bình luận của một bài đăng
    //   
    //   API đơn giản để lấy tất cả bình luận của một bài đăng.
    //   Sắp xếp theo thời gian tạo (cũ nhất trước).
    //   
    //   @param postId - ID của bài đăng cần lấy bình luận
    //   @return Danh sách tất cả bình luận của bài đăng
    //  
    //   URL: GET /api/community/posts/123/comments

    @GetMapping("/posts/{postId}/comments")
    public ResponseEntity<?> getPostComments(@PathVariable Integer postId) {
        try {
            // Lấy tất cả bình luận của bài đăng, sắp xếp theo thời gian tạo
            List<Comment> comments = commentRepo.findByPostIdOrderByCreatedAtAsc(postId);
            // Chuyển đổi thành DTO
            List<CommentDTO> commentDTOs = comments.stream()
                    .map(this::convertToCommentDTO)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(commentDTOs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error fetching comments: " + e.getMessage()));
        }
    }
    
    //   Phương thức chuyển đổi từ Post entity sang PostDTO
    //   
    //   Phương thức này thực hiện nhiều công việc:
    //   1. Chuyển đổi thông tin cơ bản của bài đăng
    //   2. Tạo thông tin tác giả (UserDTO)
    //   3. Kiểm tra người dùng hiện tại đã like chưa
    //   4. Lấy tất cả bình luận của bài đăng
    //   
    //   post - Post entity từ database
    //   currentUserId - ID người dùng hiện tại (có thể null nếu chưa đăng nhập)
    //   return PostDTO đầy đủ thông tin để gửi cho client

    private PostDTO convertToPostDTO(Post post, Integer currentUserId) {
        // Tạo thông tin tác giả
        UserDTO authorDTO = new UserDTO(
                post.getUser().getId(),
                post.getUser().getName(),
                post.getUser().getEmail(),
                post.getUser().getAvatarUrl()
        );
        // Tạo thông tin bài đăng cơ bản
        PostDTO postDTO = new PostDTO(
                post.getId(),
                post.getTitle(),
                post.getContent(),
                post.getLikesCount(),
                post.getCommentsCount(),
                post.getCreatedAt(),
                post.getUpdatedAt(),
                authorDTO
        );

        // Kiểm tra người dùng hiện tại đã like bài đăng này chưa (chỉ khi đã đăng nhập)
        if (currentUserId != null) {
            boolean isLiked = postLikeRepo.existsByPostIdAndUserId(post.getId(), currentUserId);
            postDTO.setLikedByCurrentUser(isLiked);
        } else {
            // Người dùng chưa đăng nhập, mặc định chưa like
            postDTO.setLikedByCurrentUser(false);
        }

        // Lấy tất cả bình luận của bài đăng
        List<Comment> comments = commentRepo.findByPostIdOrderByCreatedAtAsc(post.getId());
        List<CommentDTO> commentDTOs = comments.stream()
                .map(this::convertToCommentDTO)
                .collect(Collectors.toList());
        postDTO.setComments(commentDTOs);

        return postDTO;
    }

    
    //   Phương thức chuyển đổi từ Comment entity sang CommentDTO
    //   
    //   comment - Comment entity từ database
    //   return CommentDTO để gửi cho client

    private CommentDTO convertToCommentDTO(Comment comment) {
        // Tạo thông tin tác giả bình luận
        UserDTO authorDTO = new UserDTO(
                comment.getUser().getId(),
                comment.getUser().getName(),
                comment.getUser().getEmail(),
                comment.getUser().getAvatarUrl()
        );
        
        // Tạo DTO bình luận
        return new CommentDTO(
                comment.getId(),
                comment.getContent(),
                comment.getCreatedAt(),
                comment.getUpdatedAt(),
                authorDTO,
                comment.getPost().getId()
        );
    }

    //   API xóa bài đăng
    //   
    //   Chỉ cho phép tác giả bài đăng xóa bài đăng của chính họ.
    //   Khi xóa bài đăng, tất cả bình luận và likes liên quan cũng sẽ bị xóa.
    //   
    //   @param postId - ID của bài đăng cần xóa
    //   @param requestBody - Chứa userId của người thực hiện xóa
    //   @return Thông báo thành công hoặc lỗi
    //   
    //   URL: DELETE /api/community/posts/123
    //   Body: { "userId": 456 }
    //   
    //   Response: { "message": "Post deleted successfully" }
    
    @DeleteMapping("/posts/{postId}")
    @Transactional // Đảm bảo xóa toàn bộ dữ liệu liên quan một cách an toàn
    public ResponseEntity<?> deletePost(@PathVariable Integer postId, @RequestBody Map<String, Integer> requestBody) {
        try {
            Integer userId = requestBody.get("userId");
            
            // Validate dữ liệu đầu vào
            if (userId == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "User ID is required"));
            }
            
            // Kiểm tra bài đăng có tồn tại không
            Optional<Post> postOpt = postRepo.findById(postId);
            if (postOpt.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Post not found"));
            }
            
            Post post = postOpt.get();
            
            // Kiểm tra quyền: chỉ tác giả mới được xóa bài đăng của mình
            if (!Objects.equals(post.getUser().getId(), userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "You can only delete your own posts"));
            }
            
            // Xóa tất cả likes của bài đăng trước
            postLikeRepo.deleteByPostId(postId);
            
            // Xóa tất cả comments của bài đăng trước
            commentRepo.deleteByPostId(postId);
            
            // Cuối cùng xóa bài đăng
            postRepo.delete(post);
            
            return ResponseEntity.ok(Map.of("message", "Post deleted successfully"));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error deleting post: " + e.getMessage()));
        }
    }

    //   API xóa bình luận
    //   
    //   Chỉ cho phép tác giả bình luận xóa bình luận của chính họ.
    //   Khi xóa bình luận, số lượng bình luận của bài đăng sẽ được cập nhật.
    //   
    //   @param commentId - ID của bình luận cần xóa
    //   @param requestBody - Chứa userId của người thực hiện xóa
    //   @return Thông báo thành công hoặc lỗi
    //   
    //   URL: DELETE /api/community/comments/789
    //   Body: { "userId": 456 }
    //   
    //   Response: { "message": "Comment deleted successfully" }
    
    @DeleteMapping("/comments/{commentId}")
    @Transactional // Đảm bảo cập nhật số lượng bình luận một cách an toàn
    public ResponseEntity<?> deleteComment(@PathVariable Integer commentId, @RequestBody Map<String, Integer> requestBody) {
        try {
            Integer userId = requestBody.get("userId");
            
            // Validate dữ liệu đầu vào
            if (userId == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "User ID is required"));
            }
            
            // Kiểm tra bình luận có tồn tại không
            Optional<Comment> commentOpt = commentRepo.findById(commentId);
            if (commentOpt.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Comment not found"));
            }
            
            Comment comment = commentOpt.get();
            
            // Kiểm tra quyền: chỉ tác giả mới được xóa bình luận của mình
            if (!Objects.equals(comment.getUser().getId(), userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "You can only delete your own comments"));
            }
            
            // Lấy bài đăng để cập nhật số lượng bình luận
            Post post = comment.getPost();
            
            // Xóa bình luận
            commentRepo.delete(comment);
            
            // Cập nhật số lượng bình luận của bài đăng
            post.setCommentsCount(Math.max(0, post.getCommentsCount() - 1)); // Đảm bảo không âm
            postRepo.save(post);
            
            return ResponseEntity.ok(Map.of("message", "Comment deleted successfully"));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error deleting comment: " + e.getMessage()));
        }
    }
    
}
