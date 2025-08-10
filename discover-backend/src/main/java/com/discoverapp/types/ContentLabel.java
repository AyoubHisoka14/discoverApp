package com.discoverapp.types;

import com.fasterxml.jackson.annotation.JsonFormat;

@JsonFormat(shape = JsonFormat.Shape.STRING)
public enum ContentLabel {
    CONTENT,
    TRENDING
}
