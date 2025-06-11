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
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@CrossOrigin
@RequestMapping("/api/community")
public class CommunityController {

    @Autowired
    private PostRepo postRepo;

    @Autowired
    private CommentRepo commentRepo;

    @Autowired
    private PostLikeRepo postLikeRepo;

    @Autowired
    private UserRepo userRepo;

    // Get all posts with pagination
    @GetMapping("/posts")
    public ResponseEntity<?> getAllPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Integer currentUserId) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<Post> postsPage = postRepo.findAllByOrderByCreatedAtDesc(pageable);

            List<PostDTO> postDTOs = postsPage.getContent().stream()
                    .map(post -> convertToPostDTO(post, currentUserId))
                    .collect(Collectors.toList());

            return ResponseEntity.ok(Map.of(
                    "posts", postDTOs,
                    "totalPages", postsPage.getTotalPages(),
                    "totalElements", postsPage.getTotalElements(),
                    "currentPage", page,
                    "hasNext", postsPage.hasNext()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error fetching posts: " + e.getMessage()));
        }
    }

    // Get posts by user ID
    @GetMapping("/posts/user/{userId}")
    public ResponseEntity<?> getPostsByUserId(
            @PathVariable Integer userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Integer currentUserId) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<Post> postsPage = postRepo.findByUserIdOrderByCreatedAtDesc(userId, pageable);

            List<PostDTO> postDTOs = postsPage.getContent().stream()
                    .map(post -> convertToPostDTO(post, currentUserId))
                    .collect(Collectors.toList());

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

    // Create a new post
    @PostMapping("/posts")
    public ResponseEntity<?> createPost(@RequestBody Map<String, Object> requestBody) {
        try {
            String title = (String) requestBody.get("title");
            String content = (String) requestBody.get("content");
            Integer userId = (Integer) requestBody.get("userId");

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

            Optional<User> userOpt = userRepo.findById(userId);
            if (userOpt.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "User not found"));
            }

            Post post = new Post(title.trim(), content.trim(), userOpt.get());
            Post savedPost = postRepo.save(post);

            PostDTO postDTO = convertToPostDTO(savedPost, userId);
            return ResponseEntity.status(HttpStatus.CREATED).body(postDTO);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error creating post: " + e.getMessage()));
        }
    }

    // Like/Unlike a post
    @PostMapping("/posts/{postId}/like")
    @Transactional
    public ResponseEntity<?> toggleLike(@PathVariable Integer postId, @RequestBody Map<String, Integer> requestBody) {
        try {
            Integer userId = requestBody.get("userId");

            if (userId == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "User ID is required"));
            }

            Optional<Post> postOpt = postRepo.findById(postId);
            if (postOpt.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Post not found"));
            }

            Optional<User> userOpt = userRepo.findById(userId);
            if (userOpt.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "User not found"));
            }

            Post post = postOpt.get();
            User user = userOpt.get();

            Optional<PostLike> existingLike = postLikeRepo.findByPostIdAndUserId(postId, userId);

            boolean isLiked;
            if (existingLike.isPresent()) {
                // Unlike: remove the like
                postLikeRepo.delete(existingLike.get());
                post.setLikesCount(post.getLikesCount() - 1);
                isLiked = false;
            } else {
                // Like: add new like
                PostLike newLike = new PostLike(post, user);
                postLikeRepo.save(newLike);
                post.setLikesCount(post.getLikesCount() + 1);
                isLiked = true;
            }            postRepo.save(post);

            return ResponseEntity.ok(Map.of(
                    "likedByCurrentUser", isLiked,
                    "likesCount", post.getLikesCount()
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error toggling like: " + e.getMessage()));
        }
    }

    // Add comment to a post
    @PostMapping("/posts/{postId}/comments")
    @Transactional
    public ResponseEntity<?> addComment(@PathVariable Integer postId, @RequestBody Map<String, Object> requestBody) {
        try {
            String content = (String) requestBody.get("content");
            Integer userId = (Integer) requestBody.get("userId");

            if (content == null || content.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Comment content is required"));
            }

            if (userId == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "User ID is required"));
            }

            Optional<Post> postOpt = postRepo.findById(postId);
            if (postOpt.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Post not found"));
            }

            Optional<User> userOpt = userRepo.findById(userId);
            if (userOpt.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "User not found"));
            }

            Post post = postOpt.get();
            User user = userOpt.get();

            Comment comment = new Comment(content.trim(), post, user);
            Comment savedComment = commentRepo.save(comment);

            // Update post comments count
            post.setCommentsCount(post.getCommentsCount() + 1);
            postRepo.save(post);

            CommentDTO commentDTO = convertToCommentDTO(savedComment);
            return ResponseEntity.status(HttpStatus.CREATED).body(commentDTO);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error adding comment: " + e.getMessage()));
        }
    }

    // Get comments for a post
    @GetMapping("/posts/{postId}/comments")
    public ResponseEntity<?> getPostComments(@PathVariable Integer postId) {
        try {
            List<Comment> comments = commentRepo.findByPostIdOrderByCreatedAtAsc(postId);
            List<CommentDTO> commentDTOs = comments.stream()
                    .map(this::convertToCommentDTO)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(commentDTOs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error fetching comments: " + e.getMessage()));
        }
    }    // Helper method to convert Post to PostDTO
    private PostDTO convertToPostDTO(Post post, Integer currentUserId) {
        UserDTO authorDTO = new UserDTO(
                post.getUser().getId(),
                post.getUser().getName(),
                post.getUser().getEmail(),
                post.getUser().getAvatarUrl()
        );

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

        // Check if current user has liked this post (only if user is logged in)
        if (currentUserId != null) {
            boolean isLiked = postLikeRepo.existsByPostIdAndUserId(post.getId(), currentUserId);
            postDTO.setLikedByCurrentUser(isLiked);
        } else {
            // User not logged in, set to false
            postDTO.setLikedByCurrentUser(false);
        }

        // Get comments for this post
        List<Comment> comments = commentRepo.findByPostIdOrderByCreatedAtAsc(post.getId());
        List<CommentDTO> commentDTOs = comments.stream()
                .map(this::convertToCommentDTO)
                .collect(Collectors.toList());
        postDTO.setComments(commentDTOs);

        return postDTO;
    }

    // Helper method to convert Comment to CommentDTO
    private CommentDTO convertToCommentDTO(Comment comment) {
        UserDTO authorDTO = new UserDTO(
                comment.getUser().getId(),
                comment.getUser().getName(),
                comment.getUser().getEmail(),
                comment.getUser().getAvatarUrl()
        );

        return new CommentDTO(
                comment.getId(),
                comment.getContent(),
                comment.getCreatedAt(),
                comment.getUpdatedAt(),
                authorDTO,
                comment.getPost().getId()
        );
    }
}
