$(document).ready(function () {
  let tasks = [];
  let taskIdCounter = 1;
  let currentFilter = "all";

  // Menentukan tanggal default pada hari ini
  const today = new Date().toISOString().split("T")[0];
  $("#dateInput").val(today);

  // Load data dari localStorage saat aplikasi dimulai
  loadTasksFromStorage();

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

  // Fungsi untuk memuat tasks dari localStorage
  function loadTasksFromStorage() {
    try {
      const storedTasks = localStorage.getItem("todoTasks");
      const storedCounter = localStorage.getItem("todoTaskIdCounter");

      if (storedTasks) {
        tasks = JSON.parse(storedTasks);
      }

      if (storedCounter) {
        taskIdCounter = parseInt(storedCounter);
      }

      console.log("Tasks loaded from localStorage:", tasks.length);
    } catch (error) {
      console.error("Error loading tasks from localStorage:", error);
      // Jika ada error, reset ke default
      tasks = [];
      taskIdCounter = 1;
    }
  }

  // Fungsi untuk menyimpan tasks ke localStorage
  function saveTasksToStorage() {
    try {
      localStorage.setItem("todoTasks", JSON.stringify(tasks));
      localStorage.setItem("todoTaskIdCounter", taskIdCounter.toString());
      console.log("Tasks saved to localStorage");
    } catch (error) {
      console.error("Error saving tasks to localStorage:", error);
      // Tampilkan notifikasi kepada user jika penyimpanan gagal
      showNotification(
        "Gagal menyimpan data. Pastikan browser mendukung localStorage.",
        "error"
      );
    }
  }

  // Fungsi untuk menampilkan notifikasi
  function showNotification(message, type = "success") {
    // Hapus notifikasi sebelumnya jika ada
    $(".notification").remove();

    const notificationClass =
      type === "error" ? "notification-error" : "notification-success";
    const notification = $(`
      <div class="notification ${notificationClass}" style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === "error" ? "#ff7675" : "#00b894"};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        animation: slideInRight 0.3s ease;
      ">
        ${message}
      </div>
    `);

    $("body").append(notification);

    // Hapus notifikasi setelah 3 detik
    setTimeout(() => {
      notification.fadeOut(300, function () {
        $(this).remove();
      });
    }, 3000);
  }

  // Fungsi tambahkan task
  function addTask() {
    const taskText = $("#taskInput").val().trim();
    const taskDate = $("#dateInput").val();

    const newTask = {
      id: taskIdCounter++,
      text: taskText,
      date: taskDate,
      completed: false,
      editing: false,
      createdAt: new Date().toISOString(), // Tambahkan timestamp
    };

    tasks.push(newTask);

    // Simpan ke localStorage
    saveTasksToStorage();

    // Reset form
    $("#taskInput").val("");
    $("#dateInput").val(today);

    updateTaskDisplay();
    updateTaskCounter();
    updateDeleteAllButton();

    // Visual feedback
    $("#addBtn").text("✅ Ditambahkan!");
    setTimeout(() => {
      $("#addBtn").text("Tambah");
    }, 1000);

    showNotification("Tugas berhasil ditambahkan!");
  }

  // Fungsi hapus task
  function deleteTask(taskId) {
    if (confirm("Apakah Anda yakin ingin menghapus tugas ini?")) {
      const taskToDelete = tasks.find((task) => task.id === taskId);
      tasks = tasks.filter((task) => task.id !== taskId);

      // Simpan ke localStorage
      saveTasksToStorage();

      updateTaskDisplay();
      updateTaskCounter();
      updateDeleteAllButton();

      showNotification("Tugas berhasil dihapus!");
    }
  }

  // Fungsi hapus semua task
  function deleteAllTasks() {
    if (tasks.length === 0) return;

    if (
      confirm(
        "Apakah Anda yakin ingin menghapus SEMUA tugas? Tindakan ini tidak dapat dibatalkan."
      )
    ) {
      tasks = [];

      // Simpan ke localStorage
      saveTasksToStorage();

      updateTaskDisplay();
      updateTaskCounter();
      updateDeleteAllButton();

      // Visual feedback
      $("#deleteAllBtn").text("✅ Terhapus!");
      setTimeout(() => {
        $("#deleteAllBtn").text("🗑️ Hapus Semua");
      }, 1500);

      showNotification("Semua tugas berhasil dihapus!");
    }
  }

  // Fungsi select task sudah selesai atau belum
  function toggleTask(taskId) {
    const task = tasks.find((task) => task.id === taskId);
    if (task) {
      task.completed = !task.completed;
      task.completedAt = task.completed ? new Date().toISOString() : null;

      // Simpan ke localStorage
      saveTasksToStorage();

      updateTaskDisplay();
      updateTaskCounter();

      const statusText = task.completed ? "selesai" : "aktif";
      showNotification(`Tugas ditandai sebagai ${statusText}!`);
    }
  }

  // Fungsi menyimpan edit
  function startEdit(taskId) {
    const task = tasks.find((task) => task.id === taskId);
    if (task) {
      task.editing = true;
      updateTaskDisplay();
    }
  }

  // Fungsi menyimpan edit
  function saveEdit(taskId) {
    const task = tasks.find((task) => task.id === taskId);
    const newText = $(`#edit-input-${taskId}`).val().trim();

    if (newText === "") {
      showNotification("Tugas tidak boleh kosong!", "error");
      return;
    }

    if (task) {
      const oldText = task.text;
      task.text = newText;
      task.editing = false;
      task.updatedAt = new Date().toISOString();

      // Simpan ke localStorage
      saveTasksToStorage();

      updateTaskDisplay();
      showNotification("Tugas berhasil diperbarui!");
    }
  }

  // Fungsi membatalkan edit
  function cancelEdit(taskId) {
    const task = tasks.find((task) => task.id === taskId);
    if (task) {
      task.editing = false;
      updateTaskDisplay();
    }
  }

  // Fungsi export data untuk backup
  function exportTasks() {
    const dataToExport = {
      tasks: tasks,
      taskIdCounter: taskIdCounter,
      exportDate: new Date().toISOString(),
      version: "1.0",
    };

    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(dataBlob);
    link.download = `todo-backup-${
      new Date().toISOString().split("T")[0]
    }.json`;
    link.click();

    showNotification("Data berhasil diekspor!");
  }

  // Fungsi import data dari backup
  function importTasks(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const importedData = JSON.parse(e.target.result);

        if (importedData.tasks && Array.isArray(importedData.tasks)) {
          // Konfirmasi sebelum menimpa data yang ada
          if (
            tasks.length > 0 &&
            !confirm("Ini akan mengganti semua tugas yang ada. Lanjutkan?")
          ) {
            return;
          }

          tasks = importedData.tasks;
          taskIdCounter =
            importedData.taskIdCounter ||
            Math.max(...tasks.map((t) => t.id), 0) + 1;

          // Simpan ke localStorage
          saveTasksToStorage();

          updateTaskDisplay();
          updateTaskCounter();
          updateDeleteAllButton();

          showNotification(`Berhasil mengimpor ${tasks.length} tugas!`);
        } else {
          throw new Error("Format file tidak valid");
        }
      } catch (error) {
        console.error("Error importing tasks:", error);
        showNotification("Gagal mengimpor data. File tidak valid.", "error");
      }

      // Reset input file
      event.target.value = "";
    };

    reader.readAsText(file);
  }

  // Fungsi clear localStorage (untuk debugging atau reset)
  function clearAllData() {
    if (
      confirm(
        "Ini akan menghapus SEMUA data termasuk dari penyimpanan browser. Lanjutkan?"
      )
    ) {
      try {
        localStorage.removeItem("todoTasks");
        localStorage.removeItem("todoTaskIdCounter");
        tasks = [];
        taskIdCounter = 1;

        updateTaskDisplay();
        updateTaskCounter();
        updateDeleteAllButton();

        showNotification("Semua data berhasil dihapus!");
      } catch (error) {
        console.error("Error clearing data:", error);
        showNotification("Gagal menghapus data.", "error");
      }
    }
  }

  // Fungsi tanggal (tidak berubah)
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

  // Fungsi update display task (tidak berubah)
  function updateTaskDisplay() {
    const taskList = $("#taskList");
    const emptyState = $("#emptyState");

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

      taskItem.find(".task-checkbox").change(function () {
        toggleTask(task.id);
      });

      taskItem.find(".task-input").keypress(function (e) {
        if (e.which === 13) {
          saveEdit(task.id);
        } else if (e.which === 27) {
          cancelEdit(task.id);
        }
      });

      taskList.append(taskItem);
    });
  }

  // Fungsi penghitung task (tidak berubah)
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

  // Fungsi update tombol delete all (tidak berubah)
  function updateDeleteAllButton() {
    const deleteAllBtn = $("#deleteAllBtn");
    if (tasks.length === 0) {
      deleteAllBtn.prop("disabled", true);
    } else {
      deleteAllBtn.prop("disabled", false);
    }
  }

  // Auto-save saat user menutup tab/browser
  $(window).on("beforeunload", function () {
    saveTasksToStorage();
  });

  // Periodic auto-save setiap 30 detik
  setInterval(function () {
    saveTasksToStorage();
  }, 30000);

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

  // Fungsi global untuk backup/restore
  window.exportTasks = exportTasks;
  window.importTasks = importTasks;
  window.clearAllData = clearAllData;

  // Log informasi untuk debugging
  console.log("To-Do List with localStorage initialized");
  console.log(`Loaded ${tasks.length} tasks from storage`);
});
