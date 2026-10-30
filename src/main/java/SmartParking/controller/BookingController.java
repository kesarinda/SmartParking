package SmartParking.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PutMapping;
import SmartParking.entity.Booking;
import SmartParking.entity.ParkingSlot;
import SmartParking.repository.BookingRepository;
import SmartParking.repository.ParkingSlotRepository;
import SmartParking.repository.UserRepository;
import java.util.List;
import java.util.Optional;
import java.time.Duration;
import java.util.Map;

@RestController 
@RequestMapping("/bookings")
public class BookingController {
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final ParkingSlotRepository parkingSlotRepository;

    public BookingController(BookingRepository bookingRepository,
        UserRepository userRepository,
        ParkingSlotRepository parkingSlotRepository){
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.parkingSlotRepository = parkingSlotRepository;
    }

    @PostMapping 
    public String createBooking(@RequestBody Booking booking){

        if(booking.getStartTime() == null || booking.getEndTime() == null){
            return "Start time and end time are required";
        }

        if(!booking.getStartTime().isBefore(booking.getEndTime())){
            return "Start time must be before end time";
        }

        long minutes = Duration.between(booking.getStartTime(),booking.getEndTime()).toMinutes();
        double hours = minutes / 60.0;
        double parkingFee = hours * 20;
        
        booking.setAmount(parkingFee);
        
        if(!userRepository.existsById(booking.getUser().getId())){
            return "User not found";
        }

        if(!parkingSlotRepository.existsById(booking.getParkingSlot().getId())) {
            return "parking slot not found";
        }

        ParkingSlot slot = parkingSlotRepository
        .findById(booking.getParkingSlot().getId())
        .orElse(null);
        if(!slot.getStatus().equals("AVAILABLE")) {
            return "Parking slot is not available";
        }
        
        boolean alreadyBooked =
    bookingRepository.existsByParkingSlotIdAndStatusInAndStartTimeLessThanAndEndTimeGreaterThan(
        booking.getParkingSlot().getId(),
        List.of("CONFIRMED", "CHECKED_IN", "OVERSTAYED"),
        booking.getEndTime(),
        booking.getStartTime()
    );

        if(alreadyBooked){
            return "Parking slot is already booked for this time";
        }

        booking.setStatus("CONFIRMED");

        Booking savedBooking = bookingRepository.save(booking);
        return "Booking successful. Booking ID: " + savedBooking.getId();
    }

    @GetMapping("/user/{userId}")
    public  List<Booking> getUserBookings(@PathVariable Long userId) {
        return bookingRepository.findByUserId(userId);
    }
    
    @GetMapping 
    public List<Booking> getAllBookings(){
        return bookingRepository.findAll();
    }

    @PutMapping("/{bookingId}/cancel/{userId}")
    public String cancelBooking(
        @PathVariable Long bookingId,
        @PathVariable Long userId) {

    Optional<Booking> booking =
            bookingRepository.findById(bookingId);

    if (booking.isEmpty()) {
        return "Booking not found";
    }

    Booking existingBooking = booking.get();

    if (!existingBooking.getUser().getId().equals(userId)) {
        return "You cannot cancel this booking";
    }

    if (existingBooking.getStatus().equals("CANCELLED")) {
    return "Booking is already cancelled";
}

    existingBooking.setStatus("CANCELLED");

    bookingRepository.save(existingBooking);

    return "Booking cancelled successfully";
}


@PutMapping("/{bookingId}/admin-cancel")
public String adminCancelBooking(
        @PathVariable Long bookingId) {

    Optional<Booking> booking =
            bookingRepository.findById(bookingId);

    if (booking.isEmpty()) {
        return "Booking not found";
    }

    Booking existingBooking =
            booking.get();

    if (existingBooking.getStatus().equals("CANCELLED")) {
        return "Booking is already cancelled";
    }

    existingBooking.setStatus("CANCELLED");

    bookingRepository.save(existingBooking);

    return "Booking cancelled successfully by admin";
}

@GetMapping("/{bookingId}")
public Booking getBookingById(@PathVariable Long bookingId) {

    return bookingRepository.findById(bookingId)
            .orElse(null);
}

@PutMapping("/{bookingId}/payment")
public String makePayment(
        @PathVariable Long bookingId,
        @RequestBody Map<String, String> paymentData) {

    Optional<Booking> booking =
            bookingRepository.findById(bookingId);

    if (booking.isEmpty()) {
        return "Booking not found";
    }

    Booking existingBooking = booking.get();

    String paymentMethod =
            paymentData.get("paymentMethod");

    if (paymentMethod == null || paymentMethod.isBlank()) {
        return "Payment method is required";
    }

    existingBooking.setPaymentMethod(paymentMethod);
    existingBooking.setPaymentStatus("PAID");

    bookingRepository.save(existingBooking);

    return "Payment successful";
}

@PutMapping("/{bookingId}/check-in")
public String checkIn(@PathVariable Long bookingId) {

    Optional<Booking> booking =
            bookingRepository.findById(bookingId);

    if (booking.isEmpty()) {
        return "Booking not found";
    }

    Booking existingBooking = booking.get();

    if (!"CONFIRMED".equals(existingBooking.getStatus())) {
        return "Booking cannot be checked in";
    }

    if (!"PAID".equals(existingBooking.getPaymentStatus())) {
        return "Payment is not completed";
    }

    ParkingSlot slot = existingBooking.getParkingSlot();

    if (slot == null) {
        return "Parking slot not found";
    }

    if (!"AVAILABLE".equals(slot.getStatus())) {
        return "Parking slot is not available";
    }

    slot.setStatus("OCCUPIED");
    parkingSlotRepository.save(slot);

    existingBooking.setStatus("CHECKED_IN");
    bookingRepository.save(existingBooking);

    return "Vehicle checked in successfully";
}

@PutMapping("/{bookingId}/check-out")
public String checkOut(@PathVariable Long bookingId) {

    Optional<Booking> booking =
            bookingRepository.findById(bookingId);

    if (booking.isEmpty()) {
        return "Booking not found";
    }

    Booking existingBooking = booking.get();

    if (!existingBooking.getStatus().equals("CHECKED_IN")
            && !existingBooking.getStatus().equals("OVERSTAYED")) {

        return "Vehicle has not been checked in";
    }

    existingBooking.setStatus("COMPLETED");

    ParkingSlot slot =
            existingBooking.getParkingSlot();

    slot.setStatus("AVAILABLE");

    parkingSlotRepository.save(slot);

    bookingRepository.save(existingBooking);

    return "Vehicle checked out successfully";
}

}