NBDev – Multi-Size HTML5 Display Template (DV360-ready)

🇮🇹 Versione Italiana

Questo progetto è un template HTML5 multi-formato pensato per utilizzo reale in ambienti come DV360 e publisher network.

Non è un semplice banner statico, ma una piccola architettura modulare costruita per essere riutilizzabile, scalabile e pronta per produzione.

L’obiettivo non è creare un’esecuzione one-off, ma una base solida su cui costruire template replicabili per più formati e più campagne.

⸻

✅ Caratteristiche principali
	•	Supporto multi-formato:
	•	300x250
	•	728x90
	•	160x600
	•	Separazione architetturale chiara:
	•	config.js → contenuti e impostazioni per ogni formato
	•	core.js → logica riutilizzabile (exit handling, loop control, polite load, dynamic sizing)
	•	creative.js → timeline di animazione GSAP
	•	Animazioni gestite con GSAP (timeline-based)
	•	Controllo dei loop
	•	Polite load
	•	Gestione click con:
	•	Enabler.exit() se presente
	•	fallback su clickTag (compatibile DV360)
	•	Preview locale tramite preview.html
	•	Script build.sh per generare ZIP pronti per upload

⸻

📁 Struttura del progetto

src/
core.js
creative.js
gsap.min.js
style.base.css

dist/
300x250/
728x90/
160x600/

preview.html
build.sh

⸻

👀 Preview locale

Aprire:

preview.html

Ogni formato può essere aperto anche singolarmente da:

dist//index.html

⸻

📦 Generare ZIP pronti per DV360

Eseguire:

./build.sh

Verranno generati:
	•	zips/nbdev_300x250.zip
	•	zips/nbdev_728x90.zip
	•	zips/nbdev_160x600.zip

Pronti per upload su piattaforma.

⸻

🇬🇧 English Version

This project is a multi-size HTML5 display ad template designed for real production environments such as DV360 and publisher ecosystems.

It is not just a static banner, but a modular architecture built for reuse, scalability and production-readiness.

The goal is to create a reusable template system rather than a single one-off execution.

⸻

✅ Key Features
	•	Multi-size support:
	•	300x250
	•	728x90
	•	160x600
	•	Clear architectural separation:
	•	config.js → per-size content & settings
	•	core.js → reusable logic (exit handling, loop control, polite load, dynamic sizing)
	•	creative.js → GSAP animation timeline
	•	GSAP timeline-based animation
	•	Loop control
	•	Polite load implementation
	•	Click tracking via:
	•	Enabler.exit() when available
	•	clickTag fallback (DV360 compatible)
	•	Local preview using preview.html
	•	build.sh script to generate platform-ready ZIP files

⸻

📦 Build DV360-ready ZIP exports

Run:

./build.sh

This will generate:
	•	zips/nbdev_300x250.zip
	•	zips/nbdev_728x90.zip
	•	zips/nbdev_160x600.zip

Ready for upload to ad platforms.

