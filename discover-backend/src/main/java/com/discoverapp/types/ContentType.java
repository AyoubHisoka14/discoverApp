package com.discoverapp.types;

import com.fasterxml.jackson.annotation.JsonFormat;

@JsonFormat(shape = JsonFormat.Shape.STRING)
public enum ContentType {
    MOVIE,
    SERIES,
    ANIME;

    public static ContentType fromString(String type) {
        for (ContentType ct : ContentType.values()) {
            if (ct.name().equalsIgnoreCase(type)) {
                return ct;
            }
        }
        throw new IllegalArgumentException("Invalid content type: " + type);
    }
}