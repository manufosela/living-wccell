import { html, LitElement } from 'lit';
import { LivingWccellStyles } from './living-wccell-styles.js';

export class LivingWccell extends LitElement {

  static get properties() {
    return  {
      position: { type: Object },
      diameter: { type: String },
      type: { type: String },
      cycle: { type: Object },
      age: { type: Number },
      memory: { type: Array }
    }
  };

  static get styles() {
    return [LivingWccellStyles];
 }

  constructor() {
    super();
    this.id = `wccell-${  this.randomNum(1, 1000)  }-${  new Date().getTime()}`;
    this.position = {
      top: `${this.randomNum(50, 600)}px`,
      left: `${this.randomNum(50, 800)}px`
    };
    this.diameter = '10px';
    this.type = this.randomNum(0, 3);
    this.color = this.randomNum(0, 36);
    this.age = 0;
    const maxLife = 25;
    const minLife = 18;
    this.cycle = {
      life: this.randomNum(minLife, maxLife),
      reproduction: this.randomNum(minLife - 10, maxLife - 10)
    };
    this._growthTime = 1000;
    this._moveTime = 300;
    this.memory = [];

    this._deathTime = this.cycle.life * 1000;

    this.death = this.death.bind(this);
    this.growth = this.growth.bind(this);
    this.move = this.move.bind(this);
    this._searchForACell = this._setForACell.bind(this);
    this._stopLife = this._stopLife.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    this._deathTimer = setTimeout(this.death, this._deathTime);
    this.growthId = setInterval(this.growth, this._growthTime);
    this.moveId = setInterval(this.move, this._moveTime);
    document.addEventListener('living-wccell-move', this._searchForACell);
    document.addEventListener('living-wccell-STOP', this._stopLife);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._stopLife();
  }

  firstUpdated() {
    this._setStyles();
  }

  death() {
    this.dispatchEvent(new CustomEvent('living-wccell-death', { detail: this.id }));
    this.remove();
  }

  move() {
    this.position.top = `${parseInt(this.position.top, 10) + this.randomNum(-10, 10)}px`;
    this.position.left = `${parseInt(this.position.left, 10) + this.randomNum(-10, 10)}px`;
    // dispatch event to notify other cells
    document.dispatchEvent(
      new CustomEvent('living-wccell-move', {
        detail: {
          id: this.id,
          position: this.position,
          diameter: this.diameter,
          age: this.age
        }
      })
    );
    this._setStyles();
  }

  growth() {
    this.age += 1;
    if (parseInt(this.diameter, 10) < 50) {
      this.diameter = `${parseInt(this.diameter, 10) + 5}px`;
      this._setStyles();
    }
  }

  _setStyles() {
    const styles = this.shadowRoot.querySelector('.cell').style;
    styles.top = `${this.position.top}`;
    styles.left = `${this.position.left}`;
    styles.width = this.diameter;
    styles.height = this.diameter;
    styles.backgroundColor = `hsl(${this.color * 10}, 100%, 50%)`;
    if (this.age === this.cycle.life - 1) {
      styles.animationName = 'death' ;
    }
  }

  _setForACell(e) {
    if (e.detail.id !== this.id) {
      // console.log(this._doItFoundACell(e));
      if (this._doItFoundACell(e)) {
        this._otherCellFound(e);
      }
    }
  }

  _calculateDistance(e) {
    const x = parseInt(this.position.top, 10) - parseInt(e.detail.position.top, 10);
    const y = parseInt(this.position.left, 10) - parseInt(e.detail.position.left, 10);
    // console.log(this.position, e.detail.position);
    return Math.sqrt(x * x + y * y);
  }

  _doItFoundACell(e) {
    const distance = this._calculateDistance(e);
    const sumRadius = parseInt(this.diameter, 10)/2 + parseInt(e.detail.diameter, 10)/2;
    return (distance <= sumRadius);
  }

  _otherCellFound(e) {
    if (!this.memory.includes(e.detail.id)) {
      if (this.age >= this.cycle.reproduction) {
        this._insertCell(e);
      }
      console.log(`${this.id} found a cell with id ${e.detail.id}`);
      this.memory.push(e.detail.id);
      // dispatch stopLife event
      // document.dispatchEvent(new CustomEvent('living-wccell-STOP'));
    }
  }

  _stopLife() {
    clearInterval(this.growthId);
    clearInterval(this.moveId);
    clearTimeout(this._deathTimer);
    document.removeEventListener('living-wccell-move', this._searchForACell);
  }

  _insertCell(e) {
    const idParts = this.id.split('-');
    const idPartsDetail = e.detail.id.split('-');
    const id = `${idParts[0]}-${idParts[1]}-${idPartsDetail[1]}-${new Date().getTime()}`;
    console.log(id);
    if (!document.getElementById(id)) {
      const livingWCcell = `<living-wccell id="${id}"></living-wccell>`;
      document.body.insertAdjacentHTML('beforeend', livingWCcell);
      setTimeout(() => {
        document.getElementById(id).position = {
          top: `${parseInt(this.position.top, 10) + 50}px`,
          left: `${parseInt(this.position.left, 10) + 50}px`
        };
      }, 100);
    }
  }

  randomNum(min, max) {
    this._null = null;
    return parseInt(Math.random() * (max + 1 - min), 10) + min;
  }

  render() {
    return html`
      <div class="cell">${this.age}</div>
    `;
  }
}
