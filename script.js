document.addEventListener("DOMContentLoaded", () => {
    const toggleSchedaBtn = document.getElementById("toggle-scheda");
    const showSavedSchedulesBtn = document.getElementById("show-saved-schedules");
    const creaScheda = document.getElementById("crea-scheda");
    const savedSchedules = document.getElementById("saved-schedules");
    const muscleGroupSelect = document.getElementById("muscle-group");
    const exerciseInput = document.getElementById("exercise");
    const setsInput = document.getElementById("sets");
    const repsInput = document.getElementById("reps");
    const restInput = document.getElementById("rest");
    const scheduleItems = document.getElementById("schedule-items");
    const savedSchedulesList = document.getElementById("saved-schedules-list");
    const trainingSession = document.getElementById("training-session");
    const currentExercises = document.getElementById("current-exercises");
    const timer = document.getElementById("timer");
    const timeRemainingDisplay = document.getElementById("time-remaining");

    toggleSchedaBtn.addEventListener("click", () => {
        creaScheda.classList.toggle("hidden");
        savedSchedules.classList.add("hidden");
        trainingSession.classList.add("hidden");
    });

    showSavedSchedulesBtn.addEventListener("click", () => {
        savedSchedules.classList.remove("hidden");
        creaScheda.classList.add("hidden");
        trainingSession.classList.add("hidden");
        loadSavedSchedules(); // Carica schede salvate
    });

    let exercises = [];
    let currentSchedule = [];
    let timerInterval;
    let timeRemaining; // Variabile per memorizzare il tempo rimanente

    document.getElementById("add-exercise").addEventListener("click", () => {
        const muscleGroup = muscleGroupSelect.value;
        const exercise = exerciseInput.value.trim();
        const sets = setsInput.value.trim();
        const reps = repsInput.value.trim();
        const rest = restInput.value.trim();

        // Controllo della validità dei campi
        if (muscleGroup && exercise && sets && reps && rest) {
            exercises.push({ muscleGroup, exercise, sets, reps, rest });
            updateScheduleDisplay();
            resetInputs();
            showNotification("Esercizio aggiunto!"); // Notifica
        } else {
            showNotification("Compila tutti i campi!"); // Notifica
        }
    });

    document.getElementById("clear-schedule").addEventListener("click", () => {
        exercises = [];
        updateScheduleDisplay();
        showNotification("Scheda ripulita!"); // Notifica
    });

    document.getElementById("save-schedule").addEventListener("click", () => {
        if (exercises.length > 0) {
            const savedSchedulesFromStorage = JSON.parse(localStorage.getItem("savedSchedules")) || [];
            savedSchedulesFromStorage.push(exercises);
            localStorage.setItem("savedSchedules", JSON.stringify(savedSchedulesFromStorage));
            showNotification("Scheda salvata!"); // Notifica
            exercises = [];
            updateScheduleDisplay();
        } else {
            showNotification("Non ci sono esercizi da salvare!"); // Notifica
        }
    });

    document.getElementById("back-to-create").addEventListener("click", () => {
        savedSchedules.classList.add("hidden");
        creaScheda.classList.remove("hidden");
    });

    document.getElementById("finish-set").addEventListener("click", () => {
        const currentExercise = currentExercises.querySelector(".exercise-item");
        if (currentExercise) {
            const setsCompleted = parseInt(currentExercise.dataset.setsCompleted) || 0;
            const totalSets = parseInt(currentExercise.dataset.sets); // Ottieni il numero totale di serie
            currentExercise.dataset.setsCompleted = setsCompleted + 1; // Incrementa il conteggio delle serie completate
            currentExercise.querySelector(".sets-count").textContent = `Serie completate: ${setsCompleted + 1} di ${totalSets}`; // Mostra il conteggio totale di serie

            // Se tutte le serie sono completate
            if (setsCompleted + 1 >= totalSets) {
                showNotification(`Hai completato tutte le serie per ${currentExercise.dataset.exercise}. Tempo di recupero!`); // Notifica
                currentExercises.removeChild(currentExercise); // Rimuovi l'esercizio completato

                // Avvia il timer con il tempo di riposo dell'esercizio attuale
                startRestTimer(parseInt(currentExercise.dataset.rest));
            } else {
                // Avvia il timer con il tempo di riposo dell'esercizio attuale
                startRestTimer(parseInt(currentExercise.dataset.rest));
            }
        }
    });

    document.getElementById("end-training").addEventListener("click", () => {
        trainingSession.classList.add("hidden");
        creaScheda.classList.remove("hidden");
    });

    function updateScheduleDisplay() {
        scheduleItems.innerHTML = exercises.map((item, index) => `
            <div class="allenamento-item">
                ${item.muscleGroup}: ${item.exercise} (${item.sets} serie, ${item.reps} ripetizioni, ${item.rest} secondi di recupero)
                <button class="remove-btn" onclick="removeExercise(${index})">x</button>
            </div>
        `).join('');
    }

    window.removeExercise = (index) => {
        exercises.splice(index, 1);
        updateScheduleDisplay();
        showNotification("Esercizio rimosso!"); // Notifica
    };

    function loadSavedSchedules() {
        savedSchedulesList.innerHTML = "";
        const savedSchedulesFromStorage = JSON.parse(localStorage.getItem("savedSchedules")) || [];
        
        savedSchedulesFromStorage.forEach((schedule, index) => {
            let scheduleHTML = `<div class="created-div">
                <h4>Scheda ${index + 1}</h4>`;
    
            const muscleGroups = {};
            schedule.forEach(item => {
                if (!muscleGroups[item.muscleGroup]) {
                    muscleGroups[item.muscleGroup] = [];
                }
                muscleGroups[item.muscleGroup].push(item);
            });
    
            for (const [muscleGroup, exercises] of Object.entries(muscleGroups)) {
                scheduleHTML += `<h5>${muscleGroup}</h5><ul>`;
                exercises.forEach(item => {
                    scheduleHTML += `<li>${item.exercise} (${item.sets} serie, ${item.reps} ripetizioni)</li>`;
                });
                scheduleHTML += `</ul>`;
            }
    
            scheduleHTML += `
                <button class="btn" onclick="startTraining(${index})">Avvia Allenamento</button>
                <button class="delete-schedule-btn" onclick="deleteSchedule(${index})">Elimina Scheda</button>
            </div>`;
    
            savedSchedulesList.innerHTML += scheduleHTML;
        });
    }
    

    window.deleteSchedule = (index) => {
        const savedSchedulesFromStorage = JSON.parse(localStorage.getItem("savedSchedules")) || [];
        savedSchedulesFromStorage.splice(index, 1);
        localStorage.setItem("savedSchedules", JSON.stringify(savedSchedulesFromStorage));
        loadSavedSchedules();
        showNotification("Scheda eliminata!"); // Notifica
    };

    window.startTraining = (index) => {
        const savedSchedulesFromStorage = JSON.parse(localStorage.getItem("savedSchedules")) || [];
        currentSchedule = savedSchedulesFromStorage[index];
        currentExercises.innerHTML = currentSchedule.map(item => `
            <div class="exercise-item" data-sets="${item.sets}" data-reps="${item.reps}" data-rest="${item.rest}" data-sets-completed="0" data-exercise="${item.exercise}">
                ${item.muscleGroup}: ${item.exercise} (${item.reps} ripetizioni) <span class="sets-count">Serie completate: 0 di ${item.sets}</span>
            </div>
        `).join('');
        trainingSession.classList.remove("hidden");
        creaScheda.classList.add("hidden");
        savedSchedules.classList.add("hidden");
    };

    function startRestTimer(duration) {
        timeRemaining = duration; // Memorizza il tempo rimanente
        timeRemainingDisplay.textContent = timeRemaining; // Imposta il tempo rimanente iniziale
        timer.classList.remove("hidden");
        clearInterval(timerInterval); // Pulire l'eventuale intervallo esistente
        timerInterval = setInterval(() => {
            timeRemaining--;
            timeRemainingDisplay.textContent = timeRemaining;

            if (timeRemaining <= 0) {
                clearInterval(timerInterval);
                timer.classList.add("hidden");
                showNotification("Tempo di recupero terminato!"); // Notifica
            }
        }, 1000);
    }

    document.getElementById("stop-timer").addEventListener("click", () => {
        clearInterval(timerInterval); // Ferma il timer, senza nascondere il display
        showNotification("Timer fermato!"); // Notifica 
    });

    document.getElementById("start-recovery").addEventListener("click", () => {
        if (timeRemaining > 0) {
            startRestTimer(timeRemaining); // Riprendi il timer da dove è stato fermato
            showNotification("Timer di recupero ripreso!"); // Notifica 
        }
    });

    function resetInputs() {
        muscleGroupSelect.value = "";
        exerciseInput.value = "";
        setsInput.value = "";
        repsInput.value = "";
        restInput.value = "";
    }

    // Funzione per mostrare notifiche
    function showNotification(message) {
        const notification = document.createElement("div");
        notification.className = "notification";
        notification.textContent = message;
        document.body.appendChild(notification);

        // Mostra la notifica per 3 secondi
        setTimeout(() => {
            notification.remove();
        }, 2000);
    }
});

// Funzione per mostrare notifiche
function showNotification(message) {
    const notification = document.createElement("div");
    notification.className = "notification";
    notification.textContent = message;
    document.body.appendChild(notification);

    // Mostra la notifica per 3 secondi
    setTimeout(() => {
        notification.remove();
    }, 2000);
;}

let trainingCount = 0;

// Funzione per recuperare i dati salvati o impostare i dati iniziali
function loadSavedData() {
  const savedData = JSON.parse(localStorage.getItem('chartData')) || [0];
  trainingCount = savedData[savedData.length - 1]; // Imposta il conteggio in base all'ultimo valore salvato
  return savedData;
}

// Funzione per incrementare il conteggio degli allenamenti e aggiornare il grafico
function incrementTraining() {
  // Controlla se ci sono già 7 allenamenti
  if (myLineChart.data.datasets[0].data.length >= 8) {
    showNotification("Hai raggiunto il massimo di allenamenti settimanali!");
    return; // Ferma l'esecuzione se ci sono già 7 allenamenti
  }

  trainingCount = 1; // Imposta il valore di allenamento
  myLineChart.data.datasets[0].data.push(trainingCount); // Aggiungi il nuovo valore al grafico
  myLineChart.update(); // Aggiorna il grafico

  localStorage.setItem('chartData', JSON.stringify(myLineChart.data.datasets[0].data));
}

// Funzione per segnare un giorno di riposo sul grafico
function markRestDay() {
  trainingCount = 0; // Indica un giorno di riposo con il valore 0
  myLineChart.data.datasets[0].data.push(trainingCount); // Aggiungi il valore 0 al dataset
  myLineChart.update(); // Aggiorna il grafico

  localStorage.setItem('chartData', JSON.stringify(myLineChart.data.datasets[0].data));
}

// Seleziona il contesto del canvas
const ctx = document.getElementById('myLineChart').getContext('2d');
// Creazione di gradienti per la linea e lo sfondo
const gradientLine = ctx.createLinearGradient(0, 0, 0, 400);
gradientLine.addColorStop(0, 'rgba(255, 99, 132, 1)');
gradientLine.addColorStop(1, 'rgba(54, 162, 235, 1)');

const gradientFill = ctx.createLinearGradient(0, 0, 0, 400);
gradientFill.addColorStop(0, 'rgba(255, 99, 132, 0.3)');
gradientFill.addColorStop(1, 'rgba(54, 162, 235, 0.05)');

// Configura e crea il grafico a linee
const myLineChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Partenza', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'],
      datasets: [{
        label: 'Allenamento',
        data: loadSavedData(),
        borderColor: gradientLine,
        backgroundColor: gradientFill,
        borderWidth: 4,
        pointBackgroundColor: 'rgba(255, 255, 255, 1)',
        pointBorderColor: gradientLine,
        pointBorderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointHoverBorderWidth: 4,
        fill: true,
        tension: 0.3 // Curvatura più delicata
      }]
    },
    options: {
      responsive: true,
      animations: {
        tension: {
          duration: 1000,
          easing: 'easeOutQuad', // Animazione morbida senza rimbalzi
          from: 0.5,
          to: 0.3,
          loop: false // Animazione singola
        }
      },
      plugins: {
        legend: {
          display: true,
          labels: {
            color: '#444',
            font: {
              size: 16,
              weight: 'bold'
            }
          }
        },
        tooltip: {
          enabled: true,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleFont: { size: 16, weight: 'bold', family: 'Arial' },
          bodyFont: { size: 14, family: 'Arial' },
          padding: 12,
          cornerRadius: 8,
          borderColor: 'rgba(255, 255, 255, 0.3)',
          borderWidth: 1,
          displayColors: false, 
          callbacks: {
            label: function(context) {
              return ` Intensity: ${context.raw}`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          display: false
        },
        x: {
          ticks: {
            color: '#777',
            font: {
              size: 14,
              style: 'italic'
            }
          }
        }
      }
    }
  });
  

  
// Aggiungi event listener per il pulsante di fine allenamento
document.getElementById('end-training').addEventListener('click', function() {
  incrementTraining();
});

// Funzione per rimuovere l'ultimo allenamento dal grafico
function removeLastTraining() {
    if (myLineChart.data.datasets[0].data.length > 1) {
      myLineChart.data.datasets[0].data.pop();
      myLineChart.update();
      localStorage.setItem('chartData', JSON.stringify(myLineChart.data.datasets[0].data));
      trainingCount = myLineChart.data.datasets[0].data[myLineChart.data.datasets[0].data.length - 1];
    } else {
      showNotification("Non ci sono allenamenti da rimuovere!");
    }
}

// Aggiungi event listener per il pulsante di rimozione
document.getElementById('remove-training').addEventListener('click', removeLastTraining);

// Event listener per aggiungere un allenamento
document.getElementById('add-workout').addEventListener('click', function() {
  incrementTraining();
});

// Event listener per segnare un giorno di riposo
document.getElementById('rest-day').addEventListener('click', function() {
  markRestDay();
});
