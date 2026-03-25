const sections = document.querySelectorAll(".section, .hero");
const menuLinks = document.querySelectorAll(".menu a");
const profileForm = document.querySelector("#profile-form");
const careerList = document.querySelector("#career-list");
const addCareerButton = document.querySelector("#add-career");
const hobbyList = document.querySelector("#hobby-list");
const addHobbyButton = document.querySelector("#add-hobby");
const saveProfileButton = document.querySelector("#save-profile");
const resetProfileButton = document.querySelector("#reset-profile");
const formMessage = document.querySelector("#form-message");
const savedProfilesContainer = document.querySelector("#saved-profiles");
const profileImage = document.querySelector("#profile-image");
const profileName = document.querySelector("#profile-name");
const profileAge = document.querySelector("#profile-age");
const profileBirthday = document.querySelector("#profile-birthday");
const profileCareers = document.querySelector("#profile-careers");
const profileBio = document.querySelector("#profile-bio");
const hobbyCards = [
  {
    title: document.querySelector("#hobby-title-1"),
    text: document.querySelector("#hobby-text-1"),
  },
  {
    title: document.querySelector("#hobby-title-2"),
    text: document.querySelector("#hobby-text-2"),
  },
  {
    title: document.querySelector("#hobby-title-3"),
    text: document.querySelector("#hobby-text-3"),
  },
  {
    title: document.querySelector("#hobby-title-4"),
    text: document.querySelector("#hobby-text-4"),
  },
];
const storageKey = "my-page-saved-profiles";
let currentProfile = null;

const defaults = {
  name: "Hong Gil-dong",
  age: "26",
  birthday: "2000-05-15",
  careers: ["Frontend Intern - 1 year", "Web Agency - 2 years"],
  hobbies: ["Photography", "Movie", "Running", "Reading"],
  bio: "I enjoy building clear and friendly user experiences, and I care about details while continuing to grow as a developer.",
  image: "profile-placeholder.svg",
};

const messages = {
  maxCareers: "You can enter up to 4 career items.",
  maxHobbies: "You can enter up to 4 hobbies.",
  maxSaved: "You can save up to 3 profile sheets.",
  required: "Name, age, and birthday are required.",
  reset: "The default profile has been restored.",
  applied: "Your profile has been updated in the About section.",
  saved: "Your profile sheet has been saved.",
  loaded: "The saved profile sheet has been loaded.",
  deleted: "The saved profile sheet has been deleted.",
  emptyCareer: "No career history added yet.",
  emptyBio: "Your introduction will appear here after you write it.",
  emptySaved: "Saved profile sheets will appear here. You can keep up to 3.",
};

const formatBirthday = (value) => {
  if (!value) {
    return "";
  }

  return value.replaceAll("-", ".");
};

const updateListButtonState = (list, button) => {
  button.disabled = list.querySelectorAll(".career-row").length >= 4;
};

const buildRemoveButton = (row, list, syncFn, buttonControl) => {
  const removeButton = document.createElement("button");
  removeButton.type = "button";
  removeButton.className = "small-button";
  removeButton.textContent = "Delete";
  removeButton.addEventListener("click", () => {
    row.remove();

    if (list.children.length === 0) {
      list.appendChild(createCareerRow(""));
    }

    syncFn();
    updateListButtonState(list, buttonControl);
  });

  return removeButton;
};

const createCareerRow = (value = "") => {
  const row = document.createElement("div");
  row.className = "career-row";

  const input = document.createElement("input");
  input.name = "career";
  input.type = "text";
  input.placeholder = "Example: Frontend Developer - 2 years";
  input.value = value;
  row.appendChild(input);

  return row;
};

const syncRows = (list, buttonControl) => {
  const rows = Array.from(list.querySelectorAll(".career-row"));

  rows.forEach((row) => {
    const button = row.querySelector(".small-button");
    if (button) {
      button.remove();
    }
  });

  if (rows.length <= 1) {
    return;
  }

  rows.forEach((row) => {
    row.appendChild(buildRemoveButton(row, list, () => syncRows(list, buttonControl), buttonControl));
  });
};

const applyHobbies = (hobbies) => {
  hobbyCards.forEach((card, index) => {
    const hobby = hobbies[index];

    if (hobby) {
      card.title.textContent = hobby;
      card.text.textContent = `${hobby} is one of the activities I enjoy in my free time.`;
      return;
    }

    card.title.textContent = "Empty Hobby";
    card.text.textContent = "Add a hobby in the editor to show it here.";
  });
};

const applyProfile = ({ name, age, birthday, careers, hobbies, bio, image }) => {
  profileName.textContent = name;
  profileAge.textContent = `${age}`;
  profileBirthday.textContent = formatBirthday(birthday);
  profileCareers.textContent = careers.length > 0 ? careers.join(" / ") : messages.emptyCareer;
  profileBio.textContent = bio || messages.emptyBio;
  profileImage.src = image || defaults.image;
  applyHobbies(hobbies);
  currentProfile = {
    name,
    age,
    birthday,
    careers: [...careers],
    hobbies: [...hobbies],
    bio,
    image: image || defaults.image,
  };
};

const fillList = (list, items, buttonControl) => {
  list.innerHTML = "";

  if (items.length === 0) {
    list.appendChild(createCareerRow(""));
  } else {
    items.forEach((item) => {
      list.appendChild(createCareerRow(item));
    });
  }

  syncRows(list, buttonControl);
  updateListButtonState(list, buttonControl);
};

const fillForm = ({ name, age, birthday, careers, hobbies, bio }) => {
  profileForm.name.value = name;
  profileForm.age.value = age;
  profileForm.birthday.value = birthday;
  profileForm.bio.value = bio;
  fillList(careerList, careers, addCareerButton);
  fillList(hobbyList, hobbies, addHobbyButton);
};

const getSavedProfiles = () => {
  try {
    const raw = localStorage.getItem(storageKey);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.slice(0, 3) : [];
  } catch {
    return [];
  }
};

const setSavedProfiles = (profiles) => {
  localStorage.setItem(storageKey, JSON.stringify(profiles.slice(0, 3)));
};

const renderSavedProfiles = () => {
  const profiles = getSavedProfiles();
  savedProfilesContainer.innerHTML = "";

  if (profiles.length === 0) {
    const empty = document.createElement("article");
    empty.className = "saved-empty";
    empty.innerHTML = `
      <h4>Empty</h4>
      <p>${messages.emptySaved}</p>
    `;
    savedProfilesContainer.appendChild(empty);
    return;
  }

  profiles.forEach((profile, index) => {
    const card = document.createElement("article");
    card.className = "saved-card";

    const title = document.createElement("h4");
    title.textContent = profile.name;

    const meta = document.createElement("p");
    meta.className = "saved-meta";
    meta.textContent = `Age ${profile.age} / Birthday ${formatBirthday(profile.birthday)}`;

    const actions = document.createElement("div");
    actions.className = "saved-actions";

    const loadButton = document.createElement("button");
    loadButton.type = "button";
    loadButton.className = "small-button";
    loadButton.textContent = "Load";
    loadButton.addEventListener("click", () => {
      fillForm(profile);
      applyProfile(profile);
      formMessage.textContent = messages.loaded;
      location.hash = "#about";
    });

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "small-button";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => {
      const nextProfiles = getSavedProfiles().filter((_, savedIndex) => savedIndex !== index);
      setSavedProfiles(nextProfiles);
      renderSavedProfiles();
      formMessage.textContent = messages.deleted;
    });

    actions.appendChild(loadButton);
    actions.appendChild(deleteButton);
    card.appendChild(title);
    card.appendChild(meta);
    card.appendChild(actions);
    savedProfilesContainer.appendChild(card);
  });
};

const collectProfileFromForm = () => {
  const formData = new FormData(profileForm);
  const name = formData.get("name").toString().trim();
  const age = formData.get("age").toString().trim();
  const birthday = formData.get("birthday").toString();
  const bio = formData.get("bio").toString().trim();
  const careers = Array.from(careerList.querySelectorAll('input[name="career"]'))
    .map((input) => input.value.trim())
    .filter(Boolean)
    .slice(0, 4);
  const hobbies = Array.from(hobbyList.querySelectorAll('input[name="career"]'))
    .map((input) => input.value.trim())
    .filter(Boolean)
    .slice(0, 4);

  return {
    name,
    age,
    birthday,
    careers,
    hobbies,
    bio,
    image: currentProfile?.image || profileImage.getAttribute("src") || defaults.image,
  };
};

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
  let currentId = "home";

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

addCareerButton.addEventListener("click", () => {
  if (careerList.querySelectorAll(".career-row").length >= 4) {
    formMessage.textContent = messages.maxCareers;
    return;
  }

  careerList.appendChild(createCareerRow(""));
  syncRows(careerList, addCareerButton);
  updateListButtonState(careerList, addCareerButton);
  formMessage.textContent = "";
});

addHobbyButton.addEventListener("click", () => {
  if (hobbyList.querySelectorAll(".career-row").length >= 4) {
    formMessage.textContent = messages.maxHobbies;
    return;
  }

  hobbyList.appendChild(createCareerRow(""));
  syncRows(hobbyList, addHobbyButton);
  updateListButtonState(hobbyList, addHobbyButton);
  formMessage.textContent = "";
});

resetProfileButton.addEventListener("click", () => {
  profileForm.reset();
  fillForm(defaults);
  applyProfile(defaults);
  formMessage.textContent = messages.reset;
});

saveProfileButton.addEventListener("click", () => {
  const profile = collectProfileFromForm();
  const photoFile = profileForm.photo.files[0];

  if (!profile.name || !profile.age || !profile.birthday) {
    formMessage.textContent = messages.required;
    return;
  }

  const finishSave = () => {
    const profiles = getSavedProfiles();

    if (profiles.length >= 3) {
      formMessage.textContent = messages.maxSaved;
      return;
    }

    profiles.push(profile);
    setSavedProfiles(profiles);
    renderSavedProfiles();
    formMessage.textContent = messages.saved;
  };

  if (photoFile) {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      profile.image = reader.result;
      finishSave();
    });
    reader.readAsDataURL(photoFile);
    return;
  }

  finishSave();
});

profileForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const { name, age, birthday, careers, hobbies, bio } = collectProfileFromForm();
  const photoFile = profileForm.photo.files[0];

  if (!name || !age || !birthday) {
    formMessage.textContent = messages.required;
    return;
  }

  const nextProfile = {
    name,
    age,
    birthday,
    careers,
    hobbies,
    bio,
    image: profileImage.getAttribute("src"),
  };

  const finishApply = () => {
    applyProfile(nextProfile);
    formMessage.textContent = messages.applied;
    location.hash = "#about";
  };

  if (photoFile) {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      nextProfile.image = reader.result;
      finishApply();
    });
    reader.readAsDataURL(photoFile);
    return;
  }

  finishApply();
});

window.addEventListener("scroll", activateMenu);
window.addEventListener("load", activateMenu);

fillForm(defaults);
applyProfile(defaults);
renderSavedProfiles();
