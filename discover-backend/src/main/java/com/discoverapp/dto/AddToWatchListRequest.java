package com.discoverapp.dto;

import lombok.Data;

@Data
public class AddToWatchListRequest {
    private Long movieId;
    private String status;
}
