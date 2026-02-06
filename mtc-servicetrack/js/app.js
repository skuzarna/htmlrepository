const STORAGE_KEY = "mtcTickets";

const statusStyles = {
  Submitted: "status-submitted",
  "In Progress": "status-in-progress",
  Resolved: "status-resolved",
  Escalated: "status-escalated",
};

const statusOptions = ["Submitted", "In Progress", "Resolved", "Escalated"];

const loadTickets = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

const saveTickets = (tickets) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
};

const generateTicketId = () => {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `MTC-${datePart}-${randomPart}`;
};

const formatDate = (dateString) =>
  new Date(dateString).toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });

const createStatusBadge = (status) => {
  const badge = document.createElement("span");
  badge.className = `status-badge ${statusStyles[status] || "status-submitted"}`;
  badge.textContent = status;
  return badge;
};

const renderTicketCards = (container, tickets) => {
  container.innerHTML = "";
  if (!tickets.length) {
    container.innerHTML = "<p>No tickets found. Try searching by ticket ID or email.</p>";
    return;
  }

  tickets.forEach((ticket) => {
    const card = document.createElement("article");
    card.className = "glass-card";
    card.innerHTML = `
      <h3>${ticket.subject}</h3>
      <p><strong>Ticket ID:</strong> ${ticket.id}</p>
      <p><strong>Customer:</strong> ${ticket.name}</p>
      <p><strong>Category:</strong> ${ticket.category}</p>
      <p><strong>Priority:</strong> ${ticket.priority}</p>
      <p><strong>Created:</strong> ${formatDate(ticket.createdAt)}</p>
    `;
    card.appendChild(createStatusBadge(ticket.status));
    container.appendChild(card);
  });
};

const setupSubmissionForm = () => {
  const form = document.querySelector("#ticket-form");
  if (!form) return;

  const modal = document.querySelector("#success-modal");
  const modalId = document.querySelector("#modal-ticket-id");
  const closeModal = document.querySelector("#close-modal");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const ticket = {
      id: generateTicketId(),
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      subject: formData.get("subject"),
      category: formData.get("category"),
      priority: formData.get("priority"),
      description: formData.get("description"),
      status: "Submitted",
      createdAt: new Date().toISOString(),
      updates: [],
    };

    const tickets = loadTickets();
    tickets.unshift(ticket);
    saveTickets(tickets);

    modalId.textContent = ticket.id;
    modal.classList.add("active");
    form.reset();
  });

  closeModal?.addEventListener("click", () => {
    modal.classList.remove("active");
  });
};

const setupTrackingPage = () => {
  const container = document.querySelector("#tracking-results");
  const form = document.querySelector("#tracking-form");
  if (!container || !form) return;

  const tickets = loadTickets();
  renderTicketCards(container, tickets);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const search = new FormData(form).get("query").toLowerCase();
    const filtered = loadTickets().filter(
      (ticket) =>
        ticket.id.toLowerCase().includes(search) ||
        ticket.email.toLowerCase().includes(search)
    );
    renderTicketCards(container, filtered);
  });
};

const setupAgentDashboard = () => {
  const tableBody = document.querySelector("#agent-table-body");
  if (!tableBody) return;

  const renderRows = () => {
    const tickets = loadTickets();
    tableBody.innerHTML = "";

    tickets.forEach((ticket) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${ticket.id}</td>
        <td>${ticket.subject}</td>
        <td>${ticket.name}</td>
        <td>${ticket.priority}</td>
        <td></td>
        <td>${formatDate(ticket.createdAt)}</td>
      `;

      const statusCell = row.querySelector("td:nth-child(5)");
      statusCell.appendChild(createStatusBadge(ticket.status));

      const actionCell = document.createElement("td");
      const select = document.createElement("select");
      select.className = "glass-select";
      statusOptions.forEach((status) => {
        const option = document.createElement("option");
        option.value = status;
        option.textContent = status;
        option.selected = status === ticket.status;
        select.appendChild(option);
      });
      select.addEventListener("change", () => {
        ticket.status = select.value;
        ticket.updates.push({
          status: select.value,
          updatedAt: new Date().toISOString(),
        });
        saveTickets(tickets);
        renderRows();
      });
      actionCell.appendChild(select);
      row.appendChild(actionCell);
      tableBody.appendChild(row);
    });
  };

  renderRows();
};

const setupSupervisorDashboard = () => {
  const statsContainer = document.querySelector("#supervisor-stats");
  const tableBody = document.querySelector("#supervisor-table-body");
  if (!statsContainer || !tableBody) return;

  const renderDashboard = () => {
    const tickets = loadTickets();
    const stats = statusOptions.reduce(
      (acc, status) => ({
        ...acc,
        [status]: tickets.filter((ticket) => ticket.status === status).length,
      }),
      {}
    );

    statsContainer.innerHTML = "";
    statusOptions.forEach((status) => {
      const card = document.createElement("div");
      card.className = "glass-panel kpi";
      card.innerHTML = `
        <span>${status}</span>
        <strong>${stats[status] || 0}</strong>
      `;
      statsContainer.appendChild(card);
    });

    tableBody.innerHTML = "";
    tickets.slice(0, 8).forEach((ticket) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${ticket.id}</td>
        <td>${ticket.subject}</td>
        <td>${ticket.category}</td>
        <td>${ticket.priority}</td>
        <td>${ticket.name}</td>
        <td>${formatDate(ticket.createdAt)}</td>
      `;
      const statusCell = document.createElement("td");
      statusCell.appendChild(createStatusBadge(ticket.status));
      row.appendChild(statusCell);
      tableBody.appendChild(row);
    });
  };

  renderDashboard();
};

setupSubmissionForm();
setupTrackingPage();
setupAgentDashboard();
setupSupervisorDashboard();
