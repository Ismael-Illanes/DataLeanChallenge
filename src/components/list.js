import { html, LitElement } from "lit";
import { TailwindElement } from "../shared/tailwind.element";

class List extends TailwindElement(LitElement) {
  constructor() {
    super();
  }

  firstUpdated() {
    this.getDataAndCreateElement();
  }

  getDataAndCreateElement() {

    const formData = localStorage.getItem("formDatas");
    console.log(formData)


    if (formData) {
      this.printStoredData(formData);
    } else {
      return;
    }
  }

  printStoredData(formData) {
    const element = this.shadowRoot.querySelector("#list-forms");
  }
  

  
  

  render() {
    return html`
      <div  id="list-forms"
        class="bg-custom-color-darkgray lg:py-10 w-full min-h-fit"
      >
        <div
          class="flex-col bg-custom-color-darkgray shadow-lg shadow-indigo-500/10 lg:bordered  max-w-screen-lg p-5 mx-auto"
        >
          <div>
            <h1
              class="font-semibold text-center text-3xl text-custom-color-lightgray"
            >
              Listado formularios
            </h1>
            <h1 class="renderBox"></h1>
          </div>
          <div class="p-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

            <div
              aria-label="card 1"
              class="focus:outline-none cursor-pointer bg-white dark:bg-gray-800 p-6 shadow rounded"
            >
              <div class="border-b border-gray-200 dark:border-gray-700 pb-6">
                <div class="flex items-start justify-between">
                  <div class="pl-3 w-full">
                    <p
                      class="text-xl font-medium leading-5 text-gray-800 dark:text-white"
                    >
                      DUMMY
                    </p>
                  </div>
                  <div role="img" aria-label="bookmark"></div>
                </div>
              </div>
              <div class="px-2">
                <p
                  class="focus:outline-none text-sm leading-5 py-4 text-gray-600 dark:text-gray-200"
                >
                  DESCR:
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  customElements.define("list-forms", List);
});
