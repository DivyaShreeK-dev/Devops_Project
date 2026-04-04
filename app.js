const state = {
  currentRole: "student",
  currentUser: {
    name: "Ananya Rao",
    email: "student@campus.edu",
    role: "student",
    contact: "+91 98765 43210",
    password: "password123"
  },
  courses: [
    { id: 1, code: "CS201", name: "Data Structures", faculty: "Dr. Menon", semester: "Sem 4" },
    { id: 2, code: "CS301", name: "DBMS", faculty: "Prof. Iyer", semester: "Sem 6" },
    { id: 3, code: "CS401", name: "Software Engineering", faculty: "Dr. Kapoor", semester: "Sem 8" }
  ],
  assignments: [
    { id: 1, title: "Linked List Lab", course: "CS201", subject: "Data Structures", deadline: "2026-04-06T18:00", description: "Implement linked list operations", status: "Active" },
    { id: 2, title: "Normalization Worksheet", course: "CS301", subject: "DBMS", deadline: "2026-04-04T22:00", description: "Solve normalization case study", status: "Active" },
    { id: 3, title: "Sprint Retrospective", course: "CS401", subject: "Software Engineering", deadline: "2026-04-10T17:00", description: "Submit agile project report", status: "Active" }
  ],
  submissions: [
    { id: 101, assignmentId: 1, student: "Ananya Rao", file: "linked-list.zip", comments: "Includes complexity notes", submittedAt: "2026-04-04T09:20", status: "Graded", badge: "ontime", grade: "A-", feedback: "Good structure, add more test coverage." },
    { id: 102, assignmentId: 2, student: "Ananya Rao", file: "normalization.pdf", comments: "ER diagram attached", submittedAt: "2026-04-04T23:10", status: "Pending", badge: "late", grade: "-", feedback: "Awaiting faculty review." },
    { id: 103, assignmentId: 3, student: "Rohan Patel", file: "retro-report.pdf", comments: "Sprint notes added", submittedAt: "2026-04-03T11:45", status: "Under Review", badge: "ontime", grade: "-", feedback: "Queued for assessment." }
  ],
  notifications: [
    { id: 1, title: "New assignment posted", message: "DBMS faculty published Normalization Worksheet.", tag: "new" },
    { id: 2, title: "Deadline reminder", message: "Linked List Lab closes in 1 day.", tag: "reminder" },
    { id: 3, title: "Grade released", message: "Your Linked List Lab grade is now available.", tag: "graded" }
  ],
  adminRecords: [
    { id: 1, type: "users", name: "Priya Nair", details: "Faculty | CSE Department" },
    { id: 2, type: "courses", name: "CS402", details: "Cloud Computing | Semester 8" },
    { id: 3, type: "semesters", name: "Semester 6", details: "Jan 2026 - May 2026" }
  ]
};

const refs = {};

document.addEventListener("DOMContentLoaded", () => {
  cacheRefs();
  bindEvents();
  renderAll();
});

function cacheRefs() {
  [
    "auth-panel", "app", "login-form", "signup-form", "login-role", "current-role-label",
    "welcome-title", "welcome-copy", "profile-name", "profile-role", "overview-highlights",
    "notifications-list", "courses-list", "deadline-list", "assignment-select",
    "assignment-list", "submission-history", "faculty-submissions", "grading-select",
    "gradebook-list", "admin-records", "report-cards", "report-table", "profile-summary",
    "global-search", "profile-input-name", "profile-input-contact", "profile-input-password",
    "submission-form", "assignment-form", "grading-form", "admin-form", "logout-button"
  ].forEach(id => {
    refs[toCamel(id)] = document.getElementById(id);
  });
}

function bindEvents() {
  document.querySelectorAll("[data-auth-tab]").forEach(button => {
    button.addEventListener("click", () => switchAuthTab(button.dataset.authTab));
  });

  refs.loginForm.addEventListener("submit", handleLogin);
  refs.signupForm.addEventListener("submit", handleSignup);
  refs.submissionForm.addEventListener("submit", handleSubmission);
  refs.assignmentForm.addEventListener("submit", handleAssignmentCreate);
  refs.gradingForm.addEventListener("submit", handleGradeSubmit);
  refs.adminForm.addEventListener("submit", handleAdminRecord);
  refs.logoutButton.addEventListener("click", logout);
  document.getElementById("profile-form").addEventListener("submit", handleProfileSave);
  refs.globalSearch.addEventListener("input", renderAssignmentsTable);

  document.querySelectorAll(".nav-link").forEach(button => {
    button.addEventListener("click", () => switchSection(button.dataset.section));
  });

  document.addEventListener("click", handleDynamicActions);
}

function switchAuthTab(tab) {
  document.querySelectorAll("[data-auth-tab]").forEach(button => {
    button.classList.toggle("active", button.dataset.authTab === tab);
  });
  refs.loginForm.classList.toggle("active", tab === "login");
  refs.signupForm.classList.toggle("active", tab === "signup");
}

function handleLogin(event) {
  event.preventDefault();
  const role = refs.loginRole.value;
  state.currentRole = role;
  state.currentUser.role = role;
  state.currentUser.email = document.getElementById("login-email").value;
  state.currentUser.name = role === "faculty" ? "Dr. Kavya Menon" : role === "admin" ? "Admin Office" : "Ananya Rao";
  state.currentUser.contact = role === "faculty" ? "+91 90000 12345" : role === "admin" ? "+91 91234 56789" : "+91 98765 43210";
  refs.authPanel.classList.add("hidden");
  refs.app.classList.remove("hidden");
  switchSection("overview");
  renderAll();
}

function handleSignup(event) {
  event.preventDefault();
  state.currentUser = {
    ...state.currentUser,
    name: document.getElementById("signup-name").value,
    email: document.getElementById("signup-email").value,
    role: document.getElementById("signup-role").value,
    contact: "Not set",
    password: document.getElementById("signup-password").value
  };
  state.currentRole = state.currentUser.role;
  refs.authPanel.classList.add("hidden");
  refs.app.classList.remove("hidden");
  switchSection("overview");
  renderAll();
}

function logout() {
  refs.app.classList.add("hidden");
  refs.authPanel.classList.remove("hidden");
}

function switchSection(section) {
  document.querySelectorAll(".nav-link").forEach(button => {
    button.classList.toggle("active", button.dataset.section === section);
  });
  document.querySelectorAll(".section-panel").forEach(panel => {
    panel.classList.toggle("active", panel.id === `${section}-section`);
  });
}

function handleSubmission(event) {
  event.preventDefault();
  const assignmentId = Number(refs.assignmentSelect.value);
  const assignment = state.assignments.find(item => item.id === assignmentId);
  const submittedAt = new Date().toISOString().slice(0, 16);
  state.submissions.unshift({
    id: Date.now(),
    assignmentId,
    student: state.currentUser.name,
    file: document.getElementById("file-name").value.trim(),
    comments: document.getElementById("submission-comment").value.trim(),
    submittedAt,
    status: "Pending",
    badge: new Date(submittedAt) <= new Date(assignment.deadline) ? "ontime" : "late",
    grade: "-",
    feedback: "Submission received. Faculty review pending."
  });
  state.notifications.unshift({
    id: Date.now() + 1,
    title: "Submission uploaded",
    message: `${assignment.title} was submitted by ${state.currentUser.name}.`,
    tag: "new"
  });
  refs.submissionForm.reset();
  renderAll();
}

function handleAssignmentCreate(event) {
  event.preventDefault();
  const title = document.getElementById("assignment-title").value.trim();
  const course = document.getElementById("assignment-course").value.trim();
  state.assignments.unshift({
    id: Date.now(),
    title,
    course,
    subject: course,
    deadline: document.getElementById("assignment-deadline").value,
    description: document.getElementById("assignment-description").value.trim(),
    status: "Active"
  });
  state.notifications.unshift({
    id: Date.now() + 2,
    title: "New assignment created",
    message: `${title} has been published for ${course}.`,
    tag: "new"
  });
  refs.assignmentForm.reset();
  renderAll();
}

function handleGradeSubmit(event) {
  event.preventDefault();
  const submissionId = Number(refs.gradingSelect.value);
  const target = state.submissions.find(item => item.id === submissionId);
  if (!target) return;
  target.grade = document.getElementById("grade-input").value.trim() || "Published";
  target.feedback = document.getElementById("feedback-input").value.trim() || "Feedback shared.";
  target.status = "Graded";
  state.notifications.unshift({
    id: Date.now() + 3,
    title: "Submission graded",
    message: `${target.student} received feedback for ${assignmentLabel(target.assignmentId)}.`,
    tag: "graded"
  });
  refs.gradingForm.reset();
  renderAll();
}

function handleAdminRecord(event) {
  event.preventDefault();
  state.adminRecords.unshift({
    id: Date.now(),
    type: document.getElementById("admin-category").value,
    name: document.getElementById("admin-name").value.trim(),
    details: document.getElementById("admin-details").value.trim()
  });
  refs.adminForm.reset();
  renderAll();
}

function handleProfileSave(event) {
  event.preventDefault();
  state.currentUser.name = refs.profileInputName.value.trim() || state.currentUser.name;
  state.currentUser.contact = refs.profileInputContact.value.trim() || state.currentUser.contact;
  const maybePassword = refs.profileInputPassword.value.trim();
  if (maybePassword) state.currentUser.password = maybePassword;
  refs.profileInputPassword.value = "";
  renderHeader();
  renderProfileSummary();
}

function handleDynamicActions(event) {
  const button = event.target.closest(".inline-button");
  if (!button) return;
  if (button.dataset.action === "delete-assignment") {
    state.assignments = state.assignments.filter(item => item.id !== Number(button.dataset.id));
  }
  if (button.dataset.action === "mark-review") {
    const submission = state.submissions.find(item => item.id === Number(button.dataset.id));
    if (submission) submission.status = "Under Review";
  }
  renderAll();
}

function renderAll() {
  renderHeader();
  renderRoleVisibility();
  renderOverview();
  renderAssignmentOptions();
  renderAssignmentsTable();
  renderSubmissionHistory();
  renderFacultySubmissions();
  renderGradingOptions();
  renderGradebook();
  renderAdminRecords();
  renderReports();
  renderProfileSummary();
}

function renderHeader() {
  const roleLabel = capitalize(state.currentRole);
  refs.currentRoleLabel.textContent = `${roleLabel} workspace`;
  refs.profileName.textContent = state.currentUser.name;
  refs.profileRole.textContent = roleLabel;
  refs.welcomeTitle.textContent = `Welcome, ${state.currentUser.name.split(" ")[0]}`;
  refs.welcomeCopy.textContent = roleCopy(state.currentRole);
  refs.profileInputName.value = state.currentUser.name;
  refs.profileInputContact.value = state.currentUser.contact;
}

function renderRoleVisibility() {
  const isFaculty = state.currentRole === "faculty";
  const isAdmin = state.currentRole === "admin";
  document.querySelectorAll(".faculty-only").forEach(node => node.classList.toggle("role-hidden", !isFaculty));
  document.querySelectorAll(".admin-only").forEach(node => node.classList.toggle("role-hidden", !isAdmin));
  document.querySelectorAll(".admin-only-shared").forEach(node => node.classList.toggle("role-hidden", !(isFaculty || isAdmin)));
}

function renderOverview() {
  refs.overviewHighlights.innerHTML = metricsForRole().map(item => `
    <article class="metric-card">
      <span>${item.label}</span><strong>${item.value}</strong><p class="muted-text">${item.detail}</p>
    </article>
  `).join("");

  refs.notificationsList.innerHTML = state.notifications.slice(0, 5).map(item => `
    <article class="stack-item">
      <div class="stack-item-header"><h4>${item.title}</h4><span class="badge ${notificationBadge(item.tag)}">${capitalize(item.tag)}</span></div>
      <p>${item.message}</p>
    </article>
  `).join("");

  refs.coursesList.innerHTML = state.courses.map(course => `
    <article class="stack-item">
      <div class="stack-item-header"><h4>${course.code} - ${course.name}</h4><span class="badge active">${course.semester}</span></div>
      <p>Faculty: ${course.faculty}</p>
    </article>
  `).join("");

  refs.deadlineList.innerHTML = [...state.assignments].sort((a, b) => new Date(a.deadline) - new Date(b.deadline)).slice(0, 4).map(item => `
    <article class="stack-item">
      <div class="stack-item-header"><h4>${item.title}</h4><span class="badge ${deadlineBadge(item.deadline)}">${deadlineText(item.deadline)}</span></div>
      <p>${item.course} | ${formatDate(item.deadline)}</p>
    </article>
  `).join("");
}

function renderAssignmentOptions() {
  refs.assignmentSelect.innerHTML = state.assignments.map(item => `<option value="${item.id}">${item.title} - ${item.course}</option>`).join("");
}

function renderAssignmentsTable() {
  const search = refs.globalSearch.value.trim().toLowerCase();
  const filtered = state.assignments.filter(item => [item.title, item.course, item.subject, item.status].join(" ").toLowerCase().includes(search));
  refs.assignmentList.innerHTML = tableTemplate(
    ["Title", "Course", "Deadline", "Status", "Action"],
    filtered.map(item => `
      <tr>
        <td>${item.title}</td>
        <td>${item.course}</td>
        <td>${formatDate(item.deadline)}</td>
        <td><span class="badge ${deadlineBadge(item.deadline)}">${deadlineText(item.deadline)}</span></td>
        <td><div class="inline-actions"><button class="inline-button" type="button">View</button>${(state.currentRole === "faculty" || state.currentRole === "admin") ? `<button class="inline-button" type="button" data-action="delete-assignment" data-id="${item.id}">Delete</button>` : ""}</div></td>
      </tr>
    `)
  );
}

function renderSubmissionHistory() {
  refs.submissionHistory.innerHTML = tableTemplate(
    ["Assignment", "Student", "Status", "Submitted Time", "File Link", "Deadline"],
    visibleSubmissions().map(item => `
      <tr>
        <td>${assignmentLabel(item.assignmentId)}</td>
        <td>${item.student}</td>
        <td><span class="badge ${statusBadge(item.status)}">${item.status}</span></td>
        <td>${formatDate(item.submittedAt)}</td>
        <td><a href="#" onclick="return false;">${item.file}</a></td>
        <td><span class="badge ${item.badge}">${item.badge === "ontime" ? "On Time" : "Late"}</span></td>
      </tr>
    `)
  );
}

function renderFacultySubmissions() {
  refs.facultySubmissions.innerHTML = tableTemplate(
    ["Assignment", "Student", "Comments", "Status", "Action"],
    state.submissions.map(item => `
      <tr>
        <td>${assignmentLabel(item.assignmentId)}</td>
        <td>${item.student}</td>
        <td>${item.comments}</td>
        <td><span class="badge ${statusBadge(item.status)}">${item.status}</span></td>
        <td><button class="inline-button" type="button" data-action="mark-review" data-id="${item.id}">Mark Review</button></td>
      </tr>
    `)
  );
}

function renderGradingOptions() {
  refs.gradingSelect.innerHTML = state.submissions.map(item => `<option value="${item.id}">${item.student} - ${assignmentLabel(item.assignmentId)}</option>`).join("");
}

function renderGradebook() {
  refs.gradebookList.innerHTML = visibleSubmissions().map(item => `
    <article class="stack-item">
      <div class="stack-item-header"><h4>${assignmentLabel(item.assignmentId)}</h4><span class="badge ${statusBadge(item.status)}">${item.grade}</span></div>
      <p>${item.feedback}</p>
    </article>
  `).join("");
}

function renderAdminRecords() {
  refs.adminRecords.innerHTML = state.adminRecords.map(item => `
    <article class="stack-item">
      <div class="stack-item-header"><h4>${capitalize(item.type.slice(0, -1) || item.type)}: ${item.name}</h4><span class="badge active">${capitalize(item.type)}</span></div>
      <p>${item.details}</p>
    </article>
  `).join("");
}

function renderReports() {
  const totalSubmissions = state.submissions.length;
  const pending = state.submissions.filter(item => item.status !== "Graded").length;
  const onTime = state.submissions.filter(item => item.badge === "ontime").length;
  const graded = state.submissions.filter(item => item.status === "Graded").length;

  refs.reportCards.innerHTML = [
    { label: "Submission count", value: totalSubmissions, detail: "All uploaded work items" },
    { label: "Pending assignments", value: pending, detail: "Awaiting grading or review" },
    { label: "On-time delivery", value: onTime, detail: "Submissions before due time" },
    { label: "Grades published", value: graded, detail: "Feedback already visible" }
  ].map(item => `<article class="metric-card"><span>${item.label}</span><strong>${item.value}</strong><p class="muted-text">${item.detail}</p></article>`).join("");

  refs.reportTable.innerHTML = tableTemplate(
    ["Course", "Assignments", "Submissions", "Pending"],
    state.courses.map(course => {
      const assignments = state.assignments.filter(item => item.course === course.code);
      const submissionCount = state.submissions.filter(item => assignments.some(entry => entry.id === item.assignmentId)).length;
      const pendingCount = state.submissions.filter(item => assignments.some(entry => entry.id === item.assignmentId) && item.status !== "Graded").length;
      return `<tr><td>${course.code}</td><td>${assignments.length}</td><td>${submissionCount}</td><td>${pendingCount}</td></tr>`;
    })
  );
}

function renderProfileSummary() {
  refs.profileSummary.innerHTML = [
    ["Name", state.currentUser.name],
    ["Email", state.currentUser.email],
    ["Role", capitalize(state.currentRole)],
    ["Contact", state.currentUser.contact]
  ].map(([label, value]) => `<article class="stack-item"><div class="stack-item-header"><h4>${label}</h4></div><p>${value}</p></article>`).join("");
}

function visibleSubmissions() {
  return state.currentRole === "student" ? state.submissions.filter(item => item.student === state.currentUser.name) : state.submissions;
}

function metricsForRole() {
  if (state.currentRole === "faculty") {
    return [
      { label: "Assignments published", value: state.assignments.length, detail: "Total active faculty-created tasks" },
      { label: "Submissions received", value: state.submissions.length, detail: "Student uploads in queue" },
      { label: "Needs grading", value: state.submissions.filter(item => item.status !== "Graded").length, detail: "Pending review workload" },
      { label: "Courses handled", value: state.courses.length, detail: "Classes in this dashboard" }
    ];
  }
  if (state.currentRole === "admin") {
    return [
      { label: "Users managed", value: 148, detail: "Students, faculty, and staff accounts" },
      { label: "Courses active", value: state.courses.length, detail: "Visible in current semester" },
      { label: "Semesters tracked", value: 6, detail: "Historical and current academic terms" },
      { label: "Alerts pending", value: state.notifications.length, detail: "Operational follow-ups" }
    ];
  }
  return [
    { label: "Courses enrolled", value: state.courses.length, detail: "Current semester load" },
    { label: "Assignments due", value: state.assignments.length, detail: "Tasks requiring attention" },
    { label: "Submitted", value: visibleSubmissions().length, detail: "Visible in your history" },
    { label: "Grades released", value: visibleSubmissions().filter(item => item.status === "Graded").length, detail: "Feedback already available" }
  ];
}

function roleCopy(role) {
  if (role === "faculty") return "Create assignments, inspect student uploads, and publish grades with feedback.";
  if (role === "admin") return "Manage platform records, monitor activity, and keep academic workflows organized.";
  return "Review courses, submit assignments, and track deadlines with clear status badges.";
}

function tableTemplate(headers, rows) {
  return `<div class="table-wrap"><table><thead><tr>${headers.map(head => `<th>${head}</th>`).join("")}</tr></thead><tbody>${rows.join("")}</tbody></table></div>`;
}

function assignmentLabel(id) {
  const assignment = state.assignments.find(item => item.id === id);
  return assignment ? assignment.title : "Assignment";
}

function formatDate(value) {
  return new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

function deadlineText(deadline) {
  return new Date(deadline) >= new Date() ? "Open" : "Closed";
}

function deadlineBadge(deadline) {
  return new Date(deadline) >= new Date() ? "ontime" : "late";
}

function statusBadge(status) {
  const normalized = status.toLowerCase();
  if (normalized.includes("graded")) return "graded";
  if (normalized.includes("review")) return "review";
  return "pending";
}

function notificationBadge(tag) {
  if (tag === "graded") return "graded";
  if (tag === "reminder") return "review";
  return "active";
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function toCamel(value) {
  return value.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}
