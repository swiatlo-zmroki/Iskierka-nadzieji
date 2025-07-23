
document.addEventListener('DOMContentLoaded', () => {
  const tabela = document.getElementById('tabela');
  const zapisButton = document.getElementById('zapisz-zmiany');

  let dane = [];

  // Pobieranie danych z JSONa
  fetch('baza.json')
    .then(res => res.json())
    .then(json => {
      dane = json;
      wyswietlDane();
    })
    .catch(err => console.error('Błąd ładowania danych:', err));

  function wyswietlDane() {
    tabela.innerHTML = ''; // wyczyść przed ponownym wczytaniem

    dane.forEach((rekord, index) => {
      const tr = document.createElement('tr');

      const tdIndex = document.createElement('td');
      tdIndex.textContent = index + 1;
      tr.appendChild(tdIndex);

      const tdTytul = document.createElement('td');
      const inputTytul = document.createElement('input');
      inputTytul.value = rekord.tytul || '';
      inputTytul.oninput = (e) => dane[index].tytul = e.target.value;
      tdTytul.appendChild(inputTytul);
      tr.appendChild(tdTytul);

      const tdTresc = document.createElement('td');
      const inputTresc = document.createElement('textarea');
      inputTresc.value = rekord.tresc || '';
      inputTresc.rows = 4;
      inputTresc.oninput = (e) => dane[index].tresc = e.target.value;
      tdTresc.appendChild(inputTresc);
      tr.appendChild(tdTresc);

      const tdAkcje = document.createElement('td');
      const btnUsun = document.createElement('button');
      btnUsun.textContent = 'Usuń';
      btnUsun.onclick = () => {
        dane.splice(index, 1);
        wyswietlDane();
      };
      tdAkcje.appendChild(btnUsun);
      tr.appendChild(tdAkcje);

      tabela.appendChild(tr);
    });
  }

  zapisButton.addEventListener('click', () => {
    const daneJSON = JSON.stringify(dane, null, 2);
    const blob = new Blob([daneJSON], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'baza.json';
    link.click();

    URL.revokeObjectURL(url);
    alert('Zmiany zapisane. Pobierz nową wersję pliku "baza.json" i wrzuć na serwer.');
  });
});
