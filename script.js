/* =========================================================
   Main script for GreenBite — router, UI, recipes,
   calculator, workout generator, breathing and timers.
   ========================================================= */

// Shortcut function so I don’t have to type document.getElementById all the time
const $ = id => document.getElementById(id);

/* =========================
   SPA Router + Nav Toggle
   ========================= */
(function initRouterNav() {
  // I grab all "view" sections (home, recipes, etc.)
  const views = document.querySelectorAll(".view");

  // This function shows only the correct view when I click a link or change hash
  function showView(hash) {
    const target = (hash && document.querySelector(hash)) ? hash : "#home";
    // hide all
    views.forEach(v => v.classList.remove("active"));
    // show current
    document.querySelector(target)?.classList.add("active");

    // Update active nav link
    document.querySelectorAll(".nav-links a").forEach(a => a.classList.remove("active"));
    const navA = document.querySelector(`.nav-links a[href="${target}"]`);
    if (navA) navA.classList.add("active");

    // Close the mobile menu when I navigate
    $("navLinks")?.classList.remove("show");
    $("hamburger")?.setAttribute("aria-expanded", "false");
  }

  // Listen for hash changes (when I click nav links)
  window.addEventListener("hashchange", () => showView(location.hash));
  // Show the right section on first load
  showView(location.hash || "#home");

  // Hamburger toggle (for mobile menu)
  const hamburger = $("hamburger");
  const navLinks = $("navLinks");
  if (hamburger && navLinks) {
    hamburger.addEventListener("click", () => {
      const open = !navLinks.classList.contains("show");
      navLinks.classList.toggle("show");
      hamburger.setAttribute("aria-expanded", String(open));
    });
  }
})();

/* =========================
   Slogan rotation + daily tip
   ========================= */
(function initSloganTip() {
  // Rotating slogans under the hero title
  const slogans = [
    "Eat Well, Live Well",
    "Fuel Your Body Right",
    "Healthy Mind, Healthy Life",
    "Small Habits, Big Change"
  ];
  let sIdx = 0;
  const sEl = $("slogan");
  if (sEl) {
    setInterval(() => {
      sIdx = (sIdx + 1) % slogans.length;
      sEl.textContent = slogans[sIdx];
    }, 4500);
  }

  // Random tip of the day
  const tips = [
    "Drink a glass of water first thing in the morning.",
    "Aim for 7–9 hours of sleep tonight.",
    "Add a serving of greens to your next meal.",
    "Take a 10-minute walk after meals.",
    "Do a 5-minute stretch break each hour.",
    "Plan tomorrow’s workout today."
  ];
  const tipEl = $("tip");
  if (tipEl) tipEl.textContent = tips[Math.floor(Math.random() * tips.length)];
})();

/* =========================
   RECIPES: data + UI
   ========================= */
(function initRecipes() {
  // My recipe database (static for now)
  const recipes = [
    {
      id:1, title: "Avocado Salad", category:"vegan",
      description:"Creamy avocado, lime and herbs.",
      image:"Recipe Images/19960-avocado-salad-VAT-001-4x3-64241afdc3b04d00a9372e1573eac6f7.webp",
      ingredients:["2 ripe avocados","1 lime (juice)","Handful coriander","Salt & pepper","Olive oil"],
      steps:["Cube avocados","Whisk lime juice + oil","Toss with herbs","Season & serve"],
      nutrition:{calories:220,protein:"3g",carbs:"12g",fat:"18g"}
    },
    {
      id:2, title:"Grilled Chicken", category:"highprotein",
      description:"Juicy grilled chicken breast.",
      image:"Recipe Images/grilled-chicken-salad-index-6628169554c88.webp",
      ingredients:["200g chicken breast","1 tbsp olive oil","Paprika","Garlic","Salt & pepper"],
      steps:["Marinate 15 min","Grill 5-7 min/side","Rest 3 min","Slice & serve"],
      nutrition:{calories:320,protein:"42g",carbs:"2g",fat:"14g"}
    },
    {
      id:3, title:"Zoodle Pesto", category:"lowcarb",
      description:"Zucchini noodles with basil pesto.",
      image:"Recipe Images/Pesto-Pasta-Salad-Final-1.webp",
      ingredients:["2 zucchini (spiralized)","2 tbsp pesto","Cherry tomatoes","Parmesan","Salt"],
      steps:["Spiralize zucchini","Sauté 2-3 min","Toss pesto","Top tomatoes & cheese"],
      nutrition:{calories:260,protein:"10g",carbs:"14g",fat:"18g"}
    }
  ];

  // This renders recipe cards
  function renderRecipes(list) {
    const wrap = $("recipesContainer");
    if (!wrap) return;
    wrap.innerHTML = "";
    list.forEach(r => {
      const card = document.createElement("article");
      card.className = "card";
      card.innerHTML = `
        <img src="${r.image}" alt="${r.title}">
        <div class="body">
          <h3>${r.title}</h3>
          <p>${r.description}</p>
          <span class="tag">${r.category}</span>
        </div>`;
      // Clicking opens modal
      card.addEventListener("click", () => openRecipe(r));
      wrap.appendChild(card);
    });
  }
  renderRecipes(recipes);

  // Search and category filter
  const searchEl = $("searchInput");
  const catEl = $("categoryFilter");
  function filterRecipes() {
    const q = (searchEl?.value || "").toLowerCase();
    const cat = catEl?.value || "all";
    const out = recipes.filter(r =>
      (cat === "all" || r.category === cat) &&
      (r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q))
    );
    renderRecipes(out);
  }
  if (searchEl) searchEl.addEventListener("input", filterRecipes);
  if (catEl) catEl.addEventListener("change", filterRecipes);

  // Open recipe modal
  function openRecipe(r) {
    $("recipeTitle").textContent = r.title;
    $("recipeImage").src = r.image;
    $("recipeImage").alt = r.title;

    // Ingredients list
    const ing = $("recipeIngredients");
    if (ing) {
      ing.innerHTML = "";
      r.ingredients.forEach(i => {
        const li = document.createElement("li");
        li.textContent = i;
        ing.appendChild(li);
      });
    }

    // Steps
    const steps = $("recipeSteps");
    if (steps) {
      steps.innerHTML = "";
      r.steps.forEach(s => {
        const li = document.createElement("li");
        li.textContent = s;
        steps.appendChild(li);
      });
    }

    // Nutrition table
    const nut = $("nutritionTable");
    if (nut) {
      nut.innerHTML = `
        <tr><th>Calories</th><td>${r.nutrition.calories}</td></tr>
        <tr><th>Protein</th><td>${r.nutrition.protein}</td></tr>
        <tr><th>Carbs</th><td>${r.nutrition.carbs}</td></tr>
        <tr><th>Fat</th><td>${r.nutrition.fat}</td></tr>
      `;
    }
    $("recipeModal")?.classList.add("open");
  }

  // Close modal
  $("closeModal")?.addEventListener("click", () => $("recipeModal")?.classList.remove("open"));
  $("recipeModal")?.addEventListener("click", (e) => { if (e.target.id === "recipeModal") $("recipeModal")?.classList.remove("open"); });
})();

/* =========================
   CALCULATOR (BMR/TDEE)
   ========================= */
(function initCalculator() {
  // Calculates BMR and TDEE when I click the button
  function calculate() {
    const age = +$("age").value;
    const g = $("gender").value;
    const h = +$("height").value;
    const w = +$("weight").value;
    const act = +$("activity").value;
    if (!age || !h || !w) return;

    // Formula: Mifflin-St Jeor
    const bmr = g === "Male" ? (10*w + 6.25*h - 5*age + 5) : (10*w + 6.25*h - 5*age - 161);
    const tdee = bmr * act;

    // Output numbers
    $("bmr").textContent = Math.round(bmr);
    $("tdee").textContent = Math.round(tdee);

    // Macronutrient split
    const carbs = (tdee * 0.5) / 4;
    const protein = (tdee * 0.2) / 4;
    const fat = (tdee * 0.3) / 9;

    $("carbsG").textContent = Math.round(carbs);
    $("proteinG").textContent = Math.round(protein);
    $("fatG").textContent = Math.round(fat);

    $("carbsBar").style.width = Math.min(100, carbs / 5) + "%";
    $("proteinBar").style.width = Math.min(100, protein / 3) + "%";
    $("fatBar").style.width = Math.min(100, fat / 2) + "%";
  }

  $("calcBtn")?.addEventListener("click", calculate);

  // Clear all inputs/results
  $("clearCalc")?.addEventListener("click", () => {
    ["age","height","weight"].forEach(id => { if ($(id)) $(id).value = ""; });
    ["bmr","tdee","carbsG","proteinG","fatG"].forEach(id => { if ($(id)) $(id).textContent = "—"; });
    ["carbsBar","proteinBar","fatBar"].forEach(id => { if ($(id)) $(id).style.width = 0; });
  });
})();

/* =========================
   WORKOUT GENERATOR & TIMERS
   ========================= */
(function initWorkout() {
  // My workout database
  const workouts = {
    full: [
      { name: "Jumping Jacks", equipment: ["none","any"] },
      { name: "Burpees", equipment: ["none","any"] },
      { name: "Mountain Climbers", equipment: ["none","any"] },
      { name: "Bodyweight Squats", equipment: ["none","any"] },
      { name: "Push-ups", equipment: ["none","any"] },
      { name: "High Knees", equipment: ["none","any"] },
      { name: "Kettlebell Swings", equipment: ["dumbbells"] },
      { name: "Resistance Band Rows", equipment: ["resistance"] }
    ],

     arms: [
      { name: "Alternating Dumbbell Curl", equipment: ["dumbbells"] },
      { name: "Hammer Curl", equipment: ["dumbbells"] },
      { name: "Overhead Press", equipment: ["dumbbells"] },
      { name: "Lateral Raises", equipment: ["dumbbells"] },
      { name: "Front Raises", equipment: ["dumbbells"] },
      { name: "Tricep Dips", equipment: ["none","any"] },
      { name: "Push-ups (Diamond)", equipment: ["none","any"] },
      { name: "Resistance Band Bicep Curl", equipment: ["resistance"] },
      { name: "Resistance Band Tricep Pushdown", equipment: ["resistance"] }
    ],

    legs: [
      { name: "Lunges", equipment: ["none","any"] },
      { name: "Bodyweight Squats", equipment: ["none","any"] },
      { name: "Wall Sit", equipment: ["none"] },
      { name: "Step-Ups", equipment: ["none"] },
      { name: "Glute Bridges", equipment: ["none"] },
      { name: "Goblet Squat (Dumbbell)", equipment: ["dumbbells"] },
      { name: "Dumbbell Deadlift", equipment: ["dumbbells"] },
      { name: "Calf Raises", equipment: ["none","dumbbells"] },
      { name: "Resistance Band Squats", equipment: ["resistance"] },
      { name: "Resistance Band Side Steps", equipment: ["resistance"] }
    ],

      core: [
      { name: "Plank", equipment: ["none","any"] },
      { name: "Leg Raises", equipment: ["none"] },
      { name: "Russian Twists (bodyweight/dumbbell)", equipment: ["none","dumbbells"] },
      { name: "Bicycle Crunches", equipment: ["none"] },
      { name: "Flutter Kicks", equipment: ["none"] },
      { name: "Dumbbell Side Bend", equipment: ["dumbbells"] },
      { name: "Resistance Band Pallof Press", equipment: ["resistance"] },
      { name: "Mountain Climbers", equipment: ["none"] }
    ]
  };


  const PLAN_SIZE = 5; // max exercises per plan
  const planEl = $("plan");
  const timerBox = $("timerBox");
  const currentExerciseEl = $("currentExercise");
  const countdownEl = $("countdown");
  const beep = $("beep");
  let countdownTimer = null, remainingSeconds = 30;

  // Generate workout plan
  function renderPlan(body, equipment) {
    const pool = workouts[body] || [];
    const filtered = pool.filter(ex => ex.equipment.includes("any") || ex.equipment.includes(equipment));
    const selected = filtered.slice(0, PLAN_SIZE);

    const ul = document.createElement("ul");
    ul.className = "exercise-list";
    selected.forEach(ex => {
      const li = document.createElement("li");
      li.innerHTML = `<span>${ex.name}</span><small class="small">${ex.equipment.join(", ")}</small>`;
      li.addEventListener("click", () => {
        document.querySelectorAll(".exercise-list li").forEach(el => el.classList.remove("selected"));
        li.classList.add("selected");
        currentExerciseEl.textContent = ex.name;
        timerBox.hidden = false;
        remainingSeconds = 30;
        countdownEl.textContent = formatTime(remainingSeconds);
      });
      ul.appendChild(li);
    });
    planEl.innerHTML = `<strong>Your Plan</strong>`;
    planEl.appendChild(ul);
  }

  function formatTime(n) {
    return "00:" + String(n).padStart(2, "0");
  }

  $("genWorkout")?.addEventListener("click", () => {
    const body = $("bodyPart")?.value || "full";
    const equipment = $("equipment")?.value || "none";
    renderPlan(body, equipment);
  });

  // Timer logic
  $("startTimer")?.addEventListener("click", () => {
    clearInterval(countdownTimer);
    remainingSeconds = 30;
    countdownEl.textContent = formatTime(remainingSeconds);
    countdownTimer = setInterval(() => {
      remainingSeconds--;
      countdownEl.textContent = formatTime(Math.max(0, remainingSeconds));
      if (remainingSeconds <= 0) {
        clearInterval(countdownTimer);
        beep?.play();
      }
    }, 1000);
  });
  $("stopTimer")?.addEventListener("click", () => { clearInterval(countdownTimer); countdownEl.textContent = "00:30"; });
})();

/* =========================
   GUIDED BREATHING & MEDITATION
   ========================= */
(function initBreathingAndMeditation() {
  const breathCircle = $("breathCircle");
  const breathLabel = $("breathLabel");
  let breathInterval = null, phaseIndex = 0;

  const PHASES = [
    { label: "Inhale", duration: 4000 },
    { label: "Hold", duration: 4000 },
    { label: "Exhale", duration: 4000 }
  ];

  function setPhaseLabel() {
    breathLabel.textContent = PHASES[phaseIndex].label + "...";
  }

  function startBreathing() {
    breathCircle.classList.add("breath-running");
    phaseIndex = 0; setPhaseLabel();
    breathInterval = setInterval(() => {
      phaseIndex = (phaseIndex + 1) % PHASES.length;
      setPhaseLabel();
    }, 4000);
  }

  function stopBreathing() {
    breathCircle.classList.remove("breath-running");
    breathLabel.textContent = "Press Start to Breathe";
    clearInterval(breathInterval);
  }

  $("startBreath")?.addEventListener("click", startBreathing);
  $("stopBreath")?.addEventListener("click", stopBreathing);

  // Meditation timer
  let medInt = null, medRemain = 300, sessions = 0;
  function updateMedClock() {
    const m = Math.floor(medRemain / 60), s = medRemain % 60;
    $("medClock").textContent = String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
  }
  $("startMed")?.addEventListener("click", () => {
    medRemain = (+$("medMin").value || 5) * 60;
    updateMedClock();
    clearInterval(medInt);
    medInt = setInterval(() => {
      medRemain--;
      updateMedClock();
      if (medRemain <= 0) { clearInterval(medInt); $("sessions").textContent = ++sessions; }
    }, 1000);
  });
  $("stopMed")?.addEventListener("click", () => { clearInterval(medInt); });
})();

/* =========================
   AMBIENCE SOUNDS
   ========================= */
(function initAmbience() {
  const sounds = { rain: $("snd-rain"), waves: $("snd-waves") };
  function stopAllSounds() { Object.values(sounds).forEach(s => { s.pause(); s.currentTime = 0; }); }
  document.querySelectorAll("[data-sound]").forEach(btn => {
    btn.addEventListener("click", () => {
      stopAllSounds();
      sounds[btn.dataset.sound]?.play();
    });
  });
  $("stopAllSounds")?.addEventListener("click", stopAllSounds);
})();

/* =========================
   FORMS (contact & newsletter)
   ========================= */
(function initForms() {
  // Contact form saves locally (mock backend)
  $("contactForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = $("cName").value.trim(), email = $("cEmail").value.trim(), msg = $("cMsg").value.trim();
    if (!name || !email || !msg) { $("cConfirm").textContent = "Please fill all fields."; return; }
    localStorage.setItem("contact", JSON.stringify({ name, email, msg, date: new Date().toISOString() }));
    $("cConfirm").textContent = "Thanks! We'll reply soon.";
    $("contactForm").reset();
  });

  // Newsletter saves just the email
  $("newsletterForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const em = $("emailInput").value.trim();
    if (em) { localStorage.setItem("newsletter", em); alert("Subscribed!"); $("newsletterForm").reset(); }
  });
})();
