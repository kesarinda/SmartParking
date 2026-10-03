package SmartParking.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import SmartParking.entity.ParkingSlot;

public interface ParkingSlotRepository extends JpaRepository<ParkingSlot, Long> {

    List<ParkingSlot> findByParkingLotId(Long id);

    List<ParkingSlot> findByParkingLotIdAndStatus(Long id, String status);

    boolean existsByParkingLotIdAndSlotNumber(
        Long parkingLotId,
        String slotNumber
    );
}