package superchack.service;

import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import superchack.dto.UserRequest;
import superchack.dto.UserResponse;
import superchack.entity.Role;
import superchack.entity.Users;
import superchack.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public List<UserResponse> findAll() {
        return userRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    private UserResponse toResponse(Users user) {
        return new UserResponse(
                user.getUserId(),
                user.getEmail(),
                user.getRole(),
                user.getIsActive()
        );
    }

    @Transactional
    public UserResponse create(UserRequest request) {
            if (userRepository.existsByEmail(request.email())) {
                throw new RuntimeException("Email уже создан: "+request.email());
            }
        Users user = new Users();
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole(Role.STUDENT);
        user.setIsActive(true);
        user.setCreateAt(LocalDateTime.now());

        Users saved = userRepository.save(user);
        return toResponse(saved);
    }

}
