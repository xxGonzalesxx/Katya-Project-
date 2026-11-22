package superchack.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import superchack.entity.AdminProfile;

public interface AdminRepository extends JpaRepository<AdminProfile,Long> {
}
