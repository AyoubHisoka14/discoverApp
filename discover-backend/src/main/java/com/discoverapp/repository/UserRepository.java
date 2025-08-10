package com.discoverapp.repository;

import com.discoverapp.entity.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.List;

// It manages the entity User with a primary key of type Long
// JpaRepository provides all basic CRUD operations, like: findAll(), save() and delete()
public interface UserRepository extends JpaRepository<User, Long> {

    // Spring automatically generates the query: “SELECT u FROM User u WHERE u.username = :username”
    // Returns an Optional<User> — meaning: If a user is found, return it. If not, return Optional.empty() so you avoid null
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);

    @Query("SELECT COUNT (u) FROM User u JOIN u.joinedChannels c WHERE c.id = :channelId")
    int countUsersByChannelId(@Param("channelId") Long channelId);

    @Transactional
    @EntityGraph(attributePaths = {"joinedChannels"})
    @Query("SELECT u FROM User u WHERE u.username = :username")
    Optional<User> findByUsernameWithChannels(@Param("username") String username);
} 