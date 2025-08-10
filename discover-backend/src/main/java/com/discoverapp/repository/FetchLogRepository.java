package com.discoverapp.repository;

import com.discoverapp.entity.FetchLog;
import com.discoverapp.types.ContentType;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FetchLogRepository extends JpaRepository<FetchLog, String> {
}
