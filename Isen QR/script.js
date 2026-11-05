(function () {
  "use strict";

  /* ══════════════════════════════════════
     DATABASE SIMULASI
     ══════════════════════════════════════ */
  const DB = [
    { id: "ID1020038912891", name: "WARUNG BERKAH SEJAHTERA", status: "safe", bank: "PT Bank BCA", risk: "0.8%" },
    { id: "ID9920131299999", name: "TOKO PALSU ELEKTRONIK", status: "danger", reason: "QRIS Tempel (Overlay) terdeteksi", risk: "89.4%" },
    { id: "ID1020038912892", name: "KOPI BORNEO ASLI", status: "safe", bank: "PT Bank Mandiri", risk: "1.2%" },
    { id: "ID8823910293812", name: "REKENING PENIPUAN BUDI", status: "danger", reason: "Rekening dilaporkan 15+ kali", risk: "95.1%" }
  ];

  let currentScanIndex = 0;
  let activeStream = null;
  let currentFacingMode = "environment";

  /* ══════════════════════════════════════
     NAVIGASI HALAMAN
     ══════════════════════════════════════ */
  window.showScreen = function(name) {
    document.querySelectorAll(".screen").forEach(s => s.classList.toggle("active", s.dataset.screen === name));
    document.querySelectorAll("[data-nav]").forEach(n => n.classList.toggle("active", n.dataset.nav === name));
    
    const titles = {
      "dashboard": { t: "Dashboard", s: "Pantau perlindungan QRIS" },
      "cek-qris":  { t: "Cek QRIS",  s: "Verifikasi payload forensik" },
      "safe-qris": { t: "Safe QRIS", s: "Pusat laporan komunitas" },
      "isen-map":  { t: "ISEN Map",  s: "Peta risiko real-time" }
    };
    if (titles[name]) {
      document.getElementById("page-title").textContent = titles[name].t;
      document.getElementById("page-subtitle").textContent = titles[name].s;
    }
    
    if (name === 'cek-qris') {
      startCamera(); 
    } else {
      stopCamera();
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Listener Navigasi
  document.addEventListener("click", e => {
    const nav = e.target.closest("[data-nav]");
    if (nav) { e.preventDefault(); showScreen(nav.dataset.nav); }
  });

  /* ══════════════════════════════════════
     KAMERA & SCANNER
     ══════════════════════════════════════ */
  const videoEl = document.getElementById("camera-feed");

  async function startCamera() {
    stopCamera();
    try {
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { exact: currentFacingMode } } });
      } catch (err) {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }
      videoEl.srcObject = stream;
      videoEl.classList.add("active");
      await videoEl.play().catch(()=>{});
      activeStream = stream;
    } catch (err) {
      console.warn("Kamera gagal/diblokir");
    }
  }

  function stopCamera() {
    if (activeStream) {
      activeStream.getTracks().forEach(track => track.stop());
      activeStream = null;
      videoEl.srcObject = null;
      videoEl.classList.remove("active");
    }
  }

  document.getElementById("switch-camera-btn")?.addEventListener("click", () => {
    currentFacingMode = currentFacingMode === "environment" ? "user" : "environment";
    startCamera();
  });

  /* ══════════════════════════════════════
     SIMULASI SCAN
     ══════════════════════════════════════ */
  window.simulateScan = function() {
    const btn = document.getElementById("btn-simulate");
    const badge = document.getElementById("scan-status-badge");
    
    document.getElementById("ui-empty").classList.add("hidden");
    document.getElementById("ui-safe").classList.add("hidden");
    document.getElementById("ui-alert").classList.add("hidden");
    
    if (btn) {
      btn.innerHTML = `<span class="material-symbols-outlined" style="font-size:18px;animation:spin 1s linear infinite;">sync</span> Memindai...`;
      btn.disabled = true;
    }
    if (badge) {
      badge.textContent = "Mencocokkan...";
      badge.className = "badge badge-sky";
    }

    setTimeout(() => {
      const record = DB[currentScanIndex];
      currentScanIndex = (currentScanIndex + 1) % DB.length; 
      
      if (btn) {
        btn.innerHTML = `<span class="material-symbols-outlined" style="font-size:18px;">center_focus_strong</span> Simulasikan Scan`;
        btn.disabled = false;
      }

      if (record.status === "safe") {
        if(document.getElementById("res-name")) document.getElementById("res-name").textContent = record.name;
        if(document.getElementById("res-nmid")) document.getElementById("res-nmid").textContent = `NMID: ${record.id}`;
        if(document.getElementById("res-bank")) document.getElementById("res-bank").textContent = record.bank;
        if(document.getElementById("res-risk")) document.getElementById("res-risk").textContent = record.risk;
        
        document.getElementById("ui-safe").classList.remove("hidden");
        if (badge) {
          badge.textContent = "Lulus";
          badge.className = "badge badge-green";
        }
      } else {
        if(document.getElementById("alert-title")) document.getElementById("alert-title").textContent = record.name;
        if(document.getElementById("alert-desc")) document.getElementById("alert-desc").textContent = `Anomali: ${record.reason}`;
        
        document.getElementById("ui-alert").classList.remove("hidden");
        if (badge) {
          badge.textContent = "Bahaya";
          badge.className = "badge badge-red-solid";
        }
      }
    }, 1000);
  };

  window.resetScan = function() {
    document.getElementById("ui-empty")?.classList.remove("hidden");
    document.getElementById("ui-safe")?.classList.add("hidden");
    document.getElementById("ui-alert")?.classList.add("hidden");
    const badge = document.getElementById("scan-status-badge");
    if(badge) {
      badge.textContent = "Menunggu Scan...";
      badge.className = "badge badge-slate";
    }
  };

  /* ══════════════════════════════════════
     FUNGSI TOMBOL (BATALKAN & LANJUT)
     ══════════════════════════════════════ */
  // 1. Tombol Batalkan & Kunci
  document.getElementById("btn-cancel")?.addEventListener("click", function() {
    alert("✅ PEMBAYARAN DIBATALKAN!\n\nSesi transaksi telah dikunci untuk mencegah penipuan. Jangan transfer dana ke rekening tersebut.");
    resetScan(); // Kembalikan ke tampilan awal
  });

  // 2. Tombol Lanjutkan Transaksi
  document.getElementById("btn-lanjut")?.addEventListener("click", function() {
    alert("🔒 MENGHUBUNGKAN KE GATEWAY...\n\nTransaksi aman, Anda akan diarahkan ke aplikasi m-Banking.");
  });

  /* ══════════════════════════════════════
     FORM SAFE QRIS
     ══════════════════════════════════════ */
  window.pickModus = function(btn) {
    document.querySelectorAll(".modus-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  };

  window.handleFile = function(input) {
    if (input.files && input.files[0]) {
      document.getElementById("upload-idle")?.classList.add("hidden");
      const preview = document.getElementById("upload-preview");
      if(preview) {
        preview.classList.remove("hidden");
        preview.style.display = "flex";
      }
      const fileName = document.getElementById("file-name");
      if(fileName) fileName.textContent = input.files[0].name;
      
      const reader = new FileReader();
      reader.onload = e => { 
        const img = document.getElementById("preview-img");
        if(img) img.src = e.target.result; 
      };
      reader.readAsDataURL(input.files[0]);
    }
  };

  window.submitReport = function() {
    const btn = document.getElementById("submit-btn");
    if(btn) {
      btn.disabled = true;
      btn.innerHTML = `<span class="material-symbols-outlined" style="animation:spin 1s linear infinite">refresh</span> Mengirim...`;
    }
    
    setTimeout(() => {
      if(btn) btn.classList.add("hidden");
      document.getElementById("success-box")?.classList.remove("hidden");
    }, 1000);
  };

  /* ══════════════════════════════════════
     PETA (FILTER & MARKER)
     ══════════════════════════════════════ */
  const MARKERS = {
    pasar: { title: "Pasar Besar", badge: "Zona Bahaya", badgeClass: "badge-red-solid", icon: "warning", iconClass: "red", modus: "Stiker QRIS Ditumpuk", count: "5 Korban", status: "Penyisiran Satgas", note: "Bahaya! Cek kesesuaian", noteClass: "red" },
    bundaran: { title: "Bundaran Besar", badge: "Waspada", badgeClass: "badge-amber", icon: "notification_important", iconClass: "amber", modus: "Nama Merchant Serupa", count: "2 Laporan", status: "Verifikasi Auditor", note: "Berhati-hati", noteClass: "amber" },
    flamboyan: { title: "Pusat Kuliner Flamboyan", badge: "Zona Aman", badgeClass: "badge-green", icon: "verified", iconClass: "green", modus: "QRIS Bersegel Hologram", count: "34 Merchant", status: "Aman", note: "Aman untuk transaksi", noteClass: "green" }
  };

  window.pickMarker = function(id) {
    const m = MARKERS[id];
    if (!m) return;
    if(document.getElementById("insp-title")) document.getElementById("insp-title").textContent = m.title;
    
    const badge = document.getElementById("insp-badge");
    if(badge) {
      badge.textContent = m.badge;
      badge.className = `badge ${m.badgeClass}`;
    }
    
    if(document.getElementById("insp-icon")) document.getElementById("insp-icon").className = `inspector-icon ${m.iconClass}`;
    if(document.getElementById("insp-symbol")) document.getElementById("insp-symbol").textContent = m.icon;
    if(document.getElementById("insp-modus")) document.getElementById("insp-modus").textContent = m.modus;
    if(document.getElementById("insp-count")) document.getElementById("insp-count").textContent = m.count;
    if(document.getElementById("insp-status")) document.getElementById("insp-status").textContent = m.status;
    if(document.getElementById("insp-note-text")) document.getElementById("insp-note-text").textContent = m.note;
    if(document.getElementById("insp-note")) document.getElementById("insp-note").className = `inspector-note ${m.noteClass}`;
  };

  window.applyFilter = function(btn, type) {
    document.querySelectorAll(".chip-filter").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    
    document.querySelectorAll(".map-marker").forEach(marker => {
      const status = marker.dataset.status;
      marker.classList.toggle("hidden-marker", (type !== "all" && status !== type));
    });
    
    if (type === "all" || type === "danger") pickMarker('pasar');
    else if (type === "warning") pickMarker('bundaran');
    else if (type === "safe") pickMarker('flamboyan');
  };

  /* ══════════════════════════════════════
     ANIMASI LASER
     ══════════════════════════════════════ */
  const laser = document.getElementById("laser");
  if (laser) {
    let pos = 0, dir = 1, max = 210, min = 10;
    (function step() {
      pos += dir * 2.2;
      if (pos >= max) dir = -1; else if (pos <= min) dir = 1;
      laser.style.transform = `translateY(${pos}px)`;
      requestAnimationFrame(step);
    })();
  }

  // Jalankan halaman pertama kali dibuka
  showScreen("dashboard");

})();