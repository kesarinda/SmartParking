package SmartParking.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import SmartParking.entity.Booking;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    boolean existsByParkingSlotIdAndStatusAndStartTimeLessThanAndEndTimeGreaterThan(
            Long parkingSlotId,
            String status,
            LocalDateTime endTime,
            LocalDateTime startTime
    );

    List<Booking> findByParkingSlotParkingLotIdAndStatusAndStartTimeLessThanAndEndTimeGreaterThan(
            Long parkingLotId,
            String status,
            LocalDateTime endTime,
            LocalDateTime startTime
    );

    List<Booking> findByUserId(Long userId);
}