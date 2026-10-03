package SmartParking.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import SmartParking.entity.ParkingLot;
public interface ParkingLotRepository extends JpaRepository<ParkingLot, Long>{

}