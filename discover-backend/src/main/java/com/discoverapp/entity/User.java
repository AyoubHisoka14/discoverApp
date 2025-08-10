package com.discoverapp.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "users")
public class User {

    // The database will generate this ID automatically when a new row is inserted.
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @ElementCollection(fetch = FetchType.EAGER)
    private Set<String> roles;

    //columnDefinition = "TEXT" tells the database exactly what type to use.
    @Column(columnDefinition = "TEXT")
    private String preferences;

    @OneToMany(mappedBy = "createdBy")
    private Set<Channel> createdChannels;

    @ManyToMany
    @JoinTable(
            name = "channel_members",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "channel_id")
    )
    private Set<Channel> joinedChannels = new HashSet<>();

    private String profileInfo;
    
    @Column(columnDefinition = "TEXT")
    private String bio;
    
    private String avatar;
} 