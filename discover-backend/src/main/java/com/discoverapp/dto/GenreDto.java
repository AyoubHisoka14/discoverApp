package com.discoverapp.dto;

import com.discoverapp.types.ContentType;
import lombok.Data;

@Data
public class GenreDto {
    private Long externalId;
    private ContentType contentType;
    private String name;
}