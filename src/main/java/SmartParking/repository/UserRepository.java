package SmartParking.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import SmartParking.entity.User;

public interface UserRepository extends JpaRepository<User, Long>{
    Optional<User> findByEmail(String email);
    
}
