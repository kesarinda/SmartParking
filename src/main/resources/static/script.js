const API = "";
let adminBookingFilter = "ALL";
let selectedLotId = localStorage.getItem("selectedLotId");

function toggleMenu(){
  document.querySelector(".navbar nav")?.classList.toggle("open");
}

function getUser(){
  try{
    return JSON.parse(localStorage.getItem("smartParkingUser"));
  }catch{
    return null;
  }
}

function saveUser(user){
  localStorage.setItem("smartParkingUser", JSON.stringify(user));
}

function fmtDateTime(v){
  return v ? v.replace("T"," ") : "-";
}

async function api(url, options = {}){
  const res = await fetch(API + url, {
    headers:{
      "Content-Type":"application/json",
      ...(options.headers || {})
    },
    ...options
  });

  const text = await res.text();

  let data;

  try{
    data = JSON.parse(text);
  }catch{
    data = text;
  }

  if(!res.ok){
    throw new Error(
      typeof data === "string" ? data : "Request failed"
    );
  }

  return data;
}


/* =========================
   PARKING LOTS
========================= */

async function loadLots(){

  const selects = document.querySelectorAll("#homeLot");
  const list = document.getElementById("lotList");

  try{

    const lots = await api("/parking-lots");

    window.allParkingLots = lots;

    selects.forEach(s => {

      s.innerHTML = '<option value="">Select parking lot</option>';

      lots.forEach(l => {

        const o = document.createElement("option");

        o.value = l.id;
        o.textContent = l.name;

        s.appendChild(o);

      });

    });

    let lotHTML = "";

let totalSlots = 0;
let availableSlots = 0;
let maintenanceSlots = 0;

for(const l of lots){

    const slots = await api(
        `/parking-slots/parking-lots/${l.id}/slots`
    );

    l.slotCount = slots.length;

    totalSlots += slots.length;

    availableSlots +=
        slots.filter(
            slot => slot.status === "AVAILABLE"
        ).length;

    maintenanceSlots +=
        slots.filter(
            slot => slot.status === "MAINTENANCE"
        ).length;


    // Create parking lot cards only if lotList exists
    if(list){

        lotHTML += `
            <article class="lot-card">

                <div class="lot-image">🅿️</div>

                <h3>${escapeHtml(l.name)}</h3>

                <p class="lot-meta">
                    📍 ${escapeHtml(l.location)}
                    <br>
                    Capacity: ${slots.length} slots
                </p>

                <button
                    class="btn primary"
                    onclick="openLot(${l.id})">
                    View Slots
                </button>

                ${
                    getUser()?.role === "ADMIN"
                    ?
                    `
                    <button
                        class="btn"
                        onclick="deleteParkingLot(${l.id})">
                        Delete Parking Lot
                    </button>
                    `
                    :
                    ""
                }

            </article>
        `;
    }
}


// Display parking lots only when lotList exists

if(list){

    list.innerHTML =
        lotHTML ||
        '<div class="loading">No parking lots found.</div>';
}


// Update Admin Dashboard statistics

const adminLots =
    document.getElementById("adminLots");

const adminSlots =
    document.getElementById("adminSlots");

const adminAvailableSlots =
    document.getElementById("adminAvailableSlots");

const adminMaintenanceSlots =
    document.getElementById("adminMaintenanceSlots");


if(adminLots){
    adminLots.textContent = lots.length;
}

if(adminSlots){
    adminSlots.textContent = totalSlots;
}

if(adminAvailableSlots){
    adminAvailableSlots.textContent = availableSlots;
}

if(adminMaintenanceSlots){
    adminMaintenanceSlots.textContent = maintenanceSlots;
}


  }catch(e){

    console.error(e);

    if(list){

      list.innerHTML = `
        <div class="loading">
          Could not connect to the Spring Boot server.
          <br>
          <small>
            Make sure the backend is running on port 8080.
          </small>
        </div>
      `;
    }
  }
}


function displayParkingLots(lots) {

    const list = document.getElementById("lotList");

    if (!list) return;

    let lotHTML = "";

    for (const l of lots) {

        lotHTML += `
            <article class="lot-card">

                <div class="lot-image">🅿️</div>

                <h3>${escapeHtml(l.name)}</h3>

                <p class="lot-meta">
                    📍 ${escapeHtml(l.location)}
                    <br>
                    Capacity: ${l.slotCount} slots
                </p>

                <button
                    class="btn primary"
                    onclick="openLot(${l.id})">
                    View Slots
                </button>

                ${
                    getUser()?.role === "ADMIN"
                    ?
                    `
                    <button
                        class="btn"
                        onclick="deleteParkingLot(${l.id})">
                        Delete Parking Lot
                    </button>
                    `
                    :
                    ""
                }

            </article>
        `;
    }

    list.innerHTML =
        lotHTML ||
        '<div class="loading">No parking lots found.</div>';
}

function filterParkingLots() {

    const search =
        document.getElementById("lotSearch").value
        .toLowerCase()
        .trim();

    const searchWords = search.split(/\s+/);

    const lots = window.allParkingLots || [];

    const filteredLots = lots.filter(lot => {

        const name = String(lot.name || "").toLowerCase();
        const location = String(lot.location || "").toLowerCase();

        return searchWords.some(word =>
            name.includes(word) ||
            location.includes(word)
        );
    });

    displayParkingLots(filteredLots);
}

function checkHomeAvailability(){

  const id = document.getElementById("homeLot").value;

  if(!id){
    alert("Please choose a parking lot.");
    return;
  }

  localStorage.setItem("selectedLotId", id);

  const d = document.getElementById("homeDate").value;
  const s = document.getElementById("homeStart").value;
  const e = document.getElementById("homeEnd").value;

  if(!d){
    alert("Please select a date.");
    return;
  }

  localStorage.setItem("bookingDate", d);
  localStorage.setItem("bookingStart", s);
  localStorage.setItem("bookingEnd", e);

  location.href = "booking.html";
}


function openLot(id){

    localStorage.setItem("selectedLotId", id);

    location.href = "booking.html";
}

/* =========================
   REGISTER
========================= */

async function register(){

    const body = {
        name: regName.value,
        email: regEmail.value,
        password: regPassword.value,
        phone: regPhone.value,
        role: "USER"
    };

    const msg = document.getElementById("registerMessage");

    try{

        const result = await api("/users/register", {
            method:"POST",
            body:JSON.stringify(body)
        });

        msg.textContent = result;

        if(result === "Registration successful"){
            msg.style.color = "green";

            setTimeout(() => {
                location.href = "login.html";
            }, 900);

        }else{
            msg.style.color = "red";
        }

    }catch(e){

        msg.textContent = e.message;
        msg.style.color = "red";

    }
}



/* =========================
   ADD PARKING LOT
========================= */

async function addParkingLot(){

  const name =
    document.getElementById("lotName").value;

  const location =
    document.getElementById("lotLocation").value;

  const totalSlots =
    document.getElementById("lotSlots").value;

  const msg =
    document.getElementById("lotMessage");

  try{

    await api("/parking-lots", {

      method:"POST",

      body:JSON.stringify({
        name:name,
        location:location,
        totalSlots:Number(totalSlots)
      })

    });

    msg.textContent =
      "Parking lot added successfully.";

    msg.style.color = "green";

    document
      .getElementById("parkingLotForm")
      .reset();

    loadLots();

    loadSlotLots();

  }catch(e){

    msg.textContent = e.message;
    msg.style.color = "red";

  }
}


/* =========================
   LOGIN
========================= */

async function login(){

  const msg =
    document.getElementById("loginMessage");

  try{

    const result = await api("/users/login", {

      method:"POST",

      body:JSON.stringify({

        email:loginEmail.value,
        password:loginPassword.value

      })

    });

    msg.textContent = result.message;

    msg.style.color =
      result.message.includes("successful")
        ? "green"
        : "red";


    if(result.message.includes("successful")){

      saveUser({

        id:result.id,
        email:result.email,
        role:result.role

      });

      setTimeout(() => {

        location.href =
          result.role === "ADMIN"
            ? "admin.html"
            : "parking-lots.html";

      },700);

    }

  }catch(e){

    msg.textContent = e.message;
    msg.style.color = "red";

  }
}


/* =========================
   AVAILABLE SLOTS FOR USER
========================= */

async function loadAvailableSlots(){

    const area = document.getElementById("slotArea");

    const lotId =
        localStorage.getItem("selectedLotId");

    const d =
        document.getElementById("bookDate").value;

    const s =
        document.getElementById("bookStart").value;

    const e =
        document.getElementById("bookEnd").value;


    if(!lotId){

        area.innerHTML =
            '<p class="message" style="color:red">Please choose a parking lot first.</p>';

        return;
    }


    if(!d){

        area.innerHTML =
            '<p class="message" style="color:red">Please select a date.</p>';

        return;
    }


    localStorage.setItem("bookingDate", d);
    localStorage.setItem("bookingStart", s);
    localStorage.setItem("bookingEnd", e);


    try{

        // Get all slots
        const allSlots =
            await api(
                `/parking-slots/parking-lots/${lotId}/slots`
            );


        // Get slots available for selected time
        const availableSlots =
            await api(
                `/parking-slots/available?parkingLotId=${lotId}&startTime=${d}T${s}:00&endTime=${d}T${e}:00`
            );


        const availableIds =
            new Set(
                availableSlots.map(slot => slot.id)
            );

          const typeFilter = document.getElementById("slotTypeFilter").value;
          
          const statusFilter = document.getElementById("slotStatusFilter").value;
          
          area.innerHTML = `

            <div class="parking-map">

                <h3 class="slot-title">
                    Parking Slot Map
                </h3>

                <div class="parking-entry">
                    ↓ ENTRY
                </div>

                <div class="parking-lanes">

                    ${
                      allSlots .filter(slot => {
                        
                        const matchesType = !typeFilter || slot.slotType === typeFilter;
                        
                        let currentStatus = "AVAILABLE";
                        
                        if(slot.status === "MAINTENANCE"){
                          
                          currentStatus = "MAINTENANCE";
                        }
                        
                        else if(!availableIds.has(slot.id)){
                          currentStatus = "BOOKED";
                        }
                        
                        const matchesStatus = !statusFilter || currentStatus === statusFilter;
                        
                        return matchesType && matchesStatus;
                      })
                      .map(slot => {
                            let status = "available";
                            let text = "AVAILABLE";

                            if(slot.status === "MAINTENANCE"){

                                status = "maintenance";
                                text = "MAINTENANCE";

                            }
                            else if(!availableIds.has(slot.id)){

                                status = "booked";
                                text = "BOOKED";

                            }


                            if(status === "available"){
                              return `
                              
                              <button class="parking-slot ${status}" onclick="selectParkingSlot( ${slot.id},'${escapeAttr(slot.slotNumber)}' )">
                              <span class="slot-number">
                              ${escapeHtml(slot.slotNumber)}
                              </span>
                              <span class="slot-type">
                              ${escapeHtml(slot.slotType)}
                              </span>

                              <span class="slot-type">
                              ${text}
                              </span>

                            </button>
                             `;
                           }


                            return `
                                <div
                                    class="parking-slot ${status}">

                                    <span class="slot-number">
                                        ${escapeHtml(slot.slotNumber)}
                                    </span>

                                    <span class="slot-type">
                                        ${escapeHtml(slot.slotType)}
                                    </span>

                                    <span class="slot-type">
                                        ${text}
                                    </span>

                                </div>
                            `;

                        }).join("")

                    }

                </div>

                <div class="parking-exit">
                    EXIT ↓
                </div>


                <div class="parking-legend">

                    <div class="legend-item">
                        <span class="legend-box legend-available"></span>
                        Available
                    </div>

                    <div class="legend-item">
                        <span class="legend-box legend-booked"></span>
                        Booked
                    </div>

                    <div class="legend-item">
                        <span class="legend-box legend-maintenance"></span>
                        Maintenance
                    </div>

                </div>

            </div>

        `;

    }
    catch(e){

        area.innerHTML =
            `<p class="message" style="color:red">
                ${escapeHtml(e.message)}
            </p>`;

    }
}

function selectParkingSlot(slotId, slotNumber){

    const message =
        document.getElementById("selectedSlotMessage");

    message.innerHTML = `

        <div class="selected-slot-info">

            <div>
                <strong>Selected Slot</strong>
                <span>${escapeHtml(slotNumber)}</span>
            </div>

            <button
                class="btn primary"
                onclick="confirmBooking(
                    ${slotId},
                    '${escapeAttr(slotNumber)}'
                )">
                Confirm Slot
            </button>

        </div>

    `;

    message.classList.add("show");

    document.querySelectorAll(".parking-slot.available")
        .forEach(slot => {
            slot.classList.remove("selected");
        });

    const selectedSlot =
        [...document.querySelectorAll(".parking-slot.available")]
        .find(slot =>
            slot.querySelector(".slot-number")?.textContent.trim()
            === slotNumber
        );

    if(selectedSlot){
        selectedSlot.classList.add("selected");
    }
}

/* =========================
   CONFIRM BOOKING
========================= */

async function confirmBooking(slotId, slotNumber){

    const user = getUser();

    if(!user){

        alert("Please login before booking.");

        location.href = "login.html";

        return;
    }


    const userId = user.id;


    if(!userId){

        alert(
            "User ID not found. Please login again."
        );

        location.href = "login.html";

        return;
    }


    const d =
        document.getElementById("bookDate").value;

    const s =
        document.getElementById("bookStart").value;

    const e =
        document.getElementById("bookEnd").value;


    if(!d){

        alert("Please select a date.");

        return;
    }


    if(!s || !e){

        alert("Please select booking time.");

        return;
    }


    const selectedSlot =
        confirm(
            `Selected Parking Slot: ${slotNumber}\n\n` +
            `Date: ${d}\n` +
            `Time: ${s} → ${e}\n\n` +
            `Do you want to confirm this booking?`
        );


    if(!selectedSlot){

        return;
    }


    try{

        const result = await api("/bookings", {

            method:"POST",

            body:JSON.stringify({

                startTime:`${d}T${s}:00`,

                endTime:`${d}T${e}:00`,

                user:{
                    id:Number(userId)
                },

                parkingSlot:{
                    id:slotId
                }

            })

        });


        const bookingId =
            result.match(/\d+$/)?.[0];


        if(bookingId){

            // Save booking ID
            localStorage.setItem(
                "lastBookingId",
                bookingId
            );

            // Go to payment page
            location.href =
                "payment.html";

        }else{

            alert(result);

        }


    }catch(err){

        alert(err.message);

    }
}


async function cancelBooking(bookingId, userId){

    const confirmCancel =
        confirm(
            "Are you sure you want to cancel Booking #" +
            bookingId +
            "?"
        );

    if(!confirmCancel){
        return;
    }

    try{

        const result =
            await api(
                `/bookings/${bookingId}/cancel/${userId}`,
                {
                    method:"PUT"
                }
            );

        alert(result);

        // Refresh My Bookings
        loadMyBookings();

    }catch(e){

        alert(e.message);

    }
}


async function loadMyBookings(){

  const box =
    document.getElementById("bookingList");

  if(!box) return;


  const user = getUser();


  if(!user){

    box.innerHTML =
      '<div class="loading">Please <a href="login.html" style="color:#087ff5">login</a> to view your bookings.</div>';

    return;
  }


  const id = user.id;


  if(!id){

    box.innerHTML =
      '<div class="loading">User ID not found. Please login again.</div>';

    return;
  }


  try{

    const bookings =
      await api(`/bookings/user/${id}`);


    box.innerHTML =
      bookings.map(b => `

        <article class="booking-card">

          <div>

            <strong>
              Booking #${b.id}
            </strong>

            <h3>
              ${escapeHtml(
                b.parkingSlot?.parkingLot?.name ||
                "Parking Lot"
              )}
            </h3>

            <p class="muted">
              📍
              ${escapeHtml(
                b.parkingSlot?.parkingLot?.location ||
                "Location not available"
              )}
            </p>

            <p>
              <strong>Parking Slot:</strong>
              ${escapeHtml(
                b.parkingSlot?.slotNumber ||
                "Slot"
              )}
            </p>

            <p>
              <strong>Vehicle Type:</strong>
              ${escapeHtml(
                b.parkingSlot?.slotType ||
                "N/A"
              )}
            </p>

            <p class="muted">
              <strong>Date & Time:</strong><br>
              ${fmtDateTime(b.startTime)}
              →
              ${fmtDateTime(b.endTime)}
            </p>

            <p>
              <strong>Parking Fee:</strong>
              ₹${Number(b.amount || 0).toFixed(2)}
            </p>

            <p>
              <strong>Payment:</strong>
              ${escapeHtml(
                b.paymentStatus || "NOT PAID"
              )}
            </p>

          </div>


          <div>

            <span
              class="status ${String(b.status).toLowerCase()}">

              ${escapeHtml(b.status)}

            </span>


            ${
              b.status === "CONFIRMED"

              ?

              `<br>

              <button
                class="btn primary"
                style="margin-top:10px"
                onclick="checkInBooking(${b.id})">

                Check In

              </button>

              <button
                class="btn secondary"
                style="margin-top:10px"
                onclick="cancelBooking(
                  ${b.id},
                  ${id}
                )">

                Cancel

              </button>`

              :

              b.status === "CHECKED_IN"

              ?

              `<br>

              <button
                class="btn primary"
                style="margin-top:10px"
                onclick="checkOutBooking(${b.id})">

                Check Out

              </button>`

              :

              ""
            }

          </div>

        </article>

      `).join("")

      ||

      '<div class="loading">No bookings found.</div>';

  }
  catch(e){

    box.innerHTML =
      `<div class="loading">
        ${escapeHtml(e.message)}
      </div>`;

  }

}





async function loadBookingConfirmation(){

    const box =
        document.getElementById("confirmationDetails");

    if(!box) return;


    const bookingId =
        localStorage.getItem("lastBookingId");


    if(!bookingId){

        box.innerHTML = `
            <p style="color:red">
                Booking information not found.
            </p>
        `;

        return;
    }


    try{

        const booking =
            await api(`/bookings/${bookingId}`);


        // QR CODE DATA
        const qrData = `
Booking ID: #${booking.id}
Parking Lot: ${booking.parkingSlot.parkingLot.name}
Location: ${booking.parkingSlot.parkingLot.location}
Parking Slot: ${booking.parkingSlot.slotNumber}
Date: ${booking.startTime.split("T")[0]}
Time: ${booking.startTime.split("T")[1].substring(0,5)} - ${booking.endTime.split("T")[1].substring(0,5)}
`;


        box.innerHTML = `

            <div class="confirmation-details">

                <div class="confirmation-row">
                    <strong>Booking ID</strong>
                    <span>#${booking.id}</span>
                </div>


                <div class="confirmation-row">
                    <strong>Parking Lot</strong>
                    <span>
                        ${escapeHtml(
                            booking.parkingSlot.parkingLot.name
                        )}
                    </span>
                </div>


                <div class="confirmation-row">
                    <strong>Location</strong>
                    <span>
                        ${escapeHtml(
                            booking.parkingSlot.parkingLot.location
                        )}
                    </span>
                </div>


                <div class="confirmation-row">
                    <strong>Parking Slot</strong>
                    <span>
                        ${escapeHtml(
                            booking.parkingSlot.slotNumber
                        )}
                    </span>
                </div>


                <div class="confirmation-row">
                    <strong>Vehicle Type</strong>
                    <span>
                        ${escapeHtml(
                            booking.parkingSlot.slotType
                        )}
                    </span>
                </div>


                <div class="confirmation-row">
                    <strong>Date</strong>
                    <span>
                        ${booking.startTime.split("T")[0]}
                    </span>
                </div>


                <div class="confirmation-row">
                    <strong>Time</strong>
                    <span>
                        ${booking.startTime.split("T")[1].substring(0,5)}
                        →
                        ${booking.endTime.split("T")[1].substring(0,5)}
                    </span>
                </div>


                <div class="confirmation-row">
                    <strong>Parking Fee</strong>
                    <span>
                        ₹${Number(booking.amount || 0).toFixed(2)}
                    </span>
                </div>


                <div class="confirmation-row">
                    <strong>Status</strong>
                    <span class="status confirmed">
                        ${escapeHtml(booking.status)}
                    </span>
                </div>


                <div class="confirmation-row">
                    <strong>Payment Method</strong>
                    <span>
                        ${escapeHtml(
                            booking.paymentMethod || "Not Paid"
                        )}
                    </span>
                </div>


                <div class="confirmation-row">
                    <strong>Payment Status</strong>
                    <span class="status confirmed">
                        ${escapeHtml(
                            booking.paymentStatus || "PENDING"
                        )}
                    </span>
                </div>

            </div>

        `;


        // GENERATE QR CODE
        // GENERATE QR CODE

const qrImage = document.getElementById("qrImage");

if (qrImage) {

    // Remove any previously generated QR code
    qrImage.innerHTML = "";

    // Generate only one QR code
    new QRCode(qrImage, {
        text: qrData,
        width: 180,
        height: 180
    });

}
    }
    catch(e){

        box.innerHTML = `
            <p style="color:red">
                ${escapeHtml(e.message)}
            </p>
        `;

    }
}

/* =========================
   ADMIN PARKING LOTS
========================= */

async function updateAdminLots(lots){

    const box =
        document.getElementById("adminLotList");

    if(!box) return;


    // Total parking lots
    document.getElementById("adminLots").textContent =
        lots.length;


    // Counters
    let totalSlots = 0;
    let availableSlots = 0;
    let maintenanceSlots = 0;


    // Get actual slots from every parking lot
    for(const lot of lots){

        const slots =
            await api(
                `/parking-slots/parking-lots/${lot.id}/slots`
            );
            
            const totalSlots = slots.length;
            
            const availableSlots = slots.filter(slot => slot.status === "AVAILABLE").length;
            
            const maintenanceSlots = slots.filter(slot => slot.status === "MAINTENANCE").length;
            
            l.slotCount = slots.length;


        // Count actual slots
        totalSlots += slots.length;


        for(const slot of slots){

            if(slot.status === "AVAILABLE"){
                availableSlots++;
            }

            if(slot.status === "MAINTENANCE"){
                maintenanceSlots++;
            }

        }

    }
    document.getElementById("adminSlots").textContent = totalSlots;
    document.getElementById("adminAvailableSlots").textContent = availableSlots;
    document.getElementById("adminMaintenanceSlots").textContent = maintenanceSlots;


    // Display statistics

    document.getElementById(
        "adminSlots"
    ).textContent = totalSlots;


    document.getElementById(
        "adminAvailableSlots"
    ).textContent = availableSlots;


    document.getElementById(
        "adminMaintenanceSlots"
    ).textContent = maintenanceSlots;


    // Display parking lots

    let lotHTML = "";

    for(const lot of lots){

        const slots =
            await api(
                `/parking-slots/parking-lots/${lot.id}/slots`
            );

        lotHTML += `

            <div class="admin-row">

                <span>

                    <strong>
                        ${escapeHtml(lot.name)}
                    </strong>

                    <br>

                    <small>
                        ${escapeHtml(lot.location)}
                    </small>

                </span>

                <span>
                    ${slots.length} slots
                </span>

                <button
                    class="delete-btn"
                    onclick="deleteParkingLot(${lot.id})">
                    Delete
                </button>

            </div>

        `;
    }

    box.innerHTML = lotHTML;
}


/* =========================
   ADMIN BOOKINGS
========================= */

async function loadAdminBookings(){

  const box =
    document.getElementById(
      "adminBookingList"
    );

  if(!box) return;

  try{

    const data =
      await api("/bookings");

      const filteredData = adminBookingFilter === "ALL" ? data : data.filter(b => b.status === adminBookingFilter);
      
      document.getElementById(
      "adminBookings"
    ).textContent =
      data.length;

      const confirmedCount =
  data.filter(
    b => b.status === "CONFIRMED"
  ).length;

const cancelledCount =
  data.filter(
    b => b.status === "CANCELLED"
  ).length;

document.getElementById(
  "adminConfirmedBookings"
).textContent =
  confirmedCount;

document.getElementById(
  "adminCancelledBookings"
).textContent =
  cancelledCount;

    box.innerHTML =
      `<table class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>User</th>
            <th>Parking Lot</th>
            <th>Slot</th>
            <th>Start</th>
            <th>End</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          ${
            filteredData.map(b => `
              <tr>

                <td>
                  #${b.id}
                </td>

                <td>
                  ${escapeHtml(
                    b.user?.name ||
                    b.user?.id ||
                    "-"
                  )}
                </td>

                <td>
                  ${escapeHtml(
                    b.parkingSlot?.parkingLot?.name ||
                    "-"
                  )}
                </td>

                <td>
                  ${escapeHtml(
                    b.parkingSlot?.slotNumber ||
                    "-"
                  )}
                </td>

                <td>
                  ${fmtDateTime(b.startTime)}
                </td>

                <td>
                  ${fmtDateTime(b.endTime)}
                </td>

                <td>
                  <span
                    class="status ${String(
                      b.status
                    ).toLowerCase()}">

                    ${escapeHtml(b.status)}

                  </span>
                </td>

                <td>

                  ${
                    b.status === "CONFIRMED"

                    ?

                    `<button
                      class="delete-btn"
                      onclick="adminCancelBooking(${b.id})">
                      Cancel
                    </button>`

                    :

                    `<span class="muted">
                      -
                    </span>`
                  }

                </td>

              </tr>

            `).join("")
          }
        </tbody>

      </table>`;

  }catch(e){

    box.innerHTML =
      `<p class="muted">
        ${escapeHtml(e.message)}
      </p>`;

  }
}


function filterAdminBookings(status, button){

    adminBookingFilter = status;

    document
        .querySelectorAll(".filter-btn")
        .forEach(btn => {
            btn.classList.remove("active");
        });

    button.classList.add("active");

    loadAdminBookings();
}
async function adminCancelBooking(bookingId){

  const confirmCancel =
    confirm(
      "Are you sure you want to cancel Booking #" +
      bookingId +
      "?"
    );

  if(!confirmCancel){
    return;
  }

  try{

    const result =
      await api(
        `/bookings/${bookingId}/admin-cancel`,
        {
          method: "PUT"
        }
      );

    alert(result);

    await loadAdminBookings();

  }catch(e){

    alert(e.message);

  }
}



/* =========================
   LOAD PARKING LOTS
   FOR SLOT MANAGEMENT
========================= */

async function loadSlotLots(){

  const select =
    document.getElementById(
      "slotLotSelect"
    );


  if(!select)
    return;


  try{

    const lots =
      await api("/parking-lots");


    select.innerHTML =
      '<option value="">Select parking lot</option>';


    lots.forEach(lot => {

      const option =
        document.createElement("option");


      option.value = lot.id;

      option.textContent = lot.name;


      select.appendChild(option);

    });

  }catch(e){

    select.innerHTML =
      '<option value="">Could not load parking lots</option>';

  }

}


async function loadAdminSlots(){

  const lotId =
    document.getElementById("slotLotSelect").value;

  const box =
    document.getElementById("adminSlotList");

  if(!lotId){

    box.innerHTML =
      '<p class="muted">Select a parking lot to view its slots.</p>';

    return;
  }

  try{

    const slots =
      await api(
        `/parking-slots/parking-lots/${lotId}/slots`
      );

    if(slots.length === 0){

      box.innerHTML =
        '<p class="muted">No slots added yet.</p>';

      return;
    }

    box.innerHTML =
      `<div class="parking-slot-grid">

        ${
          slots.map(slot => `

            <div class="parking-slot-card
              ${String(slot.status).toLowerCase()}">

              <div class="slot-number">
                ${escapeHtml(slot.slotNumber)}
              </div>

              <div class="slot-type">
                ${escapeHtml(slot.slotType)}
              </div>

              <div class="slot-status">
                ${escapeHtml(slot.status)}
              </div>

              <div class="slot-actions">

                <button
                  class="status-btn ${
                    slot.status === "AVAILABLE"
                      ? "active-status"
                      : ""
                  }"
                  onclick="changeSlotStatus(
                    ${slot.id},
                    'AVAILABLE'
                  )">
                  Available
                </button>

                <button
                  class="status-btn ${
                    slot.status === "MAINTENANCE"
                      ? "maintenance-status"
                      : ""
                  }"
                  onclick="changeSlotStatus(
                    ${slot.id},
                    'MAINTENANCE'
                  )">
                  Maintenance
                </button>

                <button
                  class="delete-btn"
                  onclick="deleteParkingSlot(
                    ${slot.id}
                  )">
                  Delete
                </button>

              </div>

            </div>

          `).join("")
        }

      </div>`;

  }catch(e){

    box.innerHTML =
      `<p class="muted">
        ${escapeHtml(e.message)}
      </p>`;

  }
}

/* =========================
   LOAD SLOTS FOR SELECTED LOT
========================= */
async function deleteParkingSlot(slotId){

  const confirmDelete =
    confirm("Are you sure you want to delete this parking slot?");

  if(!confirmDelete){
    return;
  }

  try{

    const result =
      await api(`/parking-slots/${slotId}`, {
        method: "DELETE"
      });

    alert(result);

    loadAdminSlots();

  }catch(e){

    alert(e.message);

  }
}


/* =========================
   ADD PARKING SLOT
========================= */

async function addParkingSlot(){

  const lotId =
    document.getElementById("slotLotSelect").value;

  const slotNumber =
    document.getElementById("slotNumber").value.trim();

  const slotType =
    document.getElementById("slotType").value;

  const msg =
    document.getElementById("slotMessage");

  if(!lotId){
    msg.textContent = "Please select a parking lot.";
    msg.style.color = "red";
    return;
  }

  if(!slotNumber){
    msg.textContent = "Please enter a slot number.";
    msg.style.color = "red";
    return;
  }

  try{

    const result = await api("/parking-slots", {
      method: "POST",
      body: JSON.stringify({
        slotNumber: slotNumber,
        slotType: slotType,
        status: "AVAILABLE",
        parkingLot: {
          id: Number(lotId)
        }
      })
    });

    msg.textContent = result;

    if(result === "Parking slot added successfully"){

      msg.style.color = "green";

      document.getElementById("slotNumber").value = "";

      loadAdminSlots();

    }else{

      msg.style.color = "red";

    }

  }catch(e){

    msg.textContent = e.message;
    msg.style.color = "red";

  }
}


/* =========================
   ESCAPE HTML
========================= */

function escapeHtml(v){

  return String(v ?? "")
    .replace(
      /[&<>"']/g,
      m => ({
        "&":"&amp;",
        "<":"&lt;",
        ">":"&gt;",
        '"':"&quot;",
        "'":"&#039;"
      }[m])
    );

}


function escapeAttr(v){

  return String(v ?? "")
    .replace(/'/g,"\\'");

}


/* =========================
   PAGE LOAD
========================= */

function checkAdminAccess(){

  const user = getUser();

  if(!user){

    alert("Please login first.");

    location.href = "login.html";

    return false;
  }

  if(user.role !== "ADMIN"){

    alert("Access denied. Admin only.");

    location.href = "parking-lots.html";

    return false;
  }

  return true;
}

document.addEventListener(
  "DOMContentLoaded",
  () => {

    updateNavbar();
    loadPaymentDetails();
    loadSelectedLot();
    loadParkingOccupancy();
    // ADD THIS HERE
    if(
      document.getElementById("adminBookingList")
    ){

      if(!checkAdminAccess()){
        return;
      }

    }


    document
      .getElementById("homeDate")
      ?.setAttribute(
        "min",
        new Date()
          .toISOString()
          .split("T")[0]
      );



    const savedDate =
      localStorage.getItem(
        "bookingDate"
      );


    if(
      savedDate &&
      document.getElementById("bookDate")
    ){

      document.getElementById(
        "bookDate"
      ).value = savedDate;

    }


    if(
      document.getElementById("bookStart")
    ){

      document.getElementById(
        "bookStart"
      ).value =
        localStorage.getItem(
          "bookingStart"
        ) || "10:00";

    }


    if(
      document.getElementById("bookEnd")
    ){

      document.getElementById(
        "bookEnd"
      ).value =
        localStorage.getItem(
          "bookingEnd"
        ) || "13:00";

    }


    /* REGISTER */

    if(
      document.getElementById(
        "registerForm"
      )
    ){

      document
        .getElementById("registerForm")
        .addEventListener(
          "submit",
          e => {

            e.preventDefault();

            register();

          }
        );

    }


    /* LOGIN */

    if(
      document.getElementById(
        "loginForm"
      )
    ){

      document
        .getElementById("loginForm")
        .addEventListener(
          "submit",
          e => {

            e.preventDefault();

            login();

          }
        );

    }


    /* ADD PARKING LOT */

    if(
      document.getElementById(
        "parkingLotForm"
      )
    ){

      document
        .getElementById("parkingLotForm")
        .addEventListener(
          "submit",
          e => {

            e.preventDefault();

            addParkingLot();

          }
        );

    }


    /* LOAD PARKING LOTS */

    if(
      document.getElementById("lotList") ||
      document.getElementById("homeLot") ||
      document.getElementById("adminLotList")
    ){

      loadLots();

    }


    /* MY BOOKINGS */

    if(
      document.getElementById(
        "bookingList"
      )
    ){

      loadMyBookings();
    }

    /* BOOKING CONFIRMATION */

if(
    document.getElementById(
        "confirmationDetails"
    )
){

    loadBookingConfirmation();

}


    /* ADMIN BOOKINGS */

    if(
      document.getElementById(
        "adminBookingList"
      )
    ){

      loadAdminBookings();

    }


    /* ADMIN USERS */
    
    if(
      document.getElementById(
        "adminUserList"
      )
    ){
      
      loadAdminUsers();
    }


    /* SLOT MANAGEMENT */

    if(
      document.getElementById(
        "slotLotSelect"
      )
    ){

      loadSlotLots();

      document
        .getElementById("slotLotSelect")
        .addEventListener(
          "change",
          loadAdminSlots
        );

    }

  }
);

async function changeSlotStatus(slotId, status){

  try{

    await api(
      `/parking-slots/${slotId}/status`,
      {
        method:"PUT",
        body:JSON.stringify(status)
      }
    );

    alert(
      "Slot status updated successfully."
    );

    loadAdminSlots();

  }catch(e){

    alert(e.message);

  }

}


/* =========================
   ADMIN USERS
========================= */

/* =========================
   ADMIN USERS
========================= */

async function loadAdminUsers(){

  const box =
    document.getElementById("adminUserList");

  if(!box) return;

  try{

    const users =
      await api("/users");

    if(users.length === 0){

      box.innerHTML =
        '<p class="muted">No users registered.</p>';

      return;
    }

    box.innerHTML = `
      <table class="table">

        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Role</th>
          </tr>
        </thead>

        <tbody>

          ${users.map(user => `

            <tr>

              <td>#${user.id}</td>

              <td>
                ${escapeHtml(user.name)}
              </td>

              <td>
                ${escapeHtml(user.email)}
              </td>

              <td>
                ${escapeHtml(user.phone)}
              </td>

              <td>
                <span class="status">
                  ${escapeHtml(user.role)}
                </span>
              </td>

            </tr>

          `).join("")}

        </tbody>

      </table>
    `;

  }catch(e){

    box.innerHTML =
      `<p class="muted">
        ${escapeHtml(e.message)}
      </p>`;

  }

}


/* =========================
   DELETE PARKING LOT
========================= */

async function deleteParkingLot(lotId){

  const confirmDelete = confirm(
    "Are you sure you want to delete this parking lot?"
  );

  if(!confirmDelete){
    return;
  }

  try{

    const result = await api(
      `/parking-lots/${lotId}`,
      {
        method: "DELETE"
      }
    );

    alert(result);

    if(result === "Parking lot deleted successfully"){

      loadLots();
      loadSlotLots();

    }

  }catch(e){

    alert(e.message);

  }

}


async function loadSelectedLot(){

  const box = document.getElementById("selectedLotInfo");

  if(!box) return;

  const lotId = localStorage.getItem("selectedLotId");

  if(!lotId){

    box.innerHTML = `
      <strong>Parking Lot</strong>
      <p>No parking lot selected.</p>
    `;

    return;
  }

  try{

    const lots = await api("/parking-lots");

    const lot = lots.find(
      l => String(l.id) === String(lotId)
    );

    if(!lot){

      box.innerHTML = `
        <strong>Parking Lot</strong>
        <p>Parking lot not found.</p>
      `;

      return;
    }

    box.innerHTML = `
      <strong>🅿️ ${escapeHtml(lot.name)}</strong>
      <p>📍 ${escapeHtml(lot.location)}</p>
    `;

  }catch(e){

    box.innerHTML = `
      <strong>Parking Lot</strong>
      <p>Could not load parking lot.</p>
    `;

  }
}

function logout(){

    localStorage.removeItem("smartParkingUser");

    localStorage.removeItem("selectedLotId");

    localStorage.removeItem("bookingDate");

    localStorage.removeItem("bookingStart");

    localStorage.removeItem("bookingEnd");

    location.href = "index.html";
}

function logout(){

    localStorage.removeItem("smartParkingUser");
    localStorage.removeItem("selectedLotId");
    localStorage.removeItem("bookingDate");
    localStorage.removeItem("bookingStart");
    localStorage.removeItem("bookingEnd");

    location.href = "index.html";
}

function updateNavbar(){

    const user = getUser();

    const nav = document.querySelector(".navbar nav");

    if(!nav) return;

    if(user){

        if(user.role === "ADMIN"){

            nav.innerHTML = `
                <a href="parking-lots.html">Parking Lots</a>
                <a href="admin.html">Admin Dashboard</a>

                <button
                    type="button"
                    class="theme-toggle"
                    id="themeToggle"
                    onclick="toggleDarkMode()">
                    🌙
                </button>

                <a href="#" onclick="logout()">Logout</a>
            `;

        }else{

            nav.innerHTML = `
                <a href="index.html">Home</a>
                <a href="parking-lots.html">Parking Lots</a>
                <a href="my-bookings.html">My Bookings</a>

                <button
                    type="button"
                    class="theme-toggle"
                    id="themeToggle"
                    onclick="toggleDarkMode()">
                    🌙
                </button>

                <a href="#" onclick="logout()">Logout</a>
            `;
        }

        updateThemeButton();
    }
}


function toggleDarkMode(){

    document.body.classList.toggle("dark-mode");

    const isDark =
        document.body.classList.contains("dark-mode");

    localStorage.setItem(
        "darkMode",
        isDark ? "enabled" : "disabled"
    );

    updateThemeButton();
}

function updateThemeButton(){

    const button =
        document.getElementById("themeToggle");

    if(!button) return;

    if(document.body.classList.contains("dark-mode")){
        button.textContent = "☀️";
    }else{
        button.textContent = "🌙";
    }
}

document.addEventListener("DOMContentLoaded", function(){

    const darkMode =
        localStorage.getItem("darkMode");

    if(darkMode === "enabled"){
        document.body.classList.add("dark-mode");
    }

    updateThemeButton();
    loadBookingConfirmation();
});

async function loadPaymentDetails(){

    const box =
        document.getElementById("paymentBookingDetails");

    if(!box) return;


    const bookingId =
        localStorage.getItem("lastBookingId");


    if(!bookingId){

        box.innerHTML = `
            <p style="color:red">
                Booking not found.
            </p>
        `;

        return;
    }


    try{

        const booking =
            await api(`/bookings/${bookingId}`);


        localStorage.setItem(
            "paymentAmount",
            booking.amount
        );


        box.innerHTML = `

            <div class="payment-summary">

                <div class="confirmation-row">

                    <strong>
                        Booking ID
                    </strong>

                    <span>
                        #${booking.id}
                    </span>

                </div>


                <div class="confirmation-row">

                    <strong>
                        Parking Lot
                    </strong>

                    <span>
                        ${escapeHtml(
                            booking.parkingSlot?.parkingLot?.name ||
                            "Parking Lot"
                        )}
                    </span>

                </div>


                <div class="confirmation-row">

                    <strong>
                        Parking Slot
                    </strong>

                    <span>
                        ${escapeHtml(
                            booking.parkingSlot?.slotNumber ||
                            "N/A"
                        )}
                    </span>

                </div>


                <div class="confirmation-row">

                    <strong>
                        Date
                    </strong>

                    <span>
                        ${booking.startTime.split("T")[0]}
                    </span>

                </div>


                <div class="confirmation-row">

                    <strong>
                        Time
                    </strong>

                    <span>
                        ${booking.startTime
                            .split("T")[1]
                            .substring(0,5)}

                        →

                        ${booking.endTime
                            .split("T")[1]
                            .substring(0,5)}
                    </span>

                </div>


                <div class="payment-total">

                    <span>
                        Total Amount
                    </span>

                    <strong>
                        ₹${Number(
                            booking.amount || 0
                        ).toFixed(2)}
                    </strong>

                </div>

            </div>

        `;

    }
    catch(e){

        box.innerHTML = `
            <p style="color:red">
                ${escapeHtml(e.message)}
            </p>
        `;

    }
}
async function processPayment(){

    console.log("PAYMENT BUTTON CLICKED");

    const bookingId =
        localStorage.getItem("lastBookingId");

    if(!bookingId){
        alert("Booking not found.");
        return;
    }

    const selectedMethod =
        document.querySelector(
            'input[name="paymentMethod"]:checked'
        );

    if(!selectedMethod){
        alert("Please select a payment method.");
        return;
    }

    const method =
        selectedMethod.value;

    const message =
        document.getElementById("paymentMessage");

    message.style.color = "black";

    message.textContent =
        `Processing ${method} payment...`;

    try{

        const result =
            await api(
                `/bookings/${bookingId}/payment`,
                {
                    method: "PUT",

                    body: JSON.stringify({
                        paymentMethod: method
                    })
                }
            );

        if(result === "Payment successful"){

            localStorage.setItem(
                "paymentMethod",
                method
            );

            localStorage.setItem(
                "paymentStatus",
                "PAID"
            );

            message.style.color = "green";

            message.textContent =
                "Payment successful!";

            setTimeout(() => {

                location.href =
                    "booking-confirmation.html";

            }, 1000);

        }else{

            message.style.color = "red";
            message.textContent = result;
        }

    }catch(error){

        message.style.color = "red";
        message.textContent = error.message;
    }
}


async function checkInBooking(bookingId){

  try{

    const result =
      await api(`/bookings/${bookingId}/check-in`, {
        method: "PUT"
      });

    alert(result);

    await loadMyBookings();

  }
  catch(e){

    alert(e.message);

  }

}


async function checkOutBooking(bookingId){

  try{

    const result =
      await api(`/bookings/${bookingId}/check-out`, {
        method: "PUT"
      });

    alert(result);

    await loadMyBookings();

  }
  catch(e){

    alert(e.message);

  }

}

async function loadParkingOccupancy(){

  try{

    const lots = await api("/parking-lots");

    const allSlots = await api("/parking-slots");

    document.getElementById("adminLots").textContent =
      lots.length;

    document.getElementById("adminSlots").textContent =
      allSlots.length;

    document.getElementById("adminAvailableSlots").textContent =
      allSlots.filter(slot => slot.status === "AVAILABLE").length;

    document.getElementById("adminMaintenanceSlots").textContent =
      allSlots.filter(slot => slot.status === "MAINTENANCE").length;

    document.getElementById("adminOccupiedSlots").textContent =
      allSlots.filter(slot => slot.status === "OCCUPIED").length;

  }
  catch(e){

    console.error("Failed to load parking occupancy:", e);

  }

}