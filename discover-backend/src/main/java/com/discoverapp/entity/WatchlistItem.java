package com.discoverapp.entity;

import com.discoverapp.types.WatchListItemStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WatchlistItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    private Content content;

    @Enumerated(EnumType.STRING)
    private WatchListItemStatus status;

    private LocalDateTime addedAt;
} 