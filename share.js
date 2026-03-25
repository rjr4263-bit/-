const savedProfilesKey = "my-page-saved-profiles";
const sharedProfilesKey = "my-page-shared-profiles";
const savedProfileSelect = document.querySelector("#saved-profile-select");
const shareProfileForm = document.querySelector("#share-profile-form");
const shareAuthorInput = document.querySelector("#share-author");
const shareMessageInput = document.querySelector("#share-message");
const shareMessageText = document.querySelector("#share-message-text");
const refreshSavedButton = document.querySelector("#refresh-saved");
const publicShareList = document.querySelector("#public-share-list");
const privateShareList = document.querySelector("#private-share-list");
const menuLinks = document.querySelectorAll(".menu a[href^='#']");
const sections = document.querySelectorAll(".section, .hero");

const shareMessages = {
  needSaved: "Shareable profile sheets are needed first. Save one on the first page.",
  needAuthor: "A share name is required.",
  shared: "Your profile sheet has been shared.",
  deleted: "The shared post has been deleted.",
  refreshed: "Saved profile sheets have been refreshed.",
  emptyPublic: "No public shares yet.",
  emptyPrivate: "No private shares yet.",
};

const formatBirthday = (value) => {
  if (!value) {
    return "";
  }

  return value.replaceAll("-", ".");
};

const getSavedProfiles = () => {
  try {
    const raw = localStorage.getItem(savedProfilesKey);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const getSharedProfiles = () => {
  try {
    const raw = localStorage.getItem(sharedProfilesKey);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const setSharedProfiles = (profiles) => {
  localStorage.setItem(sharedProfilesKey, JSON.stringify(profiles));
};

const populateSavedProfiles = () => {
  const savedProfiles = getSavedProfiles();
  savedProfileSelect.innerHTML = "";

  if (savedProfiles.length === 0) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "No saved profile sheets";
    savedProfileSelect.appendChild(option);
    shareAuthorInput.value = "";
    return;
  }

  savedProfiles.forEach((profile, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = `${profile.name} / ${formatBirthday(profile.birthday)}`;
    savedProfileSelect.appendChild(option);
  });

  shareAuthorInput.value = savedProfiles[0].name || "";
};

const createEmptyCard = (message) => {
  const card = document.createElement("article");
  card.className = "saved-empty";

  const title = document.createElement("h4");
  title.textContent = "Empty";

  const text = document.createElement("p");
  text.textContent = message;

  card.appendChild(title);
  card.appendChild(text);
  return card;
};

const renderShareList = (container, items, emptyMessage) => {
  container.innerHTML = "";

  if (items.length === 0) {
    container.appendChild(createEmptyCard(emptyMessage));
    return;
  }

  items.forEach((item) => {
    const card = document.createElement("article");
    card.className = "saved-card share-card";

    const badge = document.createElement("span");
    badge.className = `share-badge ${item.visibility}`;
    badge.textContent = item.visibility === "public" ? "Public" : "Private";

    const title = document.createElement("h4");
    title.textContent = item.shareAuthor;

    const meta = document.createElement("p");
    meta.className = "saved-meta";
    meta.textContent = `${item.profile.name} / ${item.profile.age} / ${formatBirthday(item.profile.birthday)}`;

    const careers = document.createElement("p");
    careers.className = "saved-meta";
    careers.textContent = item.profile.careers.length > 0 ? item.profile.careers.join(" / ") : "No career history";

    const hobbies = document.createElement("p");
    hobbies.className = "saved-meta";
    hobbies.textContent = item.profile.hobbies.length > 0 ? item.profile.hobbies.join(" / ") : "No hobbies";

    const message = document.createElement("p");
    message.className = "share-note";
    message.textContent = item.message || item.profile.bio || "No message";

    const actions = document.createElement("div");
    actions.className = "saved-actions";

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "small-button";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => {
      const nextProfiles = getSharedProfiles().filter((profile) => profile.id !== item.id);
      setSharedProfiles(nextProfiles);
      renderSharedProfiles();
      shareMessageText.textContent = shareMessages.deleted;
    });

    actions.appendChild(deleteButton);
    card.appendChild(badge);
    card.appendChild(title);
    card.appendChild(meta);
    card.appendChild(careers);
    card.appendChild(hobbies);
    card.appendChild(message);
    card.appendChild(actions);
    container.appendChild(card);
  });
};

const renderSharedProfiles = () => {
  const sharedProfiles = getSharedProfiles();
  const publicItems = sharedProfiles.filter((item) => item.visibility === "public");
  const privateItems = sharedProfiles.filter((item) => item.visibility === "private");

  renderShareList(publicShareList, publicItems, shareMessages.emptyPublic);
  renderShareList(privateShareList, privateItems, shareMessages.emptyPrivate);
};

savedProfileSelect.addEventListener("change", () => {
  const savedProfiles = getSavedProfiles();
  const selectedProfile = savedProfiles[Number(savedProfileSelect.value)];

  if (!selectedProfile) {
    shareAuthorInput.value = "";
    return;
  }

  shareAuthorInput.value = selectedProfile.name || "";
});

refreshSavedButton.addEventListener("click", () => {
  populateSavedProfiles();
  shareMessageText.textContent = shareMessages.refreshed;
});

shareProfileForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const savedProfiles = getSavedProfiles();
  const selectedProfile = savedProfiles[Number(savedProfileSelect.value)];
  const visibility = shareProfileForm.elements.visibility.value;
  const shareAuthor = shareAuthorInput.value.trim();
  const message = shareMessageInput.value.trim();

  if (!selectedProfile) {
    shareMessageText.textContent = shareMessages.needSaved;
    return;
  }

  if (!shareAuthor) {
    shareMessageText.textContent = shareMessages.needAuthor;
    return;
  }

  const sharedProfiles = getSharedProfiles();
  sharedProfiles.unshift({
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    shareAuthor,
    visibility,
    message,
    createdAt: new Date().toISOString(),
    profile: selectedProfile,
  });

  setSharedProfiles(sharedProfiles);
  renderSharedProfiles();
  shareMessageText.textContent = shareMessages.shared;
  shareProfileForm.reset();
  populateSavedProfiles();
});

sections.forEach((section) => {
  section.classList.add("reveal");
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    });
  },
  { threshold: 0.18 }
);

sections.forEach((section) => observer.observe(section));

const activateMenu = () => {
  let currentId = "share-home";

  sections.forEach((section) => {
    if (window.scrollY >= section.offsetTop - 120) {
      currentId = section.id;
    }
  });

  menuLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === `#${currentId}`;
    link.classList.toggle("is-active", isActive);
  });
};

window.addEventListener("scroll", activateMenu);
window.addEventListener("load", activateMenu);

populateSavedProfiles();
renderSharedProfiles();
