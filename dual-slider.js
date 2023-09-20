import html from 'https://cdn.skypack.dev/snabby'


// adapted into a custom element from https://medium.com/@predragdavidovic10/native-dual-range-slider-html-css-javascript-91e778134816


function init (opts={}) {
    const min = opts.min ?? 0
    const max = opts.max ?? 100
    const from = min
    const to = max
    const step = opts.step ?? 1
    return { min, max, from, to, step }
}


function view (model, update) {
    const _updateFrom = function (ev) {
        model.from = parseFloat(ev.target.value)

        const min = Math.min(model.from, model.to)
        const max = Math.max(model.from, model.to)
        
        model.from = min
        model.to = max

        ev.target.dispatchEvent(new CustomEvent('range', { bubbles: true, composed: true, detail: { from: model.from, to: model.to } }));

        update()
    }

    const _updateTo = function (ev) {
        model.to = parseFloat(ev.target.value)

        const min = Math.min(model.from, model.to)
        const max = Math.max(model.from, model.to)
        
        model.from = min
        model.to = max

        ev.target.dispatchEvent(new CustomEvent('range', { bubbles: true, composed: true, detail: { from: model.from, to: model.to } }));

        update()
    }

    const sliderColor = '#C6C6C6'
    const rangeColor = '#25daa5'

    const rangeDistance = model.max - model.min
    const fromPosition = model.from - model.min
    const toPosition = model.to - model.min

    const background = `linear-gradient(
      to right,
      ${sliderColor} 0%,
      ${sliderColor} ${(fromPosition)/(rangeDistance)*100}%,
      ${rangeColor} ${((fromPosition)/(rangeDistance))*100}%,
      ${rangeColor} ${(toPosition)/(rangeDistance)*100}%, 
      ${sliderColor} ${(toPosition)/(rangeDistance)*100}%, 
      ${sliderColor} 100%)`


    return html`<div class="range_container">
        <div class="sliders_control">
           <input id="fromSlider"
                  type="range"
                  @on:input=${_updateFrom} @props:value=${model.from} @attrs:min=${model.min} @attrs:max=${model.max} @attrs:step=${model.step} />

           <input id="toSlider"
                  type="range"
                  @on:input=${_updateTo}
                  @props:value=${model.to}
                  @attrs:min=${model.min}
                  @attrs:max=${model.max}
                  @style:background=${background}
                  @attrs:step=${model.step} />
        </div>
        <div class="form_control">
          <div class="form_control_container">
              <div class="form_control_container__time">Min</div>
              <input class="form_control_container__time__input" type="number" id="fromInput"
                     @on:input=${_updateFrom} @props:value=${model.from} @attrs:min=${model.min} @attrs:max=${model.max} @attrs:step=${model.step} />
            </div>
            <div class="form_control_container">
              <div class="form_control_container__time">Max</div>
              <input class="form_control_container__time__input" type="number" id="toInput"
                     @on:input=${_updateTo} @props:value=${model.to} @attrs:min=${model.min} @attrs:max=${model.max} @attrs:step=${model.step}/>
            </div>
        </div>
    </div>`
}


export default class DualSlider extends HTMLElement {

    constructor (/*el*/) {
        super();

        if (!this.shadowRoot) {
            // many browsers don't yet support declarative shadow DOM
            // for those we still need to manually construct the shadowRoot
            const shadow = this.attachShadow({ mode: 'open' });
            shadow.innerHTML = `
            <style>
                :host { display: block }

                :host([hidden]) { display: none; }

                .range_container {
                  display: flex;
                  flex-direction: column;
                  width: 80%;
                  margin: 35% auto;
                }

                .sliders_control {
                  position: relative;
                  min-height: 50px;
                }

                .form_control {
                  position: relative;
                  display: flex;
                  justify-content: space-between;
                  font-size: 24px;
                  color: #635a5a;
                }

                input[type=range]::-webkit-slider-thumb {
                  -webkit-appearance: none;
                  pointer-events: all;
                  width: 24px;
                  height: 24px;
                  background-color: #fff;
                  border-radius: 50%;
                  box-shadow: 0 0 0 1px #C6C6C6;
                  cursor: pointer;
                }

                input[type=range]::-moz-range-thumb {
                  -webkit-appearance: none;
                  pointer-events: all;
                  width: 24px;
                  height: 24px;
                  background-color: #fff;
                  border-radius: 50%;
                  box-shadow: 0 0 0 1px #C6C6C6;
                  cursor: pointer;  
                }

                input[type=range]::-webkit-slider-thumb:hover {
                  background: #f7f7f7;
                }

                input[type=range]::-webkit-slider-thumb:active {
                  box-shadow: inset 0 0 3px #387bbe, 0 0 9px #387bbe;
                  -webkit-box-shadow: inset 0 0 3px #387bbe, 0 0 9px #387bbe;
                }

                input[type="number"] {
                  color: #8a8383;
                  width: 80px;
                  height: 30px;
                  font-size: 20px;
                  border: none;
                }

                input[type=number]::-webkit-inner-spin-button, 
                input[type=number]::-webkit-outer-spin-button {  
                   opacity: 1;
                }

                input[type="range"] {
                  -webkit-appearance: none; 
                  appearance: none;
                  height: 2px;
                  width: 100%;
                  position: absolute;
                  background-color: #C6C6C6;
                  pointer-events: none;
                }

                #fromSlider {
                  height: 0;
                  z-index: 1;
                }

            </style>

            <div class="range-container"></div>`;
        }

        const model = {
            currentVnode: /*toVNode(*/this.shadowRoot.querySelector('div')/*)*/,
            slider: init(),
        };
        
        this._model = model;

        const update = function () {
            const { slider } = model;

            const newVnode = view(slider, () => update());
            model.currentVnode = html.update(model.currentVnode, newVnode);
        };

        this._update = update;

        update();
    }


    // invoked each time the custom element is appended into a document-connected element
    connectedCallback () { }


    // invoked each time the custom element is removed from a document-connected element
    disconnectedCallback () { }


    // invoked when one of the custom element's attributes is added, removed, or changed
    attributeChangedCallback (name, oldValue, newValue) {
        if (name === 'min') {
            this._model.slider.min = parseFloat(newValue)
            this._update()
        } else if (name === 'max') {
            this._model.slider.max = parseFloat(newValue)
            this._update()
        } else if (name === 'from') {
            this._model.slider.from = parseFloat(newValue)
            this._update()
        } else if (name === 'to') {
            this._model.slider.to = parseFloat(newValue)
            this._update()
        } else if (name === 'step') {
            this._model.slider.step = parseFloat(newValue)
            this._update()
        }
    }


    // provide the list of attribute names to listen for changes to
    static get observedAttributes () {
        return [ 'min', 'max', 'from', 'to', 'step' ];
    }
}


// avoid double-registering these elements because it results in an exception/console error.
if (!customElements.get('dual-slider'))
    customElements.define('dual-slider', DualSlider);
