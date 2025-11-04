package com.example.compiler.security;

import org.springframework.http.HttpStatus;
import org.springframework.lang.Nullable;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Simple interceptor that guards /api/admin/** endpoints using an X-Admin-Token header.
 * The expected token is provided via application property 'admin.token'.
 */
public class AdminTokenInterceptor implements HandlerInterceptor {
    private final String expectedToken;

    public AdminTokenInterceptor(@Nullable String expectedToken) {
        this.expectedToken = expectedToken == null ? "" : expectedToken.trim();
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // If admin token is not configured, reject access to admin endpoints
        if (expectedToken.isEmpty()) {
            response.sendError(HttpStatus.SERVICE_UNAVAILABLE.value(), "Admin token not configured");
            return false;
        }

        String provided = request.getHeader("X-Admin-Token");
        if (provided == null || !provided.equals(expectedToken)) {
            response.sendError(HttpStatus.UNAUTHORIZED.value(), "Unauthorized: invalid admin token");
            return false;
        }
        return true;
    }
}