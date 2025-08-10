package com.discoverapp.repository;

import com.discoverapp.entity.Genre;
import com.discoverapp.types.ContentType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GenreRepository extends JpaRepository<Genre, Long> {

    Optional<Genre> findByExternalIdAndContentType(Long externalId, ContentType contentType);

    List<Genre> findAllByExternalIdInAndContentType(List<Long> externalIds, ContentType contentType);

} 