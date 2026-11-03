package SmartParking.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import SmartParking.entity.ParkingSlot;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface ParkingSlotRepository extends JpaRepository<ParkingSlot, Long> {

    List<ParkingSlot> findByParkingLotId(Long id);

    List<ParkingSlot> findByParkingLotIdAndStatus(Long id, String status);
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM ParkingSlot p WHERE p.id = :id")
    Optional<ParkingSlot> findByIdForUpdate(@Param("id") Long id);

    boolean existsByParkingLotIdAndSlotNumber(
        Long parkingLotId,
        String slotNumber
    );
}