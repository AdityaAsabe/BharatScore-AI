package com.bharatscore.backend.dto;

public class LoginResponse {

    private String message;
    private String token;
    private Long userId;
    private String name;
    private String email;

    public LoginResponse() {
    }

    public LoginResponse(
            String message,
            String token,
            Long userId,
            String name,
            String email
    ) {
        this.message = message;
        this.token = token;
        this.userId = userId;
        this.name = name;
        this.email = email;
    }

    public String getMessage() {
        return message;
    }

    public String getToken() {
        return token;
    }

    public Long getUserId() {
        return userId;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }
}