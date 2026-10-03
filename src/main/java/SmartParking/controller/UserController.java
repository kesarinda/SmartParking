package SmartParking.controller;

import java.util.Optional;
import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

import SmartParking.entity.User;
import SmartParking.repository.UserRepository;

@RestController 
@RequestMapping("/users")
public class UserController {
    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/register")
public String registerUser(@RequestBody User user) {

    if(userRepository.findByEmail(user.getEmail()).isPresent()) {
        return "Email already registered";
    }

    userRepository.save(user);

    return "Registration successful";
}

   @PostMapping("/login")
   public Map<String, Object> loginUser(@RequestBody User user) {
    
    Optional<User> foundUser = userRepository.findByEmail(user.getEmail());
    
    if(foundUser.isPresent()) {
        
        if(foundUser.get().getPassword().equals(user.getPassword())) {
            
            return Map.of(
                "message", "Login successful",
                "id", foundUser.get().getId(),
                "email", foundUser.get().getEmail(),
                "role", foundUser.get().getRole()
            );
        } else {

            return Map.of(
                "message", "Wrong password"
            );
        }
    } else {

        return Map.of(
            "message", "User not found"
        );
    }
} 
@GetMapping
public List<User> getAllUsers() {
    return userRepository.findAll();
}

}
