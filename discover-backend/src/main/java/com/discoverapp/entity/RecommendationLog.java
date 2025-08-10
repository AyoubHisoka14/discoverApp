package com.discoverapp.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecommendationLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY)
    private User user;
    @Lob
    @Column(columnDefinition = "TEXT")
    private String inputDescription;
    @Lob
    @Column(columnDefinition = "TEXT")
    private String recommendedTitles; // JSON or comma-separated
    private LocalDateTime createdAt;
} 