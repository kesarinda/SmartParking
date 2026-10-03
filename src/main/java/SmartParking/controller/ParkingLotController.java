package SmartParking.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import SmartParking.entity.ParkingLot;
import SmartParking.repository.ParkingLotRepository;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PutMapping;

@RestController 
@RequestMapping("/parking-lots")
public class ParkingLotController {
    
    private final ParkingLotRepository parkingLotRepository;

    public ParkingLotController(ParkingLotRepository parkingLotRepository) {
        this.parkingLotRepository = parkingLotRepository;
    }

    @PostMapping
    public ParkingLot addParkingLot(@RequestBody ParkingLot parkinglot) {
        return parkingLotRepository.save(parkinglot);
    }
    
    @GetMapping 
    public List<ParkingLot> getAlParkingLots(){
        return parkingLotRepository.findAll();
    }

    @DeleteMapping("/{id}")
    public String deleteParkingLot(@PathVariable Long id) {

        if(!parkingLotRepository.existsById(id)) {
            return "Parking lot not found";
        }

        parkingLotRepository.deleteById(id);
        return "Parking lot deleted successfully";
    }

    @PutMapping ("/{id}")
    public ParkingLot updateParkingLot(@PathVariable Long id, @RequestBody ParkingLot parkingLot) {

        ParkingLot existingLot = parkingLotRepository.findById(id).orElse(null);

        if(existingLot == null) {
            return null;
        }

        existingLot.setName(parkingLot.getName());
        existingLot.setLocation(parkingLot.getLocation());
        existingLot.setTotalSlots(parkingLot.getTotalSlots());

        return parkingLotRepository.save(existingLot);
    }



}
