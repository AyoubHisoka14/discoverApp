package com.discoverapp.repository;

import com.discoverapp.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

public interface MessageRepository extends JpaRepository<Message, Long> {

    @Modifying
    @Transactional
    @Query("UPDATE Message m SET m.parentMessage = null WHERE m.channel.id = :channelId")
    void clearParentMessagesByChannelId(@Param("channelId") Long channelId);

    @Modifying
    @Transactional
    @Query("DELETE FROM Message m WHERE m.channel.id = :channelId")
    void deleteByChannelId(@Param("channelId") Long channelId);
} 