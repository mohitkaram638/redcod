document.addEventListener("DOMContentLoaded", function () {
    const bookingForm = document.getElementById("bookingForm");
    const statusMessage = document.getElementById("statusMessage");
    const imageInput = document.getElementById("images");

    // 1. Form Submit Logic
    if (bookingForm) {
        bookingForm.addEventListener("submit", async function (e) {
            e.preventDefault();

            // 200MB Max Size Validation
            const maxSizeBytes = 200 * 1024 * 1024;
            let totalSize = 0;

            if (imageInput && imageInput.files) {
                for (let i = 0; i < imageInput.files.length; i++) {
                    totalSize += imageInput.files[i].size;
                }
            }

            if (totalSize > maxSizeBytes) {
                alert("Selected files/folder size is too large! Please keep it under 200MB.");
                return;
            }

            const submitBtn = document.getElementById("submitBtn");
            submitBtn.disabled = true;
            submitBtn.textContent = "Sending Request...";

            const formData = new FormData(bookingForm);

            try {
                const response = await fetch('/api/book', {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    statusMessage.innerHTML = `
                        <div style="background: rgba(74, 222, 128, 0.15); border: 1px solid #4ade80; padding: 15px; border-radius: 8px; margin-top: 10px;">
                            <h4 style="color: #4ade80; margin-bottom: 5px;">✔ Booking Submitted Successfully!</h4>
                            <p style="color: #ddd; font-size: 13px;">Kripya QR code se payment karke Screenshot Chat Now button par click karke WhatsApp par send karein.</p>
                        </div>
                    `;
                    bookingForm.reset();
                } else {
                    alert(result.error || "Something went wrong!");
                }
            } catch (err) {
                console.error(err);
                alert("Server connection error!");
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = "Send Booking Request";
            }
        });
    }

    // 2. Booking History Check Logic
    const searchHistoryBtn = document.getElementById("searchHistoryBtn");
    const searchEmailInput = document.getElementById("searchEmail");
    const historyResult = document.getElementById("historyResult");

    if (searchHistoryBtn) {
        searchHistoryBtn.addEventListener("click", async function () {
            const email = searchEmailInput.value.trim();
            if (!email) {
                historyResult.innerHTML = `<span style="color: #f87171;">Please enter your registered email.</span>`;
                return;
            }

            historyResult.innerHTML = "Searching history...";

            try {
                const response = await fetch(`/api/history?email=${encodeURIComponent(email)}`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.length > 0) {
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
                        historyResult.innerHTML = html;
                    } else {
                        historyResult.innerHTML = "<span style='color: #aaa;'>No bookings found for this email.</span>";
                    }
                } else {
                    historyResult.innerHTML = "<span style='color: #f87171;'>Could not fetch history.</span>";
                }
            } catch (err) {
                historyResult.innerHTML = "<span style='color: #f87171;'>Server connection error.</span>";
            }
        });
    }
});