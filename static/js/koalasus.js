const stateBox = document.getElementById('stateBox');
const btnStart = document.getElementById('btnStart');
const btnStop  = document.getElementById('btnStop');
const btnKill  = document.getElementById('btnKill');

let hostname = window.location.hostname;

const STATE_URL = "http://"+hostname+":5001/state";
const CMD_URL = "http://"+hostname+":5000";

async function loadState() {
    try {
        const r = await fetch(STATE_URL);
        const d = await r.json();

        // Výpočet progressu
        const current = d.scan_process?.pos || 0;
        const total = d.scan_process?.end || 1;
        let rawProgress = Math.round((current / total) * 100);
        
        // Logika pro "Hotovo" (vstupy nad 100 %)
        const isFinished = rawProgress >= 101;
        const displayProgress = Math.min(rawProgress, 100);

        // UI Update - Stavový box
        stateBox.innerHTML = `
            <div><strong>Zařízení:</strong> ${d.name || 'Neznámé'}</div>
            <div><strong>Stav:</strong> ${isFinished ? 'HOTOVO' : (d.scan_state || '-')}</div>
            <div class="dir-text"><strong>Adresář:</strong> ${d.scan_dir || '-'}</div>
        `;

        // UI Update - Progress bar
        const bar = document.getElementById('progressBar');
        const text = document.getElementById('progressText');
        
        if (bar && text) {
            bar.style.width = `${displayProgress}%`;
            text.textContent = isFinished ? "HOTOVO" : `${displayProgress}%`;
            
            // Barva barvu: zelená pro hotovo, jinak HSL přechod
            const hue = Math.round(displayProgress * 1.2); 
            bar.style.backgroundColor = isFinished ? "#2ecc71" : `hsl(${hue}, 80%, 45%)`;
        }

        // --- LOGIKA TLAČÍTEK ---
        // Start: aktivní vždy, pokud se právě neskenuje
        btnStart.disabled = (d.scan_state === "skenuje");

        // Stop / Resume: 
        if (d.scan_state === "skenuje") {
            btnStop.textContent = "Stop";
            btnStop.disabled = false;
        } else if (displayProgress > 0 && !isFinished) {
            btnStop.textContent = "Resume";
            btnStop.disabled = false;
        } else {
            btnStop.textContent = "Stop";
            btnStop.disabled = true;
        }

        // Kill: aktivní jen při progressu > 0 a pokud není hotovo
        btnKill.disabled = (displayProgress === 0 || isFinished);

    } catch (e) {
        stateBox.innerHTML = '<div><strong>Chyba:</strong> Backend neodpovídá</div>';
    }
}

async function sendCmd(cmd) {

    try {
        await fetch(`${CMD_URL}/${cmd}`, { method: 'GET', mode: 'cors' });
        // Rychlejší refresh po příkazu
        setTimeout(loadState, 300);
    } catch (e) {
        console.error("Příkaz neprošel:", e);
    }
}

if (stateBox) {
    loadState();
    setInterval(loadState, 2000);
}
