package com.discoverapp.service;

import com.discoverapp.dto.CreateReviewRequest;
import com.discoverapp.dto.ReviewDto;
import com.discoverapp.entity.Content;
import com.discoverapp.entity.Review;
import com.discoverapp.entity.User;
import com.discoverapp.repository.ContentRepository;
import com.discoverapp.repository.ReviewRepository;
import com.discoverapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ReviewService {
    @Autowired
    private ReviewRepository reviewRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ContentRepository contentRepository;

    public ReviewDto addReview(String username, CreateReviewRequest dto) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        Optional<Content> contentOpt = contentRepository.findById(dto.getMovieId());
        if (userOpt.isEmpty() || contentOpt.isEmpty()) return null;
        Review review = Review.builder()
                .user(userOpt.get())
                .content(contentOpt.get())
                .rating(dto.getRating())
                .reviewText(dto.getReviewText())
                .createdAt(LocalDateTime.now())
                .build();
        reviewRepository.save(review);
        return toDto(review);
    }

    public List<ReviewDto> listReviews(Long contentId) {
        return reviewRepository.findAll().stream()
                .filter(r -> r.getContent() != null && r.getContent().getId().equals(contentId))
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    private ReviewDto toDto(Review review) {
        ReviewDto dto = new ReviewDto();
        dto.setId(review.getId());
        dto.setUserId(review.getUser() != null ? review.getUser().getId() : null);
        dto.setContentId(review.getContent() != null ? review.getContent().getId() : null);
        dto.setRating(review.getRating());
        dto.setReviewText(review.getReviewText());
        dto.setCreatedAt(review.getCreatedAt());
        return dto;
    }
} 