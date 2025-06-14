package com.example.demo.utils;

import org.springframework.context.ApplicationEvent;

public class DataUpdatedEvent extends ApplicationEvent {
    private final Integer userId;

    public DataUpdatedEvent(Object source, Integer userId) {
        super(source);
        this.userId = userId;
    }

    public Integer getUserId() {
        return userId;
    }
}