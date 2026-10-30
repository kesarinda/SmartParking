package SmartParking.entity;

import java.time.LocalDateTime;
import jakarta.persistence.*;

@Entity
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String status;

    private Double amount;

    private String paymentMethod;
    private String paymentStatus;
    private LocalDateTime actualCheckInTime;
    private LocalDateTime actualCheckOutTime;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "parking_slot_id")
    private ParkingSlot parkingSlot;

    public Booking() {}

    public Long getId() {
        return id;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public ParkingSlot getParkingSlot() {
        return parkingSlot;
    }

    public void setParkingSlot(ParkingSlot parkingSlot) {
        this.parkingSlot = parkingSlot;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }
    public LocalDateTime getActualCheckInTime() {
        return actualCheckInTime;
    }
    public void setActualCheckInTime(LocalDateTime actualCheckInTime) {
        this.actualCheckInTime = actualCheckInTime;
    }
    
    public LocalDateTime getActualCheckOutTime() {
        return actualCheckOutTime;
    }
    public void setActualCheckOutTime(LocalDateTime actualCheckOutTime) {
        this.actualCheckOutTime = actualCheckOutTime;
    }
}
