package com.discoverapp.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Channel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String description;

    // LAZY (default for @ManyToOne in most setups): JPA does not fetch the User immediately. It creates a proxy and loads the user only when getCreatedBy() is called.
    @ManyToOne(fetch = FetchType.LAZY)
    private User createdBy;

    @ManyToMany(mappedBy = "joinedChannels")
    private Set<User> members = new HashSet<>();

    @OneToMany(mappedBy = "channel",
            cascade = CascadeType.ALL,
            orphanRemoval = true)
    private Set<Message> messages = new HashSet<>();

    private LocalDateTime createdAt;
} 