package com.discoverapp.controller;

import com.discoverapp.dto.ChannelDto;
import com.discoverapp.dto.CreateReviewRequest;
import com.discoverapp.dto.ReviewDto;
import com.discoverapp.security.JwtUtil;
import com.discoverapp.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {
    @Autowired
    private ReviewService reviewService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/add")
    public ResponseEntity<ReviewDto> add(@RequestBody CreateReviewRequest request) {
        String username = jwtUtil.extractUsername();
        if (username == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        ReviewDto review = reviewService.addReview(username, request);
        return ResponseEntity.ok(review);
    }

    @GetMapping("/movie/{movieId}")
    public List<ReviewDto> list(@PathVariable Long movieId) {
        return reviewService.listReviews(movieId);
    }
} 