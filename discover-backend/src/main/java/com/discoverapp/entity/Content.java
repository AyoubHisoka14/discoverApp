package com.discoverapp.entity;

import com.discoverapp.types.ContentLabel;
import com.discoverapp.types.ContentType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Content {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    
    @Lob
    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "content_genre",
            joinColumns = @JoinColumn(name = "content_id"),
            inverseJoinColumns = @JoinColumn(name = "genre_id")
    )
    private Set<Genre> genres = new HashSet<>();

    private String posterUrl;

    private String backdropPath;

    private String trailerUrl;

    private LocalDate releaseDate;
    
    @Lob
    @Column(columnDefinition = "TEXT")
    private String castList;
    
    private Double ratings;
    
    @Enumerated(EnumType.STRING)
    private ContentType type;

    @Enumerated(EnumType.STRING)
    private ContentLabel label;
    
    private String externalId;

    // New fields for enhanced content details
    @ElementCollection
    @CollectionTable(name = "content_image_urls", joinColumns = @JoinColumn(name = "content_id"))
    @Column(name = "image_url", columnDefinition = "TEXT")
    private List<String> imageUrls;

    @ElementCollection
    @CollectionTable(name = "content_recommended_ids", joinColumns = @JoinColumn(name = "content_id"))
    @Column(name = "recommended_id")
    private List<String> recommendedContentIds;

    private String trailerId; // For storing trailer ID from external APIs
} 