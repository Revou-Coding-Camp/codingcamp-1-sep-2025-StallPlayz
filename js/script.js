$(document).ready(function () {
  let tasks = [];
  let taskIdCounter = 1;
  let currentFilter = "all";

  // Menentukan tanggal default pada hari ini
  const today = new Date().toISOString().split("T")[0];
  $("#dateInput").val(today);

  // Inisialisasi
  updateTaskDisplay();
  updateTaskCounter();
  updateDeleteAllButton();

  // Handle form submission
  $("#addTaskForm").submit(function (e) {
    e.preventDefault();
    addTask();
  });

  // Filter dropdown
  $("#filterSelect").change(function () {
    currentFilter = $(this).val();
    updateTaskDisplay();
    updateTaskCounter();
  });

  // Tombol delete all
  $("#deleteAllBtn").click(function () {
    deleteAllTasks();
  });

  //   Fungsi tambahkan task
  function addTask() {
    const taskText = $("#taskInput").val().trim();
    const taskDate = $("#dateInput").val();

    const newTask = {
      id: taskIdCounter++,
      text: taskText,
      date: taskDate,
      completed: false,
      editing: false,
    };

    tasks.push(newTask);

    // Reset form
    $("#taskInput").val("");
    $("#dateInput").val(today);

    updateTaskDisplay();
    updateTaskCounter();
    updateDeleteAllButton();

    // visual feedback
    $("#addBtn").text("✓ Ditambahkan!");
    setTimeout(() => {
      $("#addBtn").text("Tambah");
    }, 1000);
  }

  //   Fungsi hapus task
  function deleteTask(taskId) {
    if (confirm("Apakah Anda yakin ingin menghapus tugas ini?")) {
      tasks = tasks.filter((task) => task.id !== taskId);
      updateTaskDisplay();
      updateTaskCounter();
      updateDeleteAllButton();
    }
  }

  //   Fungsi hapus semua task
  function deleteAllTasks() {
    if (tasks.length === 0) return;

    if (
      confirm(
        "Apakah Anda yakin ingin menghapus SEMUA tugas? Tindakan ini tidak dapat dibatalkan."
      )
    ) {
      tasks = [];
      updateTaskDisplay();
      updateTaskCounter();
      updateDeleteAllButton();

      // Visual feedback
      $("#deleteAllBtn").text("✓ Terhapus!");
      setTimeout(() => {
        $("#deleteAllBtn").text("🗑️ Hapus Semua");
      }, 1500);
    }
  }

  //   Fungsi select task sudah selesai atau belum
  function toggleTask(taskId) {
    const task = tasks.find((task) => task.id === taskId);
    if (task) {
      task.completed = !task.completed;
      updateTaskDisplay();
      updateTaskCounter();
    }
  }

  //   Fungsi menyimpan edit
  function startEdit(taskId) {
    const task = tasks.find((task) => task.id === taskId);
    if (task) {
      task.editing = true;
      updateTaskDisplay();
    }
  }

  //   Fungsi menyimpat edit
  function saveEdit(taskId) {
    const task = tasks.find((task) => task.id === taskId);
    const newText = $(`#edit-input-${taskId}`).val().trim();

    if (newText === "") {
      return;
    }

    if (task) {
      task.text = newText;
      task.editing = false;
      updateTaskDisplay();
    }
  }

  //   Fungsi membatalkan edit
  function cancelEdit(taskId) {
    const task = tasks.find((task) => task.id === taskId);
    if (task) {
      task.editing = false;
      updateTaskDisplay();
    }
  }

  //   Fungsi tanggal
  function formatDate(dateString) {
    if (!dateString) return "";

    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const options = {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
    };

    // Perulangan untuk mengetahui tugas ini dipergunakan untuk hari ini, besok, atau kemarin
    if (dateString === today.toISOString().split("T")[0]) {
      return "📅 Hari ini";
    } else if (dateString === tomorrow.toISOString().split("T")[0]) {
      return "📅 Besok";
    } else if (dateString === yesterday.toISOString().split("T")[0]) {
      return "📅 Kemarin";
    } else {
      return "📅 " + date.toLocaleDateString("id-ID", options);
    }
  }

  //   Fungsi update display task
  function updateTaskDisplay() {
    const taskList = $("#taskList");
    const emptyState = $("#emptyState");

    // Filter tasks based on current filter
    let filteredTasks = tasks;
    if (currentFilter === "active") {
      filteredTasks = tasks.filter((task) => !task.completed);
    } else if (currentFilter === "completed") {
      filteredTasks = tasks.filter((task) => task.completed);
    }

    taskList.empty();

    if (filteredTasks.length === 0) {
      emptyState.addClass("show");
      if (currentFilter === "active") {
        emptyState.find("p").text("🎉 Tidak ada tugas aktif!");
      } else if (currentFilter === "completed") {
        emptyState.find("p").text("📋 Belum ada tugas yang selesai.");
      } else {
        emptyState
          .find("p")
          .text("📋 Belum ada tugas. Tambahkan tugas pertama Anda!");
      }
    } else {
      emptyState.removeClass("show");
    }

    // Sortir task berdasarkan tanggal
    filteredTasks.sort((a, b) => {
      if (!a.date && !b.date) return 0;
      if (!a.date) return 1;
      if (!b.date) return -1;
      return new Date(a.date) - new Date(b.date);
    });

    filteredTasks.forEach((task) => {
      const taskItem = $(`
              <div class="task-item ${
                task.completed ? "completed" : ""
              }" data-id="${task.id}">
                <input type="checkbox" class="task-checkbox" ${
                  task.completed ? "checked" : ""
                }>
                <div class="task-content">
                  ${
                    task.editing
                      ? `<input type="text" class="task-input" id="edit-input-${task.id}" value="${task.text}" required>`
                      : `<span class="task-text">${task.text}</span>
                         ${
                           task.date
                             ? `<div class="task-date">${formatDate(
                                 task.date
                               )}</div>`
                             : ""
                         }`
                  }
                </div>
                <div class="task-actions">
                  ${
                    task.editing
                      ? `<button class="save-btn" onclick="saveTask(${task.id})">Simpan</button>
                         <button class="cancel-btn" onclick="cancelTask(${task.id})">Batal</button>`
                      : `<button class="edit-btn" onclick="editTask(${task.id})">Edit</button>
                         <button class="delete-btn" onclick="deleteTaskById(${task.id})">Hapus</button>`
                  }
                </div>
              </div>
            `);

      // Tambahkan event listener
      taskItem.find(".task-checkbox").change(function () {
        toggleTask(task.id);
      });

      // Tambahkan event tombol ditekan untuk edit
      taskItem.find(".task-input").keypress(function (e) {
        if (e.which === 13) {
          // Enter key
          saveEdit(task.id);
        } else if (e.which === 27) {
          // Escape key
          cancelEdit(task.id);
        }
      });

      taskList.append(taskItem);
    });
  }

  //   Fungsi penghitung task
  function updateTaskCounter() {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((task) => task.completed).length;
    const activeTasks = totalTasks - completedTasks;

    let counterText = "";
    if (currentFilter === "all") {
      counterText = `${totalTasks} tugas total`;
    } else if (currentFilter === "active") {
      counterText = `${activeTasks} tugas aktif`;
    } else if (currentFilter === "completed") {
      counterText = `${completedTasks} tugas selesai`;
    }

    $("#taskCount").text(counterText);
  }

  //   fungsi update tombol delete all
  function updateDeleteAllButton() {
    const deleteAllBtn = $("#deleteAllBtn");
    if (tasks.length === 0) {
      deleteAllBtn.prop("disabled", true);
    } else {
      deleteAllBtn.prop("disabled", false);
    }
  }

  // Fungsi global untuk tombol
  window.deleteTaskById = function (taskId) {
    deleteTask(taskId);
  };

  window.editTask = function (taskId) {
    startEdit(taskId);
  };

  window.saveTask = function (taskId) {
    saveEdit(taskId);
  };

  window.cancelTask = function (taskId) {
    cancelEdit(taskId);
  };
});
