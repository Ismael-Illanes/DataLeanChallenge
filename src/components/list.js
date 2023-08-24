import { html, LitElement } from "lit";
import { TailwindElement } from "../shared/tailwind.element";

class List extends TailwindElement(LitElement) {
  constructor() {
    super();
  }

  firstUpdated() {
    super.firstUpdated();
    this.getDataAndCreateElement();
  }

  getDataAndCreateElement() {
    const formData = localStorage.getItem("formData");
    const formDataArray = formData ? JSON.parse(formData) : [];
  
    const listFormsDiv = this.shadowRoot.getElementById("list-forms");
    
    console.log(JSON.parse(formDataArray[1]).id)
    
    formDataArray.forEach(elementData => {
      const parsed = JSON.parse(elementData)
      const card1Div = document.createElement("div");
      card1Div.setAttribute("aria-label", "card 1");
      card1Div.classList.add(
        "focus:outline-none",
        "cursor-pointer",
        "bg-white",
        "dark:bg-gray-800",
        "p-6",
        "shadow",
        "rounded"
      );
      card1Div.setAttribute('id',`${parsed.id}`)
      const borderDiv = document.createElement("div");
      borderDiv.classList.add("border-b", "border-gray-200", "dark:border-gray-700", "pb-6");
      card1Div.addEventListener("click",()=>{
        alert(parsed.id)
      })
  
      const flexDiv = document.createElement("div");
      flexDiv.classList.add("flex", "items-start", "justify-between");
  
      const plDiv = document.createElement("div");
      plDiv.classList.add("pl-3", "w-full");
  
      const pElement = document.createElement("p");
      pElement.classList.add("text-xl", "font-medium", "leading-5", "text-gray-800", "dark:text-white");
      pElement.textContent = `${parsed.formName}`;
  
      const bookmarkDiv = document.createElement("div");
      bookmarkDiv.setAttribute("role", "img");
      bookmarkDiv.setAttribute("aria-label", "bookmark");
  
      const pxDiv = document.createElement("div");
      pxDiv.classList.add("px-2");
  
      const secondPEl = document.createElement("p");
      secondPEl.classList.add("text-sm", "leading-5", "py-4", "text-gray-600", "dark:text-gray-200");
      secondPEl.textContent =
        `${parsed.description}`;
  
      plDiv.appendChild(pElement);
      flexDiv.appendChild(plDiv);
      flexDiv.appendChild(bookmarkDiv);
      borderDiv.appendChild(flexDiv);
      card1Div.appendChild(borderDiv);
      pxDiv.appendChild(secondPEl);
      card1Div.appendChild(pxDiv);
  
    listFormsDiv.appendChild(card1Div)
    });
  }
  
  




render() {
  return html`
  <div
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
    <div id="list-forms" class="p-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

    </div>
  </div>
</div>
    `;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  customElements.define("list-forms", List);
});
