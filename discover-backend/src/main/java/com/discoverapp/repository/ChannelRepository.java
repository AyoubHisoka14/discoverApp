package com.discoverapp.repository;

import com.discoverapp.entity.Channel;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

public interface ChannelRepository extends JpaRepository<Channel, Long> {

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM channel_members WHERE channel_id = :channelId", nativeQuery = true)
    void clearChannelMembers(@Param("channelId") Long channelId);

    @EntityGraph(attributePaths = {"members"})
    @Query("SELECT c FROM Channel c WHERE c.id = :channelId")
    Optional<Channel> findByIdWithMembers(@Param("channelId") Long channelId);

} 