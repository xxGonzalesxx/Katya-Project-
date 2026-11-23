package superchack.dto;

import superchack.entity.Role;

public record UserResponse (
        Long userId,
        String email,
        Role role,
        Boolean isActive
){}