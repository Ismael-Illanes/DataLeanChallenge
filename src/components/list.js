import { html, LitElement } from "lit";
import { TailwindElement } from "../shared/tailwind.element";

class List extends TailwindElement(LitElement) {
  constructor() {
    super();
  }

  async firstUpdated() {
    super.firstUpdated();
    await this.getDataAndCreateElement();
  }

  // Code Review: Again this needs to be outside the component.
  // Code Review: A lot of logic for just one function, the logic should be splitted onto abstract functions
  // as much as possible.
  async getDataAndCreateElement() {
    const URL = "http://localhost:3000/api/v1/findall/forms";
    const response = await fetch(URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const responseJSON = await response.json();
    const listFormsDiv = this.shadowRoot.getElementById("list-forms");

    listFormsDiv.innerHTML = "";

    if (responseJSON.length === 0) {
      // Code Review: What this 'soloPE1' means?
      const soloPEl = document.createElement("p");
      soloPEl.classList.add(
        "text-sm",
        "leading-5",
        "py-4",
        "text-gray-600",
        "dark:text-gray-200",
        "break-words"
      );
      soloPEl.textContent = "No hay formularios por el momento.";
      listFormsDiv.classList.remove(
        "p-2",
        "grid",
        "grid-cols-1",
        "md:grid-cols-2",
        "lg:grid-cols-3",
        "gap-4"
      );
      listFormsDiv.classList.add("text-center", "p-5");

      listFormsDiv.appendChild(soloPEl);
    } else {
      listFormsDiv.classList.add(
        "p-2",
        "grid",
        "grid-cols-1",
        "md:grid-cols-2",
        "lg:grid-cols-3",
        "gap-4"
      );
      listFormsDiv.classList.remove("text-center", "p-5");
      responseJSON.forEach((parsed) => {
        const card1Div = document.createElement("div");
        card1Div.classList.add(
          "focus:outline-none",
          "cursor-pointer",
          "bg-white",
          "dark:bg-gray-800",
          "p-6",
          "shadow",
          "rounded"
        );
        card1Div.setAttribute("id", `${parsed.id}`);
        const borderDiv = document.createElement("div");
        borderDiv.classList.add(
          "border-b",
          "border-gray-200",
          "dark:border-gray-700",
          "pb-6"
        );
        card1Div.addEventListener("click", () => {
          this.sendElementID(parsed.id);
        });

        const flexDiv = document.createElement("div");
        flexDiv.classList.add("flex", "items-start", "justify-between");

        const plDiv = document.createElement("div");
        plDiv.classList.add("pl-3", "w-full");

        const pElement = document.createElement("p");
        pElement.classList.add(
          "text-xl",
          "font-medium",
          "leading-5",
          "text-gray-800",
          "dark:text-white",
          "break-words"
        );
        pElement.textContent = `${parsed.formName}`;

        const bookmarkDiv = document.createElement("div");
        bookmarkDiv.setAttribute("role", "img");
        bookmarkDiv.setAttribute("aria-label", "bookmark");

        const pxDiv = document.createElement("div");
        pxDiv.classList.add("px-2");
        const pxDiv2 = document.createElement("div");
        pxDiv.classList.add("px-2");
        const thirdPEL = document.createElement("p");
        thirdPEL.classList.add(
          "text-xs",
          "leading-5",
          "text-stone-400",
          "break-words"
        );
        thirdPEL.textContent = `Fecha creación: ${parsed.createdAt}`;

        const secondPEl = document.createElement("p");
        secondPEl.classList.add(
          "text-sm",
          "leading-5",
          "py-4",
          "text-gray-600",
          "dark:text-gray-200",
          "break-words"
        );
        secondPEl.textContent = `${parsed.description}`;

        plDiv.appendChild(pElement);
        flexDiv.appendChild(plDiv);
        flexDiv.appendChild(bookmarkDiv);
        borderDiv.appendChild(flexDiv);
        card1Div.appendChild(borderDiv);
        pxDiv.appendChild(secondPEl);
        pxDiv2.appendChild(thirdPEL);
        card1Div.appendChild(pxDiv);
        card1Div.appendChild(pxDiv2);

        listFormsDiv.appendChild(card1Div);
      });
    }
    localStorage.removeItem("formData");
  }

  async sendElementID(id) {
    const URL = `http://localhost:3000/api/v1/${id}`;
    const response = await fetch(URL, {
      method: "POST",
      body: JSON.stringify(id),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const responseJSON = await response.json();
    const responseData = responseJSON.data;
    this.redirectToHomePage(responseData);
  }

  redirectToHomePage(response) {
    const homePageOk = `http://localhost:5173/?formName=${encodeURIComponent(
      response.formName
    )}&description=${encodeURIComponent(
      response.description
    )}&name=${encodeURIComponent(response.name)}&surname=${encodeURIComponent(
      response.surname
    )}&email=${encodeURIComponent(response.email)}&phone=${encodeURIComponent(
      response.phone
    )}&country=${encodeURIComponent(
      response.country
    )}&street=${encodeURIComponent(
      response.street
    )}&gender=${encodeURIComponent(
      response.gender
    )}&favlang=${encodeURIComponent(
      JSON.stringify(response.favlang)
    )}&id=${encodeURIComponent(response.id)}&createdAt=${encodeURIComponent(
      response.createdAt
    )}`;
    const homePageError = "http://localhost:5173/?error=true";
    if (response) {
      window.location.replace(homePageOk);
    } else {
      window.location.replace(homePageError);
    }
  }

  render() {
    return html`
      <div class="bg-custom-color-darkgray lg:py-10 w-full min-h-fit">
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
          <div
            id="list-forms"
            class="p-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          ></div>
        </div>
      </div>
    `;
  }
}

customElements.define("list-forms", List);
