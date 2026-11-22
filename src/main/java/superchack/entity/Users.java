package superchack.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
public class Users {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)

    @Column(name="user_id")
    private Long userId;

    @Column(name="email",nullable = false,unique = true,length=255)
    private String email;

    @JsonIgnore
    @Column(name="password",nullable = false,columnDefinition="text")
    private String password;

    @Column(name="is_active")
    private Boolean isActive;

    @Column(name="create_at")
    private LocalDateTime createAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 20)
    private Role role;
}
