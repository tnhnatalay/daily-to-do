// Başta değişkenler ve elemanlar
const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const completedLog = document.getElementById('completedLog');
const timerDisplay = document.getElementById('timerDisplay');
const resetBtn = document.getElementById('resetBtn');

const tasksKey = 'todo_tasks';
const completedKey = 'todo_completed_log';

let tasks = JSON.parse(localStorage.getItem(tasksKey)) || [];
let completedLogData = JSON.parse(localStorage.getItem(completedKey)) || [];

// Verileri kaydet
function saveToStorage() {
  localStorage.setItem(tasksKey, JSON.stringify(tasks));
  localStorage.setItem(completedKey, JSON.stringify(completedLogData));
}

// Görevleri listele
function renderTasks() {
  taskList.innerHTML = '';
  tasks
    .slice()
    .sort((a, b) => a.text.toLowerCase().localeCompare(b.text.toLowerCase()))
    .forEach(task => {
      const div = document.createElement('div');
      div.className = 'task';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = task.checked;
      checkbox.onchange = () => {
        task.checked = checkbox.checked;
        saveToStorage();
      };

      const label = document.createElement('label');
      label.textContent = task.text;

      const delBtn = document.createElement('button');
      delBtn.textContent = 'Sil';
      delBtn.onclick = () => {
        tasks = tasks.filter(t => t !== task);
        saveToStorage();
        renderTasks();
      };

      div.appendChild(checkbox);
      div.appendChild(label);
      div.appendChild(delBtn);

      taskList.appendChild(div);
    });
}

// Tamamlanan görevleri listele
function renderCompletedLog() {
  completedLog.innerHTML = '';

  completedLogData
    .slice()
    .reverse()
    .forEach(entry => {
      const dateDiv = document.createElement('div');
      dateDiv.className = 'completed-date';
      dateDiv.textContent = entry.date + ':';

      const tasksContainer = document.createElement('div');
      tasksContainer.className = 'completed-tasks-container';

      entry.tasks.forEach(task => {
        const taskDiv = document.createElement('div');
        taskDiv.className = 'completed-task-item';
        taskDiv.textContent = '• ' + task;
        tasksContainer.appendChild(taskDiv);
      });

      const entryDiv = document.createElement('div');
      entryDiv.className = 'completed-entry';
      entryDiv.appendChild(dateDiv);
      entryDiv.appendChild(tasksContainer);

      completedLog.appendChild(entryDiv);
    });
}

// Süreyi biçimlendir (gg ss:dd:ss)
function formatDuration(ms) {
  let totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  totalSeconds %= 86400;
  const hours = Math.floor(totalSeconds / 3600);
  totalSeconds %= 3600;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return (
    (days > 0 ? days + 'g ' : '') +
    (hours < 10 ? '0' + hours : hours) + ':' +
    (minutes < 10 ? '0' + minutes : minutes) + ':' +
    (seconds < 10 ? '0' + seconds : seconds)
  );
}

// 24:00'a kadar geri sayım başlat
function updateTimer() {
  const now = new Date();
  const endOfDay = new Date();
  endOfDay.setHours(24, 0, 0, 0); // gece 00:00

  let diff = endOfDay - now;

  if (diff <= 0) {
    timerDisplay.textContent = 'Gün tamamlandı!';

    const completedTasks = tasks.filter(t => t.checked).map(t => t.text);

    if (completedTasks.length > 0) {
      sendCompletedTasksToBackend(completedTasks);

      const dateStr = new Date().toLocaleDateString('tr-TR');
      completedLogData.push({ date: dateStr, tasks: completedTasks });

      tasks.forEach(t => (t.checked = false));
      saveToStorage();
      renderTasks();
      renderCompletedLog();
    }

    // Yeni gün başladıysa hemen tekrar başlat
    setTimeout(updateTimer, 1000);
  } else {
    timerDisplay.textContent = formatDuration(diff);
    setTimeout(updateTimer, 1000);
  }
}

// Mail gönderme (isteğe bağlı backend entegrasyonu)
function sendCompletedTasksToBackend(completedTasks) {
  fetch('http://localhost:3000/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completedTasks })
  })
  .then(response => {
    if (!response.ok) throw new Error('Sunucudan yanıt alınamadı');
    return response.text();
  })
  .then(data => {
    alert('Mail gönderildi: ' + data);
  })
  .catch(err => {
    console.error('Mail gönderme hatası:', err);
    alert('Mail gönderme hatası: ' + err.message);
  });
}

// Yeni görev ekleme
addTaskBtn.onclick = () => {
  const text = taskInput.value.trim();
  if (!text) return alert('Görev boş olamaz!');
  tasks.push({ text, checked: false });
  saveToStorage();
  renderTasks();
  taskInput.value = '';
};

// Verileri sıfırlama
resetBtn.onclick = () => {
  if (confirm('Tüm veriler silinecek, emin misiniz?')) {
    localStorage.clear();
    tasks = [];
    completedLogData = [];
    renderTasks();
    renderCompletedLog();
    timerDisplay.textContent = '--:--:--';
    updateTimer(); // yeni gün için yeniden başlat
  }
};

// Sayfa yüklenince her şeyi başlat
renderTasks();
renderCompletedLog();
updateTimer();
