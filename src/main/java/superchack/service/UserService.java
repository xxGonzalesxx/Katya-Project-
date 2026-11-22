package superchack.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import superchack.entity.Users;
import superchack.repository.UserRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public List<Users> findAll() {
        return  userRepository.findAll();
    }

}
