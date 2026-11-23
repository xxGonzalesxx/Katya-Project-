package superchack.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import superchack.entity.Role;

public record UserRequest(
    @Email
    @NotBlank
    String email,

    @NotBlank
    @Size(min=6)
    String password,

    @NotNull
    Role role
){}
