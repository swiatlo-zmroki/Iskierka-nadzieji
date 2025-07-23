document.addEventListener("DOMContentLoaded", () => {
  const sections = [
    { id: "piciorys", file: "data/piciorys.txt" },
    { id: "ksiezniczka", file: "data/ksiezniczka.txt" },
    { id: "choroba", file: "data/choroba.txt" },
    { id: "kronika", file: "data/kronika.txt" },
    { id: "opowiesci", file: "data/opowiesci.txt" }
  ];

  sections.forEach(({ id, file }) => {
    fetch(file)
      .then(res => res.text())
      .then(content => {
        document.getElementById(id).innerHTML = content;
      });
  });

  // Iskierka nadziei
  const iskierki = [
    "Nigdy nie jest za późno, by zacząć od nowa.",
    "Z popiołów powstaje ogień.",
    "Jesteś ważniejszy, niż myślisz.",
    "Każdy dzień to szansa.",
    "Czasem najciemniej jest tuż przed świtem.",
    "Nie bój się upadać, bój się nie próbować."
  ];

  const iskierkaBox = document.getElementById("iskierka");
  let currentIskierka = "";

  function losujIskierke() {
    let nowa;
    do {
      nowa = iskierki[Math.floor(Math.random() * iskierki.length)];
    } while (nowa === currentIskierka);
    currentIskierka = nowa;
    iskierkaBox.textContent = nowa;
  }

  iskierkaBox.addEventListener("click", losujIskierke);
  setInterval(losujIskierke, 30000);
  losujIskierke();

  // Tryb dzień/noc
  const toggle = document.getElementById("themeToggle");
  toggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    document.body.classList.toggle("light");
  });
});
