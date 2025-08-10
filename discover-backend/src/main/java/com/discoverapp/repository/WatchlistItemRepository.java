package com.discoverapp.repository;

import com.discoverapp.entity.WatchlistItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface WatchlistItemRepository extends JpaRepository<WatchlistItem, Long> {
    
    @Query("SELECT w FROM WatchlistItem w " +
           "JOIN FETCH w.content c " +
           "JOIN FETCH w.user u " +
           "WHERE u.id = :userId")
    List<WatchlistItem> findByUserIdWithContent(@Param("userId") Long userId);
    
    // Alternative query that avoids LOB fields
    @Query("SELECT w.id, w.status, w.addedAt, " +
           "c.id, c.title, c.posterUrl, c.trailerUrl, c.releaseDate, c.ratings, c.type, c.externalId " +
           "FROM WatchlistItem w " +
           "JOIN w.content c " +
           "JOIN w.user u " +
           "WHERE u.id = :userId")
    List<Object[]> findByUserIdWithoutLob(@Param("userId") Long userId);
} 