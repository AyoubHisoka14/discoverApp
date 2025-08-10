package com.discoverapp.types;

import com.fasterxml.jackson.annotation.JsonFormat;

@JsonFormat(shape = JsonFormat.Shape.STRING)
public enum LogContentType {
    MOVIE,
    SERIES,
    ANIME,
    TRENDING_MOVIES,
    TRENDING_SERIES,
    TRENDING_ANIME;

}