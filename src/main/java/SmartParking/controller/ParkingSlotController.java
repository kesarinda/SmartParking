
package SmartParking.controller;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;

import SmartParking.entity.Booking;
import SmartParking.entity.ParkingSlot;
import SmartParking.repository.BookingRepository;
import SmartParking.repository.ParkingSlotRepository;

@RestController
@RequestMapping("/parking-slots")
public class ParkingSlotController {

    private final ParkingSlotRepository parkingSlotRepository;
    private final BookingRepository bookingRepository;

    public ParkingSlotController(
            ParkingSlotRepository parkingSlotRepository,
            BookingRepository bookingRepository) {

        this.parkingSlotRepository = parkingSlotRepository;
        this.bookingRepository = bookingRepository;
    }

    // GET SLOTS OF A PARKING LOT
    @GetMapping("/parking-lots/{id}/slots")
    public List<ParkingSlot> getSlots(@PathVariable Long id) {

        return parkingSlotRepository.findByParkingLotId(id);
    }
    // GET ALL PARKING SLOTS
    @GetMapping
    public List<ParkingSlot> getAllSlots() {
        return parkingSlotRepository.findAll();
    }

    // GET AVAILABLE SLOTS
    @GetMapping("/available")
    public List<ParkingSlot> getAvailableSlots(
            @RequestParam Long parkingLotId,
            @RequestParam LocalDateTime startTime,
            @RequestParam LocalDateTime endTime) {

        List<ParkingSlot> allSlots =
                parkingSlotRepository.findByParkingLotIdAndStatus(
                        parkingLotId,
                        "AVAILABLE");

        List<Booking> bookings =
                bookingRepository
                        .findByParkingSlotParkingLotIdAndStatusAndStartTimeLessThanAndEndTimeGreaterThan(
                                parkingLotId,
                                "CONFIRMED",
                                endTime,
                                startTime);

        List<ParkingSlot> availableSlots = new ArrayList<>();

        for (ParkingSlot slot : allSlots) {

            boolean booked = false;

            for (Booking booking : bookings) {

                if (booking.getParkingSlot()
                        .getId()
                        .equals(slot.getId())) {

                    booked = true;
                    break;
                }
            }

            if (!booked) {
                availableSlots.add(slot);
            }
        }

        return availableSlots;
    }

    // ADD PARKING SLOT
    @PostMapping
    public String addParkingSlot(@RequestBody ParkingSlot parkingSlot) {

        Long parkingLotId =
                parkingSlot.getParkingLot().getId();

        String slotNumber =
                parkingSlot.getSlotNumber().trim();

        // Check duplicate slot
        boolean exists =
                parkingSlotRepository
                        .existsByParkingLotIdAndSlotNumber(
                                parkingLotId,
                                slotNumber);

        if (exists) {
            return "Slot number already exists in this parking lot";
        }

        parkingSlot.setSlotNumber(slotNumber);

        // New slots are AVAILABLE by default
        parkingSlot.setStatus("AVAILABLE");

        parkingSlotRepository.save(parkingSlot);

        return "Parking slot added successfully";
    }

    // UPDATE SLOT STATUS
    @PutMapping("/{slotId}/status")
    public ParkingSlot updateSlotStatus(
            @PathVariable Long slotId,
            @RequestBody String status) {

        ParkingSlot slot =
                parkingSlotRepository
                        .findById(slotId)
                        .orElse(null);

        if (slot == null) {
            return null;
        }

        status = status.replace("\"", "");

        slot.setStatus(status);

        return parkingSlotRepository.save(slot);
    }

    // UPDATE PARKING SLOT
    @PutMapping("/{slotId}")
    public ParkingSlot updateParkingSlot(
            @PathVariable Long slotId,
            @RequestBody ParkingSlot parkingSlot) {

        ParkingSlot existingSlot =
                parkingSlotRepository
                        .findById(slotId)
                        .orElse(null);

        if (existingSlot == null) {
            return null;
        }

        existingSlot.setSlotNumber(
                parkingSlot.getSlotNumber());

        existingSlot.setSlotType(
                parkingSlot.getSlotType());

        return parkingSlotRepository.save(existingSlot);
    }

    // DELETE PARKING SLOT
    @DeleteMapping("/{slotId}")
    public String deleteParkingSlot(
            @PathVariable Long slotId) {

        if (!parkingSlotRepository.existsById(slotId)) {
            return "Parking slot not found";
        }

        parkingSlotRepository.deleteById(slotId);

        return "Parking slot deleted successfully";
    }
}

