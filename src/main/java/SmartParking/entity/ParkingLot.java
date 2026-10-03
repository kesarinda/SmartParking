package SmartParking.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity 
public class ParkingLot {
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String location;
    private Integer totalSlots;

    public ParkingLot() {

    }

    public ParkingLot(String name,String location, Integer totalSlots){
        this.name = name;
        this.location = location;
        this.totalSlots = totalSlots;
    }

    public Long getId() {
    return id;
}

public String getName() {
    return name;
}

public void setName(String name) {
    this.name = name;
}

public String getLocation() {
    return location;
}

public void setLocation(String location) {
    this.location = location;
}

public Integer getTotalSlots() {
    return totalSlots;
}

public void setTotalSlots(Integer totalSlots) {
    this.totalSlots = totalSlots;
}
    
}
