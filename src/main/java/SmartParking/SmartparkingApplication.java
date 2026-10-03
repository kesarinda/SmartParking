package SmartParking;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;


@EnableScheduling
@SpringBootApplication

public class SmartparkingApplication {

	public static void main(String[] args) {
		SpringApplication.run(SmartparkingApplication.class, args);
	}

}
