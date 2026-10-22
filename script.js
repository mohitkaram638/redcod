document.addEventListener("DOMContentLoaded", function () {
    const bookingForm = document.getElementById("bookingForm");
    const statusMessage = document.getElementById("statusMessage");
    const imageInput = document.getElementById("images");
    const submitBtn = document.getElementById("submitBtn");

    // 1. Form Submit Logic
    if (bookingForm) {
        bookingForm.addEventListener("submit", async function (e) {
            e.preventDefault();

            // 200MB Max Size Validation
            const maxSizeBytes = 200 * 1024 * 1024;
            let totalSize = 0;

            if (imageInput && imageInput.files && imageInput.files.length > 0) {
                for (let i = 0; i < imageInput.files.length; i++) {
                    totalSize += imageInput.files[i].size;
                }
            }

            if (totalSize > maxSizeBytes) {
                alert("Selected files size is too large! Please keep it under 200MB.");
                return;
            }

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = "Sending Request...";
            }

            const formData = new FormData(bookingForm);

            try {
                // [!] यहाँ अपने Render का पूरा URL जोड़ें (उदाहरण के लिए: 'https://redcode.onrender.com/api/book')
                const response = await fetch('https://redcod.onrender.com/api/booking', {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    if (statusMessage) {
                        statusMessage.innerHTML = `
                            <div style="background: rgba(74, 222, 128, 0.15); border: 1px solid #4ade80; padding: 15px; border-radius: 8px; margin-top: 10px;">
                                <h4 style="color: #4ade80; margin-bottom: 5px; margin-top: 0;">✔ Booking Submitted Successfully!</h4>
                                <p style="color: #ddd; font-size: 13px; margin: 0;">Kripya QR code se payment karke Screenshot Chat Now button par click karke WhatsApp par send karein.</p>
                            </div>
                        `;
                    }
                    bookingForm.reset();
                } else {
                    alert(result.message || result.error || "Something went wrong!");
                }
            } catch (err) {
                console.error("Form submit error:", err);
                alert("Server connection error! Check server logs.");
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = "Send Booking Request";
                }
            }
        });
    }

    // 2. Booking History Check Logic
    const searchHistoryBtn = document.getElementById("searchHistoryBtn");
    const searchEmailInput = document.getElementById("searchEmail");
    const historyResult = document.getElementById("historyResult");

    if (searchHistoryBtn && searchEmailInput) {
        searchHistoryBtn.addEventListener("click", async function () {
            const email = searchEmailInput.value.trim();
            if (!email) {
                if (historyResult) historyResult.innerHTML = `<span style="color: #f87171;">Please enter your registered email.</span>`;
                return;
            }

            if (historyResult) historyResult.innerHTML = "Searching history...";

            try {
                // [!] यहाँ भी अपने Render का पूरा URL जोड़ें (उदाहरण के लिए: 'https://redcode.onrender.com/api/history?email=...')
                const response = await fetch(`https://redcod.onrender.com/api/history?email=${encodeURIComponent(email)}`);
                if (response.ok) {
                    const data = await response.json();
                    if (data && data.length > 0) {
                        let html = "<ul style='list-style: none; padding: 0;'>";
                        data.forEach(item => {
                            let statusColor = "#f59e0b"; // Yellow for Pending
                            if (item.status === "Approved") statusColor = "#4ade80"; // Green
                            if (item.status === "Rejected") statusColor = "#f87171"; // Red
                            if (item.status === "In Progress") statusColor = "#60a5fa"; // Blue

                            html += `<li style='background: #18181c; padding: 12px; margin-bottom: 8px; border-radius: 8px; border: 1px solid #333;'>
                                <b>Title:</b> ${item.videoTitle || 'N/A'}<br>
                                <b>Status:</b> <span style="color: ${statusColor}; font-weight: bold;">${item.status || 'Pending'}</span>
                            </li>`;
                        });
                        html += "</ul>";
                        if (historyResult) historyResult.innerHTML = html;
                    } else {
                        if (historyResult) historyResult.innerHTML = "<span style='color: #aaa;'>No bookings found for this email.</span>";
                    }
                } else {
                    if (historyResult) historyResult.innerHTML = "<span style='color: #f87171;'>Could not fetch history.</span>";
                }
            } catch (err) {
                if (historyResult) historyResult.innerHTML = "<span style='color: #f87171;'>Server connection error.</span>";
            }
        });
    }
});