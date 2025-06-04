const apiKey = "YOUR_API_KEY_HERE";

let latGlobal = null;
let lonGlobal = null;
let forecastState = 0;

function getWeather() {
  const city = document.getElementById("cityInput").value.trim();
  if (city === "") return;

  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=fr`)
    .then(res => res.json())
    .then(data => {
      if (data.cod !== 200) {
        document.getElementById("weatherResult").innerHTML = "<p>Ville non trouvée !</p>";
        document.getElementById("toggleForecastBtn").style.display = "none";
        document.getElementById("forecastContainer").innerHTML = "";
        forecastState = 0;
        return;
      }
      latGlobal = data.coord.lat;
      lonGlobal = data.coord.lon;
      displayCurrentWeather(data);
      document.getElementById("toggleForecastBtn").style.display = "block";
      forecastState = 1;
      document.getElementById("forecastContainer").innerHTML = "";
      document.getElementById("toggleForecastBtn").textContent = "Afficher la prévision 5 jours";
    })
    .catch(() => {
      document.getElementById("weatherResult").innerHTML = "<p>Erreur de connexion.</p>";
      document.getElementById("toggleForecastBtn").style.display = "none";
      document.getElementById("forecastContainer").innerHTML = "";
      forecastState = 0;
    });
}

document.getElementById("toggleForecastBtn").addEventListener("click", () => {
  if (forecastState === 1) {
    getForecast(latGlobal, lonGlobal, 5);
    forecastState = 2;
    document.getElementById("toggleForecastBtn").textContent = "Afficher la prévision 7 jours";
  } else if (forecastState === 2) {
    document.getElementById("forecastContainer").innerHTML = "<p style='text-align:center; font-weight:bold;'>COMING SOON</p>";
    forecastState = 3;
    document.getElementById("toggleForecastBtn").textContent = "Afficher la prévision 15 jours";
  } else if (forecastState === 3) {
    getForecast(latGlobal, lonGlobal, 5);
    forecastState = 1;
    document.getElementById("toggleForecastBtn").textContent = "Afficher la prévision 5 jours";
  }
});

function displayCurrentWeather(data) {
  const name = data.name;
  const temp = data.main.temp.toFixed(1);
  const desc = data.weather[0].description;
  const icon = data.weather[0].icon;

  const html = `
    <h2>${name}</h2>
    <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${desc}" />
    <p style="text-transform: capitalize;">${desc}</p>
    <p>${temp}°C</p>
  `;
  document.getElementById("weatherResult").innerHTML = html;
}

function getForecast(lat, lon, days) {
  fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly,alerts&appid=${apiKey}&units=metric&lang=fr`)
    .then(res => res.json())
    .then(data => {
      const daily = data.daily.slice(1, days + 1);
      renderForecast(daily);
    })
    .catch(() => {
      document.getElementById("forecastContainer").innerHTML = "<p>Impossible de charger la prévision.</p>";
    });
}

function renderForecast(daily) {
  const container = document.getElementById("forecastContainer");
  container.innerHTML = "";

  daily.forEach(day => {
    const date = new Date(day.dt * 1000);
    const options = { weekday: 'long', day: 'numeric', month: 'short' };
    const dateStr = date.toLocaleDateString('fr-FR', options);

    const icon = day.weather[0].icon;
    const desc = day.weather[0].description;
    const tempDay = day.temp.day.toFixed(1);
    const tempNight = day.temp.night.toFixed(1);

    const dayHtml = `
      <div class="forecast-day">
        <div>${dateStr}</div>
        <img src="https://openweathermap.org/img/wn/${icon}.png" alt="${desc}" title="${desc}" />
        <div style="text-transform: capitalize;">${desc}</div>
        <div>Jour: ${tempDay}°C</div>
        <div>Nuit: ${tempNight}°C</div>
      </div>
    `;

    container.insertAdjacentHTML('beforeend', dayHtml);
  });
}

window.onload = function () {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      pos => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        latGlobal = lat;
        lonGlobal = lon;
        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=fr`)
          .then(res => res.json())
          .then(data => {
            displayCurrentWeather(data);
            document.getElementById("toggleForecastBtn").style.display = "block";
            forecastState = 1;
            document.getElementById("forecastContainer").innerHTML = "";
            document.getElementById("toggleForecastBtn").textContent = "Afficher la prévision 5 jours";
          });
      },
      () => {
        document.getElementById("toggleForecastBtn").style.display = "none";
      }
    );
  } else {
    document.getElementById("toggleForecastBtn").style.display = "none";
  }
};
