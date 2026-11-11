package SmartParking.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import SmartParking.entity.ParkingSlot;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface ParkingSlotRepository extends JpaRepository<ParkingSlot, Long> {

    List<ParkingSlot> findByParkingLotId(Long id);

    List<ParkingSlot> findByParkingLotIdAndStatus(Long id, String status);
    @Query(value = "SELECT * FROM parking_slot WHERE id = :id FOR UPDATE", nativeQuery = true)
    Optional<ParkingSlot> findByIdForUpdate(@Param("id") Long id);

    boolean existsByParkingLotIdAndSlotNumber(
        Long parkingLotId,
        String slotNumber
    );
}