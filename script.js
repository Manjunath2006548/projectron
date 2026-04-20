// --- DATABASE ---
const projectDB = {
    cs: {
        easy: { price: 200, projects: ["To-Do List", "Weather App", "Portfolio Site"] },
        medium: { price: 500, projects: ["Chat App", "E-com Frontend", "Stock Tracker"] },
        hard: { price: 900, projects: ["Blockchain", "AI Image Recognition", "Neural Net"] }
    },
    ece: {
        easy: { price: 300, projects: ["Logic Gates", "LED Flasher", "Digital Therm"] },
        medium: { price: 600, projects: ["RFID Entry", "Smart Irrigation", "Heart Monitor"] },
        hard: { price: 1200, projects: ["FPGA Processing", "VLSI Design", "Neuromorphic"] }
    },
    eee: {
        easy: { price: 250, projects: ["Inverter", "Battery Charge", "Touch Switch"] },
        medium: { price: 700, projects: ["Smart Meter", "Solar Inverter", "Motor Control"] },
        hard: { price: 1500, projects: ["Smart Grid IoT", "EV Powertrain", "Z-Inverter"] }
    },
    mech: {
        easy: { price: 280, projects: ["Hydraulic Jack", "Wind Turbine", "Gear Assembly"] },
        medium: { price: 650, projects: ["RC Hovercraft", "Robotic Arm", "Solar Car"] },
        hard: { price: 1300, projects: ["Exoskeleton", "VTOL Drone", "CNC Machine"] }
    }
};

const SECRET_UNLOCK_CODE = "1234"; 
const PUBLIC_KEY = "fDwzWQq8Bp1wJxPFH";
const SERVICE_ID = "service_qatupio";
const REG_TEMPLATE_ID = "template_n4636kc";
const ADMIN_ORDER_TEMPLATE = "template_oftbulf";

(function() { emailjs.init(PUBLIC_KEY); })();

let tempUser = {};
let generatedOTP = "";

// --- AUTHENTICATION ---

function handleRegister() {
    const email = document.getElementById('regEmail').value.trim().toLowerCase();
    const name = document.getElementById('regName').value.trim();
    const pass = document.getElementById('regPass').value;

    // Strong Password Logic (8+ chars, Upper, Lower, Number, Special Char)
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/;

    if (email && pass && name) {
        if (!strongPasswordRegex.test(pass)) {
            alert("Weak Password! Requirements:\n- At least 8 characters\n- One uppercase and one lowercase letter\n- One number\n- One special character (!@#$%^&*)");
            return;
        }

        generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
        tempUser = { name, email, pass }; // Store temporarily for verification

        const templateParams = { to_name: name, to_email: email, otp_code: generatedOTP };

        emailjs.send(SERVICE_ID, REG_TEMPLATE_ID, templateParams)
            .then(() => {
                alert("OTP sent to " + email);
                document.getElementById('regForm').style.display = "none";
                document.getElementById('verifySection').style.display = "block";
            })
            .catch(err => alert("Email error. Check console."));
    } else { alert("Fill all fields."); }
}

function finalizeRegistration() {
    const userEnteredOTP = document.getElementById('otpInput').value.trim();
    if (userEnteredOTP === generatedOTP) {
        // Save the user object under the email key
        localStorage.setItem(tempUser.email, JSON.stringify({ 
            name: tempUser.name, 
            password: tempUser.pass 
        }));
        alert("Account Created! You can now login.");
        window.location.href = "login.html";
    } else { alert("Invalid OTP."); }
}

function handleLogin() {
    const email = document.getElementById('loginEmail').value.trim().toLowerCase();
    const pass = document.getElementById('loginPass').value;
    const storedData = localStorage.getItem(email);

    if (storedData) {
        const user = JSON.parse(storedData);
        if (user.password === pass) {
            sessionStorage.setItem('loggedInUser', user.name);
            sessionStorage.setItem('userEmail', email); 
            window.location.href = "dashboard.html";
        } else { alert("Wrong password."); }
    } else { alert("Email not found. Please register."); }
}

// --- DASHBOARD ---

function updateDashboard() {
    const branch = document.getElementById('domainSelect').value;
    const grid = document.getElementById('projectGrid');
    if(!grid) return;
    grid.innerHTML = "";
    if (!branch) return;

    ['easy', 'medium', 'hard'].forEach(level => {
        const data = projectDB[branch][level];
        let section = `
            <div class="tier-section">
                <h2 class="tier-header">${level.toUpperCase()} <span>(₹${data.price})</span></h2>
                <div class="projects-container">
                    ${data.projects.map(p => `
                        <div class="project-card" onclick="openIdea('${p}', '${branch}', '${level}')">
                            <h4>${p}</h4>
                            <span class="view-link">View Details</span>
                        </div>`).join('')}
                </div>
            </div>`;
        grid.innerHTML += section;
    });
}

function openIdea(title, branch, level) {
    const modal = document.getElementById('ideaModal');
    const data = projectDB[branch][level];
    modal.dataset.currentTitle = title;
    modal.dataset.currentPrice = data.price;
    document.getElementById('modalTitle').innerText = title;
    document.getElementById('modalPriceTag').innerText = `Price: ₹${data.price}`;
    showStep('step-payment');
    modal.style.display = "flex";
}

function processPayment() {
    const utr = document.getElementById('utrInput').value.trim();
    const modal = document.getElementById('ideaModal');
    
    if (utr.length !== 12 || isNaN(utr)) {
        return alert("Enter a valid 12-digit UTR.");
    }

    const adminParams = {
        utr_number: utr,
        project_name: modal.dataset.currentTitle,
        user_name: sessionStorage.getItem('loggedInUser'),
        user_email: sessionStorage.getItem('userEmail'),
        price: modal.dataset.currentPrice
    };

    // Send email to Admin
    emailjs.send(SERVICE_ID, ADMIN_ORDER_TEMPLATE, adminParams)
        .then(() => console.log("Admin Notified"))
        .catch(err => console.error("Email failed", err));

    // Show Secret Key step
    showStep('step-verification');
}

function verifyAndGenerate() {
    const userInput = document.getElementById('unlockKey').value.trim();
    if (userInput === SECRET_UNLOCK_CODE) {
        showStep('step-result');
        document.getElementById('aiConceptOutput').innerHTML = "<strong>Blueprint Unlocked!</strong> Preparing files...";
    } else { alert("Invalid Secret Key!"); }
}

function showStep(id) {
    ['step-payment', 'step-verification', 'step-result'].forEach(s => {
        const el = document.getElementById(s);
        if (el) el.style.display = (s === id) ? 'block' : 'none';
    });
}

function closeModal() { document.getElementById('ideaModal').style.display = "none"; }