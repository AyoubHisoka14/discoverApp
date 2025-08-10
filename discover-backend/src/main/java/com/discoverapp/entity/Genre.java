package com.discoverapp.entity;

import com.discoverapp.types.ContentType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Genre {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long externalId;

    @Column(nullable = false)
    private ContentType contentType;

    @Column(nullable = false)
    private String name;

} 