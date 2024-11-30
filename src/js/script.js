'use strict';



// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class workout {
  _id = Date.now();
  _date = new Date();

  constructor(coords, distance, duration) {
    this.coords = coords;
    this.distance = distance;
    this.duration = duration;
    }
  _setDiscription() {
    //prettier-ignore
    const months = [
      'January','February','March','April','May','June','July','August','September','October','November','December',
    ];

    this.discription = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this._date.getMonth()]
    } ${this._date.getDate()}`;
     
    return this.discription;
  }
}
class Running extends workout {
  type = 'running';
  constructor(coords, distance, duration, Cadence) {
    super(coords, distance, duration);
    this.Cadence = Cadence;
    this._calcPace();
    this._setDiscription();
  }
  _calcPace() {
    // min/km
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Cycling extends workout {
  type = 'cycling';
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;

    this._calcSpeed();

    this._setDiscription();
  }
  _calcSpeed() {
    // km/hr
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}
const c = new Running();
const r = new Cycling();
// console.log(c);
// console.log(r);



class APP {
  #map;
  #mapEvent;
  #workouts = [];

  constructor() {
    this._getPostion();

    form.addEventListener('submit', this._newWorkout.bind(this));

    inputType.addEventListener('change', this._toogleElevationField.bind(this));
  
    containerWorkouts.addEventListener("click",this._popOnclick.bind(this))
 this._getLocalStorage();
  }

  _getPostion() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert("Can't acces your postion");
        }
      );
  }
  _loadMap(postion) {
    // console.log(postion);
    const { latitude } = postion.coords;
    const { longitude } = postion.coords;
    const coord = [latitude, longitude];
    this.#map = L.map('map').setView(coord, 13);

    //   L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    // L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    //   attribution:
    //     '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    // }).addTo(this.#map);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(this.#map);

L.marker([51.5, -0.09]).addTo(this.#map)
  .bindPopup('A pretty CSS popup.<br> Easily customizable.')
  .openPopup();


    //   L.marker(coord)
    //     .addTo(map)
    //     .bindPopup('A pretty CSS popup.<br> Easily customizable.')
    //     .openPopup();

    this.#map.on('click', this._showForm.bind(this));
    
  this.#workouts.forEach(workout=>this._renderMarker(workout))
  }

  _showForm(mapE) {
    form.classList.remove('hidden');
    this.#mapEvent = mapE;
    inputDistance.focus();
    // console.log(mapEvent);
    // // console.log(lat, lng);
  }
  _hideForm() {
    //prettier-ignore
    inputType.value =inputDistance.value =inputDuration.value =inputCadence.value =inputElevation.value ='';
    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => (form.style.display = 'grid'));
  }

  _toogleElevationField() {
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newWorkout(e) {
    const validInput = (...inputs) =>
      inputs.every(input => Number.isFinite(input));
    const allPostive = (...inputs) => inputs.every(input => input > 0);

    e.preventDefault();

    let workout;
    const { lat, lng } = this.#mapEvent.latlng;

    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;

    // console.log(distance, typeof distance);

    if (type === 'running') {
      const cadence = +inputCadence.value;

      if (
        !validInput(distance, duration, cadence) ||
        !allPostive(distance, duration, cadence)
      )
        return alert('inputs have to be postive or valid');

      workout = new Running([lat, lng], distance, duration, cadence);
      // console.log(workout);
    }

    if (type === 'cycling') {
      const elevation = +inputElevation.value;

      if (
        !validInput(distance, duration, elevation) ||
        !allPostive(distance, duration)
      )
        return alert('inputs have to be postive or valid');

      workout = new Cycling([lat, lng], distance, duration, elevation);
      console.log(workout);
    }
    if (!workout) return;

    // console.log('workouts:', this.#workouts);

    this.#workouts.push(workout);

    // console.log(this.#mapEvent);
    this._renderMarker(workout);
    this._renderForm(workout);
    this._hideForm();
    this._setLocalStorage();
  }

  _renderMarker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 350,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(
        `${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'}  ${workout.discription}`
      )
      .openPopup();
  }

  _renderForm(workout) {
    let html = `
    <li class="workout workout--${workout.type}" data-id=${workout._id}>
          <h2 class="workout__title">${workout.discription}</h2>
          <div class="workout__details">
            <span class="workout__icon">${
              workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
            }</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value"${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div>`;

    if (workout.type == 'running') {
      html += `
          <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.Cadence}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>
          `;
    }

    if (workout.type == 'cycling') {
      html += `
           <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed.toFixed(1)}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevationGain}</span>
            <span class="workout__unit">m</span>
          </div>
        </li> 
          `;
    }
    form.insertAdjacentHTML('afterend', html);
  }

  _popOnclick(e) {
  
    const workoutEl = e.target.closest('.workout');

    if (!workoutEl) return;
    // console.log( workout._id);
    console.log(this.#workouts);
    console.log(this.#workouts[0]._id);
  const popWorkout=this.#workouts.find(work=>work._id==workoutEl.dataset.id)

    
   this.#map.setView(popWorkout.coords,13,{
    animate:true,
    pan:false,
    duration:1
   })
  }
_setLocalStorage(){
 localStorage.setItem("workout",JSON.stringify(this.#workouts));
}


_getLocalStorage(){
  const data=JSON.parse(localStorage.getItem("workout"))
  console.log( data)

  if(!data) return;
  this.#workouts=data;

  this.#workouts.forEach(workout=>this._renderForm(workout))
}

_removeLocalStroage(){
  localStorage.removeItem("workout");
  
}
}


const app = new APP();
