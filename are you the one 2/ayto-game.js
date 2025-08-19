class AYTOGame {
    constructor() {
        this.week = 1;
        this.maxWeeks = 10;
        this.money = 1000000;
        this.perfectMatches = [];
        this.currentPairs = [];
        this.selectedParticipants = [];
        this.truthBoothUsed = false;
        this.targetPairCount = 10; // Standard: 10 Paare
        
        this.participants = [
            // Männer
            { id: 1, name: "Michael", gender: "male", image: "https://via.placeholder.com/60x60/4a90e2/ffffff?text=M" },
            { id: 2, name: "Arne", gender: "male", image: "https://via.placeholder.com/60x60/4a90e2/ffffff?text=A" },
            { id: 3, name: "John", gender: "male", image: "https://via.placeholder.com/60x60/4a90e2/ffffff?text=J" },
            { id: 4, name: "Kai", gender: "male", image: "https://via.placeholder.com/60x60/4a90e2/ffffff?text=K" },
            { id: 5, name: "Mathäi", gender: "male", image: "https://via.placeholder.com/60x60/4a90e2/ffffff?text=M" },
            { id: 6, name: "ole", gender: "male", image: "https://via.placeholder.com/60x60/4a90e2/ffffff?text=O" },
            { id: 7, name: "Sören", gender: "male", image: "https://via.placeholder.com/60x60/4a90e2/ffffff?text=S" },
            { id: 8, name: "Jannis", gender: "male", image: "https://via.placeholder.com/60x60/4a90e2/ffffff?text=J" },
            { id: 9, name: "Timon", gender: "male", image: "https://via.placeholder.com/60x60/4a90e2/ffffff?text=T" },
            { id: 10, name: "Max", gender: "male", image: "https://via.placeholder.com/60x60/4a90e2/ffffff?text=M" },
            
            // Frauen
            { id: 11, name: "Lisa B", gender: "female", image: "https://via.placeholder.com/60x60/ff69b4/ffffff?text=L" },
            { id: 12, name: "Sina", gender: "female", image: "https://via.placeholder.com/60x60/ff69b4/ffffff?text=S" },
            { id: 13, name: "Rebecca", gender: "female", image: "https://via.placeholder.com/60x60/ff69b4/ffffff?text=R" },
            { id: 14, name: "Laura", gender: "female", image: "https://via.placeholder.com/60x60/ff69b4/ffffff?text=L" },
            { id: 15, name: "Tim", gender: "female", image: "https://via.placeholder.com/60x60/ff69b4/ffffff?text=T" },
            { id: 16, name: "Lisa R", gender: "female", image: "https://via.placeholder.com/60x60/ff69b4/ffffff?text=L" },
            { id: 17, name: "Kimi", gender: "female", image: "https://via.placeholder.com/60x60/ff69b4/ffffff?text=K" },
            { id: 18, name: "Svenja", gender: "female", image: "https://via.placeholder.com/60x60/ff69b4/ffffff?text=S" },
            { id: 19, name: "mona", gender: "female", image: "https://via.placeholder.com/60x60/ff69b4/ffffff?text=M" },
            { id: 20, name: "Kathy", gender: "female", image: "https://via.placeholder.com/60x60/ff69b4/ffffff?text=K" }
        ];
        
        this.init();
    }
    
    init() {
        this.generatePerfectMatches();
        this.bindEvents();
        this.renderParticipants();
        this.renderManagementParticipants();
    }
    
    generatePerfectMatches() {
        const males = this.participants.filter(p => p.gender === "male");
        const females = this.participants.filter(p => p.gender === "female");
        
        // Zufällige Perfect Matches generieren
        const shuffledMales = [...males].sort(() => Math.random() - 0.5);
        const shuffledFemales = [...females].sort(() => Math.random() - 0.5);
        
        this.perfectMatches = [];
        for (let i = 0; i < this.targetPairCount; i++) {
            this.perfectMatches.push({
                male: shuffledMales[i],
                female: shuffledFemales[i]
            });
        }
    }
    
    bindEvents() {
        document.getElementById('start-game-btn').addEventListener('click', () => {
            this.startGame();
        });
        
        document.getElementById('match-ceremony-btn').addEventListener('click', () => {
            this.showMatchCeremony();
        });
        
        document.getElementById('truth-booth-btn').addEventListener('click', () => {
            this.showTruthBooth();
        });
        
        document.getElementById('reset-pairs-btn').addEventListener('click', () => {
            this.resetPairs();
        });
        
        document.getElementById('close-ceremony-btn').addEventListener('click', () => {
            this.closeModal('match-ceremony-modal');
        });
        
        document.getElementById('close-truth-booth-btn').addEventListener('click', () => {
            this.closeModal('truth-booth-modal');
        });
        
        document.getElementById('new-game-btn').addEventListener('click', () => {
            this.newGame();
        });
        
        document.getElementById('solution-btn').addEventListener('click', () => {
            this.showPasswordModal();
        });
        
        document.getElementById('submit-password-btn').addEventListener('click', () => {
            this.checkPassword();
        });
        
        document.getElementById('cancel-password-btn').addEventListener('click', () => {
            this.closeModal('password-modal');
        });
        
        document.getElementById('close-solution-btn').addEventListener('click', () => {
            this.closeModal('solution-modal');
        });
        
        // Enter-Taste für Passwort-Eingabe
        document.getElementById('password-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.checkPassword();
            }
        });
        
        // Teilnehmer-Verwaltung
        document.getElementById('add-male-btn').addEventListener('click', () => {
            this.addParticipant('male');
        });
        
        document.getElementById('add-female-btn').addEventListener('click', () => {
            this.addParticipant('female');
        });
        
        // Teilnehmeranzahl-Auswahl
        document.getElementById('apply-count-btn').addEventListener('click', () => {
            this.applyParticipantCount();
        });
    }
    
    startGame() {
        const males = this.participants.filter(p => p.gender === 'male');
        const females = this.participants.filter(p => p.gender === 'female');
        
        if (males.length < this.targetPairCount || females.length < this.targetPairCount) {
            alert(`Du brauchst genau ${this.targetPairCount} Männer und ${this.targetPairCount} Frauen, um das Spiel zu starten!`);
            return;
        }
        
        document.getElementById('start-screen').style.display = 'none';
        document.getElementById('game-screen').style.display = 'block';
        this.updateUI();
        this.updateTruthBoothButton();
    }
    
    renderParticipants() {
        const malesContainer = document.getElementById('males-container');
        const femalesContainer = document.getElementById('females-container');
        
        malesContainer.innerHTML = '';
        femalesContainer.innerHTML = '';
        
        // Nur die ersten X Teilnehmer pro Geschlecht anzeigen (X = targetPairCount)
        const males = this.participants.filter(p => p.gender === 'male').slice(0, this.targetPairCount);
        const females = this.participants.filter(p => p.gender === 'female').slice(0, this.targetPairCount);
        
        males.forEach(participant => {
            const div = document.createElement('div');
            div.className = `participant ${participant.gender}`;
            div.dataset.id = participant.id;
            div.innerHTML = `
                <img src="${participant.image}" alt="${participant.name}">
                <div class="name">${participant.name}</div>
            `;
            
            div.addEventListener('click', () => this.selectParticipant(participant));
            malesContainer.appendChild(div);
        });
        
        females.forEach(participant => {
            const div = document.createElement('div');
            div.className = `participant ${participant.gender}`;
            div.dataset.id = participant.id;
            div.innerHTML = `
                <img src="${participant.image}" alt="${participant.name}">
                <div class="name">${participant.name}</div>
            `;
            
            div.addEventListener('click', () => this.selectParticipant(participant));
            femalesContainer.appendChild(div);
        });
        
        this.updateParticipantAvailability();
    }
    
    updateParticipantAvailability() {
        // Nur die angezeigten Teilnehmer zurücksetzen (nicht alle)
        const males = this.participants.filter(p => p.gender === 'male').slice(0, this.targetPairCount);
        const females = this.participants.filter(p => p.gender === 'female').slice(0, this.targetPairCount);
        const availableParticipants = [...males, ...females];
        
        // Alle angezeigten Teilnehmer zurücksetzen
        availableParticipants.forEach(participant => {
            const element = document.querySelector(`[data-id="${participant.id}"]`);
            if (element) {
                element.classList.remove('disabled');
            }
        });
        
        // Gepaarte Teilnehmer als disabled markieren
        this.currentPairs.forEach(pair => {
            const maleElement = document.querySelector(`[data-id="${pair.male.id}"]`);
            const femaleElement = document.querySelector(`[data-id="${pair.female.id}"]`);
            
            if (maleElement) {
                maleElement.classList.add('disabled');
            }
            if (femaleElement) {
                femaleElement.classList.add('disabled');
            }
        });
    }
    
    selectParticipant(participant) {
        const element = document.querySelector(`[data-id="${participant.id}"]`);
        
        // Prüfen ob Teilnehmer bereits gepaart ist
        const isPaired = this.currentPairs.some(pair => 
            pair.male.id === participant.id || pair.female.id === participant.id
        );
        
        if (isPaired) {
            return; // Gepaarte Teilnehmer können nicht ausgewählt werden
        }
        
        if (this.selectedParticipants.find(p => p.id === participant.id)) {
            // Abwählen
            this.selectedParticipants = this.selectedParticipants.filter(p => p.id !== participant.id);
            element.classList.remove('selected');
        } else {
            // Auswählen
            if (this.selectedParticipants.length < 2) {
                this.selectedParticipants.push(participant);
                element.classList.add('selected');
                
                if (this.selectedParticipants.length === 2) {
                    this.createPair();
                }
            }
        }
    }
    
    createPair() {
        const [p1, p2] = this.selectedParticipants;
        
        // Nur M + W Paare erlauben
        if (p1.gender !== p2.gender) {
            this.currentPairs.push({
                male: p1.gender === 'male' ? p1 : p2,
                female: p1.gender === 'female' ? p1 : p2
            });
            
            // Auswahl zurücksetzen
            this.selectedParticipants = [];
            document.querySelectorAll('.participant.selected').forEach(el => {
                el.classList.remove('selected');
            });
            
            this.renderPairs();
            this.updateParticipantAvailability();
        } else {
            alert('Nur Paare aus einem männlichen und einem weiblichen Teilnehmer sind erlaubt!');
            this.selectedParticipants = [];
            document.querySelectorAll('.participant.selected').forEach(el => {
                el.classList.remove('selected');
            });
        }
    }
    
    renderPairs() {
        const container = document.getElementById('current-pairs');
        container.innerHTML = '';
        
        this.currentPairs.forEach((pair, index) => {
            const div = document.createElement('div');
            div.className = 'pair';
            div.dataset.index = index;
            div.innerHTML = `
                <button class="remove-btn" onclick="event.stopPropagation(); game.removePair(${index})">×</button>
                <div class="pair-images">
                    <img src="${pair.male.image}" alt="${pair.male.name}">
                    <span class="heart">❤️</span>
                    <img src="${pair.female.image}" alt="${pair.female.name}">
                </div>
                <div class="pair-names">${pair.male.name} + ${pair.female.name}</div>
            `;
            
            // Klick-Event für alle Paare hinzufügen
            div.style.cursor = 'pointer';
            div.addEventListener('click', (e) => {
                // Verhindern, dass der Remove-Button das Klick-Event auslöst
                if (e.target.classList.contains('remove-btn')) {
                    return;
                }
                this.selectPair(index);
            });
            
            container.appendChild(div);
        });
        
        // Truth Booth Button Status aktualisieren
        this.updateTruthBoothButton();
    }
    
    selectPair(index) {
        // Alle Paare zurücksetzen
        document.querySelectorAll('.pair').forEach(pair => {
            pair.classList.remove('selected');
        });
        
        // Das ausgewählte Paar markieren
        const selectedPair = document.querySelector(`.pair[data-index="${index}"]`);
        if (selectedPair) {
            selectedPair.classList.add('selected');
        }
        
        // Truth Booth Button Status aktualisieren
        this.updateTruthBoothButton();
    }
    
    updateTruthBoothButton() {
        const truthBoothBtn = document.getElementById('truth-booth-btn');
        const selectedPair = document.querySelector('.pair.selected');
        
        if (this.truthBoothUsed) {
            truthBoothBtn.disabled = true;
            truthBoothBtn.style.opacity = '0.5';
            truthBoothBtn.style.cursor = 'not-allowed';
            truthBoothBtn.title = 'Truth Booth wurde diese Woche bereits verwendet';
            truthBoothBtn.textContent = 'Truth Booth (gesperrt)';
            return;
        }
        
        if (selectedPair && this.currentPairs.length > 0) {
            truthBoothBtn.disabled = false;
            truthBoothBtn.style.opacity = '1';
            truthBoothBtn.style.cursor = 'pointer';
            truthBoothBtn.title = '';
            truthBoothBtn.textContent = 'Truth Booth';
        } else {
            truthBoothBtn.disabled = true;
            truthBoothBtn.style.opacity = '0.5';
            truthBoothBtn.style.cursor = 'not-allowed';
            truthBoothBtn.title = '';
            truthBoothBtn.textContent = 'Truth Booth';
        }
    }
    
    removePair(index) {
        // Paar aus der Liste entfernen
        this.currentPairs.splice(index, 1);
        
        // UI aktualisieren
        this.renderPairs();
        this.updateParticipantAvailability();
        this.updateTruthBoothButton();
    }
    
    resetPairs() {
        // Wochen erhöhen
        this.week++;
        
        // Prüfen ob maximale Wochen erreicht sind
        if (this.week > this.maxWeeks) {
            this.showGameOver(false);
            return;
        }
        
        // Truth Booth für die neue Woche freigeben
        this.truthBoothUsed = false;
        
        // Paare zurücksetzen
        this.currentPairs = [];
        this.selectedParticipants = [];
        document.querySelectorAll('.participant.selected').forEach(el => {
            el.classList.remove('selected');
        });
        document.querySelectorAll('.pair.selected').forEach(el => {
            el.classList.remove('selected');
        });
        
        this.renderPairs();
        this.updateParticipantAvailability();
        this.updateTruthBoothButton();
        this.updateUI();
    }
    
    showMatchCeremony() {
        if (this.currentPairs.length !== this.targetPairCount) {
            alert(`Du musst genau ${this.targetPairCount} Paare bilden, bevor du die Match-Up Ceremony starten kannst!`);
            return;
        }
        
        const modal = document.getElementById('match-ceremony-modal');
        const pairsContainer = document.getElementById('ceremony-pairs');
        const resultContainer = document.getElementById('ceremony-result');
        const spotlightsWrap = document.querySelector('.spotlights-container');
        
        // Paare nicht mehr anzeigen
        pairsContainer.innerHTML = '';
        
        // Scheinwerfer dynamisch gemäß targetPairCount aufbauen
        if (spotlightsWrap) {
            spotlightsWrap.innerHTML = '';
            for (let i = 0; i < this.targetPairCount; i++) {
                const s = document.createElement('div');
                s.className = 'spotlight';
                s.dataset.index = String(i);
                spotlightsWrap.appendChild(s);
            }
        }
        
        // Ergebnis berechnen
        const perfectMatches = this.countPerfectMatches();
        resultContainer.innerHTML = '';
        resultContainer.className = '';
        
        // Scheinwerfer nacheinander einschalten
        this.animateSpotlights(perfectMatches, () => {
            if (perfectMatches === this.targetPairCount) {
                resultContainer.innerHTML = `🎉 ALLE ${this.targetPairCount} PERFECT MATCHES GEFUNDEN! 🎉`;
                resultContainer.className = 'perfect';
                this.gameWon();
            } else if (perfectMatches > 0) {
                resultContainer.innerHTML = `✅ ${perfectMatches} Perfect Matches gefunden!`;
                resultContainer.className = 'partial';
            } else {
                resultContainer.innerHTML = '❌ Keine Perfect Matches gefunden.';
                resultContainer.className = 'none';
            }
        });
        
        modal.style.display = 'flex';
    }
    
    animateSpotlights(count, callback) {
        let currentIndex = 0;
        
        const animateNext = () => {
            if (currentIndex < count) {
                const spotlight = document.querySelector(`.spotlight[data-index="${currentIndex}"]`);
                if (spotlight) {
                    spotlight.classList.add('on');
                }
                currentIndex++;
                setTimeout(animateNext, 800); // 800ms Verzögerung zwischen den Scheinwerfern
            } else {
                // Animation beendet, Callback aufrufen
                setTimeout(callback, 1000); // 1 Sekunde warten vor Ergebnis
            }
        };
        
        // Animation starten
        setTimeout(animateNext, 1000); // 1 Sekunde warten vor erster Animation
    }
    
    showTruthBooth() {
        if (this.currentPairs.length === 0) {
            alert('Du musst zuerst Paare bilden, bevor du die Truth Booth nutzen kannst!');
            return;
        }
        
        // Pro Woche nur einmal erlaubt
        if (this.truthBoothUsed) {
            alert('Die Truth Booth wurde diese Woche bereits verwendet. Warte bis zur nächsten Runde.');
            return;
        }
        
        // Prüfen ob ein Paar ausgewählt ist
        const selectedPairElement = document.querySelector('.pair.selected');
        if (!selectedPairElement) {
            alert('Du musst zuerst ein Paar auswählen, bevor du die Truth Booth nutzen kannst!');
            return;
        }
        
        const selectedIndex = parseInt(selectedPairElement.dataset.index);
        const selectedPair = this.currentPairs[selectedIndex];
        
        const modal = document.getElementById('truth-booth-modal');
        const pairsContainer = document.getElementById('truth-booth-pairs');
        const resultContainer = document.getElementById('truth-booth-result');
        
        // Nur das ausgewählte Paar anzeigen
        pairsContainer.innerHTML = '';
        const div = document.createElement('div');
        div.className = 'pair';
        div.innerHTML = `
            <div class="pair-images">
                <img src="${selectedPair.male.image}" alt="${selectedPair.male.name}">
                <span class="heart">❤️</span>
                <img src="${selectedPair.female.image}" alt="${selectedPair.female.name}">
            </div>
            <div class="pair-names">${selectedPair.male.name} + ${selectedPair.female.name}</div>
        `;
        pairsContainer.appendChild(div);
        
        // Loading-Indikator anzeigen
        resultContainer.innerHTML = '<div class="processing-indicator">🔍 Analysiere Paar...</div>';
        resultContainer.className = 'processing';
        
        // Truth Booth als genutzt markieren und Button-Status aktualisieren
        this.truthBoothUsed = true;
        this.updateTruthBoothButton();
        
        // Verzögerte Auflösung
        setTimeout(() => {
            this.checkTruthBooth(selectedPair, resultContainer);
        }, 5000); // 5 Sekunden Verzögerung für mehr Spannung
        
        modal.style.display = 'flex';
    }
    
    checkTruthBooth(pair, resultContainer) {
        const isPerfectMatch = this.isPerfectMatch(pair);
        
        resultContainer.innerHTML = '';
        resultContainer.className = '';
        
        if (isPerfectMatch) {
            resultContainer.innerHTML = '<div class="pulse-heart">❤️<br><span class="perfect-text">Perfect Match</span></div>';
            resultContainer.className = 'perfect';
        } else {
            resultContainer.innerHTML = '<div class="pulse-x">❌</div>';
            resultContainer.className = 'not-perfect';
        }
    }
    
    countPerfectMatches() {
        let count = 0;
        this.currentPairs.forEach(pair => {
            if (this.isPerfectMatch(pair)) {
                count++;
            }
        });
        return count;
    }
    
    isPerfectMatch(pair) {
        return this.perfectMatches.some(perfectMatch => 
            (perfectMatch.male.id === pair.male.id && perfectMatch.female.id === pair.female.id) ||
            (perfectMatch.male.id === pair.female.id && perfectMatch.female.id === pair.male.id)
        );
    }
    
    closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
    }
    
    gameWon() {
        setTimeout(() => {
            this.showGameOver(true);
        }, 2000);
    }
    
    showGameOver(won) {
        const modal = document.getElementById('game-over-modal');
        const title = document.getElementById('game-over-title');
        const content = document.getElementById('game-over-content');
        
        if (won) {
            title.innerHTML = '🎉 GEWONNEN! 🎉';
            content.innerHTML = `
                <p>Herzlichen Glückwunsch! Du hast alle 10 Perfect Matches gefunden!</p>
                <p>Du gewinnst <strong>$${this.money.toLocaleString()}</strong>!</p>
                <p>Woche: ${this.week}</p>
            `;
        } else {
            title.innerHTML = '❌ VERLOREN ❌';
            content.innerHTML = `
                <p>Du hast es nicht geschafft, alle Perfect Matches zu finden.</p>
                <p>Das Geld ist verloren!</p>
                <p>Woche: ${this.week} von ${this.maxWeeks}</p>
            `;
        }
        
        modal.style.display = 'flex';
    }
    
    newGame() {
        this.week = 1;
        this.money = 1000000;
        this.currentPairs = [];
        this.selectedParticipants = [];
        this.truthBoothUsed = false;
        this.generatePerfectMatches();
        this.renderParticipants();
        this.renderPairs();
        this.updateUI();
        this.closeModal('game-over-modal');
        document.getElementById('start-screen').style.display = 'block';
        document.getElementById('game-screen').style.display = 'none';
    }
    
    updateUI() {
        document.getElementById('week-number').textContent = this.week;
        document.getElementById('money-amount').textContent = `$${this.money.toLocaleString()}`;
    }
    
    showPasswordModal() {
        const modal = document.getElementById('password-modal');
        const input = document.getElementById('password-input');
        input.value = '';
        input.focus();
        modal.style.display = 'flex';
    }
    
    checkPassword() {
        const password = document.getElementById('password-input').value;
        
        if (password === 'ilovekathy') {
            this.closeModal('password-modal');
            this.showSolution();
        } else {
            alert('Falsches Passwort! Versuche es erneut.');
            document.getElementById('password-input').value = '';
            document.getElementById('password-input').focus();
        }
    }
    
    showSolution() {
        const modal = document.getElementById('solution-modal');
        const container = document.getElementById('solution-pairs');
        
        container.innerHTML = '';
        
        this.perfectMatches.forEach(pair => {
            const div = document.createElement('div');
            div.className = 'pair';
            div.innerHTML = `
                <div class="pair-images">
                    <img src="${pair.male.image}" alt="${pair.male.name}">
                    <span class="heart">❤️</span>
                    <img src="${pair.female.image}" alt="${pair.female.name}">
                </div>
                <div class="pair-names">${pair.male.name} + ${pair.female.name}</div>
            `;
            container.appendChild(div);
        });
        
        modal.style.display = 'flex';
    }

    renderManagementParticipants() {
        const malesContainer = document.getElementById('males-management');
        const femalesContainer = document.getElementById('females-management');
        
        malesContainer.innerHTML = '';
        femalesContainer.innerHTML = '';
        
        // Nur die ersten X Teilnehmer pro Geschlecht anzeigen (X = targetPairCount)
        const males = this.participants.filter(p => p.gender === 'male').slice(0, this.targetPairCount);
        const females = this.participants.filter(p => p.gender === 'female').slice(0, this.targetPairCount);
        
        males.forEach((participant, index) => {
            const div = document.createElement('div');
            div.className = `participant-card ${participant.gender}`;
            div.dataset.index = this.participants.indexOf(participant);
            div.innerHTML = `
                <img src="${participant.image}" alt="${participant.name}">
                <div class="name">${participant.name}</div>
                <div class="controls">
                    <button class="upload-btn" onclick="game.uploadImage(${this.participants.indexOf(participant)})">📷</button>
                    <button class="delete-btn" onclick="game.deleteParticipant(${this.participants.indexOf(participant)})">❌</button>
                </div>
                <input type="file" id="file_${this.participants.indexOf(participant)}" accept="image/*" onchange="game.handleImageUpload(event, ${this.participants.indexOf(participant)})" style="display:none;">
            `;
            malesContainer.appendChild(div);
        });
        
        females.forEach((participant, index) => {
            const div = document.createElement('div');
            div.className = `participant-card ${participant.gender}`;
            div.dataset.index = this.participants.indexOf(participant);
            div.innerHTML = `
                <img src="${participant.image}" alt="${participant.name}">
                <div class="name">${participant.name}</div>
                <div class="controls">
                    <button class="upload-btn" onclick="game.uploadImage(${this.participants.indexOf(participant)})">📷</button>
                    <button class="delete-btn" onclick="game.deleteParticipant(${this.participants.indexOf(participant)})">❌</button>
                </div>
                <input type="file" id="file_${this.participants.indexOf(participant)}" accept="image/*" onchange="game.handleImageUpload(event, ${this.participants.indexOf(participant)})" style="display:none;">
            `;
            femalesContainer.appendChild(div);
        });
    }
    
    addParticipant(gender) {
        const name = prompt(`Name des ${gender === 'male' ? 'männlichen' : 'weiblichen'} Teilnehmers:`);
        if (!name) return;
        
        const newParticipant = {
            id: this.participants.length + 1,
            name: name,
            gender: gender,
            image: `https://via.placeholder.com/60x60/${gender === 'male' ? '4a90e2' : 'ff69b4'}/ffffff?text=${name.charAt(0)}`
        };
        
        this.participants.push(newParticipant);
        this.renderManagementParticipants();
        this.generatePerfectMatches(); // Neue Perfect Matches generieren
    }
    
    deleteParticipant(index) {
        if (confirm(`Möchtest du ${this.participants[index].name} wirklich löschen?`)) {
            this.participants.splice(index, 1);
            this.renderManagementParticipants();
            this.generatePerfectMatches(); // Neue Perfect Matches generieren
        }
    }
    
    uploadImage(index) {
        document.getElementById(`file_${index}`).click();
    }
    
    handleImageUpload(event, index) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.participants[index].image = e.target.result;
                this.renderManagementParticipants();
                this.renderParticipants(); // Auch im Spiel aktualisieren
            };
            reader.readAsDataURL(file);
        }
    }

    applyParticipantCount() {
        const countSelect = document.getElementById('participant-count');
        const newPairCount = parseInt(countSelect.value);
        
        this.targetPairCount = newPairCount;
        
        // Teilnehmer auf die neue Anzahl anpassen
        this.adjustParticipantsToCount(newPairCount);
        
        // UI aktualisieren
        this.renderManagementParticipants();
        this.generatePerfectMatches();
        
        // Titel aktualisieren
        document.getElementById('males-title').textContent = `Männer (${newPairCount})`;
        document.getElementById('females-title').textContent = `Frauen (${newPairCount})`;
        
        alert(`Teilnehmeranzahl auf ${newPairCount} Paare (${newPairCount * 2} Teilnehmer) festgelegt!`);
    }
    
    adjustParticipantsToCount(pairCount) {
        const targetCount = pairCount;
        const currentMales = this.participants.filter(p => p.gender === 'male');
        const currentFemales = this.participants.filter(p => p.gender === 'female');
        
        // Männer anpassen
        if (currentMales.length > targetCount) {
            // Zu viele Männer - entfernen
            this.participants = this.participants.filter(p => p.gender !== 'male');
            for (let i = 0; i < targetCount; i++) {
                this.participants.push(currentMales[i]);
            }
        } else if (currentMales.length < targetCount) {
            // Zu wenige Männer - hinzufügen
            for (let i = currentMales.length; i < targetCount; i++) {
                const newMale = {
                    id: this.participants.length + 1,
                    name: `Mann${i + 1}`,
                    gender: 'male',
                    image: `https://via.placeholder.com/60x60/4a90e2/ffffff?text=M${i + 1}`
                };
                this.participants.push(newMale);
            }
        }
        
        // Frauen anpassen
        if (currentFemales.length > targetCount) {
            // Zu viele Frauen - entfernen
            this.participants = this.participants.filter(p => p.gender !== 'female');
            for (let i = 0; i < targetCount; i++) {
                this.participants.push(currentFemales[i]);
            }
        } else if (currentFemales.length < targetCount) {
            // Zu wenige Frauen - hinzufügen
            for (let i = currentFemales.length; i < targetCount; i++) {
                const newFemale = {
                    id: this.participants.length + 1,
                    name: `Frau${i + 1}`,
                    gender: 'female',
                    image: `https://via.placeholder.com/60x60/ff69b4/ffffff?text=F${i + 1}`
                };
                this.participants.push(newFemale);
            }
        }
    }
}

// Spiel starten
document.addEventListener('DOMContentLoaded', () => {
    window.game = new AYTOGame();
});