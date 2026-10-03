package SmartParking.service;

import java.time.LocalDateTime;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import SmartParking.entity.Booking;
import SmartParking.repository.BookingRepository;

@Service
public class BookingExpiryService {

    private final BookingRepository bookingRepository;

    public BookingExpiryService(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    @Scheduled(fixedRate = 60000)
    @Transactional
    public void checkOverstayedBookings() {

        LocalDateTime now = LocalDateTime.now();

        for (Booking booking : bookingRepository.findAll()) {

            if ("CHECKED_IN".equals(booking.getStatus())
                    && booking.getEndTime() != null
                    && booking.getEndTime().isBefore(now)) {

                booking.setStatus("OVERSTAYED");

                if (booking.getParkingSlot() != null) {
                    booking.getParkingSlot().setStatus("OCCUPIED");
                }

                System.out.println(
                    "Booking #" + booking.getId()
                    + " is OVERSTAYED"
                );
            }
        }
    }
}