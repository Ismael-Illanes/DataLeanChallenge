// Code Review: I think i know why you repetead almost all the code. We can check it out and
// use and optimal workaround on this.

import { html } from "lit";

import { TailwindElement } from "../shared/tailwind.element";
import { toastrOptions } from "../shared/toastrOptions";
class FormRender extends TailwindElement() {
  constructor() {
    super();
  }

  firstUpdated() {
    super.firstUpdated();
    this.checkURLParams();
    this.hideShowCheckboxes();
  }

  enableFieldsAndCreateSaveButton() {
    toastr.options = toastrOptions;
    toastr.success("Edición habilitada.");
    const disabledElements =
      this.shadowRoot.querySelectorAll(".disabledElement");
    const cursorNotAllowedElements = this.shadowRoot.querySelectorAll(
      ".cursor-not-allowed"
    );
    const modifyBtn = this.shadowRoot.getElementById("modifybtn");
    modifyBtn.remove();
    const submitBtn = document.createElement("button");
    submitBtn.id = "submitBtn";
    submitBtn.type = "submit";
    submitBtn.textContent = "Save";
    submitBtn.addEventListener("click", this.updateFormFields);
    submitBtn.classList.add(
      "rounded-md",
      "bg-indigo-600",
      "px-3",
      "py-2",
      "text-sm",
      "font-semibold",
      "text-white",
      "shadow-sm",
      "hover:bg-indigo-500",
      "focus-visible:outline",
      "focus-visible:outline-2",
      "focus-visible:outline-offset-2",
      "focus-visible:outline-indigo-600"
    );

    disabledElements.forEach((input) => {
      input.removeAttribute("disabled");
    });
    cursorNotAllowedElements.forEach((input) => {
      input.classList.remove("cursor-not-allowed");
    });
    const buttonContainer = this.shadowRoot.getElementById("buttonContainer");
    buttonContainer.appendChild(submitBtn);
  }

  // Code Review: Again the API call should be outside the component on a dedicated folder and file.
  // Code Review: The name of the function is not accurate, it update the data of a selected form (?)
  async saveFormData(requestFormData) {
    // Code Review: Is this JSON.stringify() needed?
    const requestFormDataJSON = JSON.stringify(requestFormData);
    const requestFormDataObject = JSON.parse(requestFormDataJSON);
    // Code Review: We can do it better using the actual id on the DOM element and
    // taking it on click (We can disccuss it on a call)
    const idStorage = localStorage.getItem("FormElementId");
    const dateStorage = localStorage.getItem("FormElementDate");
    requestFormDataObject.id = idStorage;
    requestFormDataObject.createdAt = dateStorage;

    // Code Review: Again, unnecesary enconding.
    const urlEncoded = new URLSearchParams(requestFormDataObject).toString();
    const URL = `http://localhost:3000/api/v1/${idStorage}`;
    const response = await fetch(URL, {
      method: "PUT",
      body: urlEncoded,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const responseJSON = await response.json();
    localStorage.removeItem("FormElementId");
    return responseJSON;
  }

  validateFormFields(requestFormData, event) {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    const phoneRegex = /^[0-9]+$/;

    let validationFailed = false;
    let errorMessage = "";

    if (
      !requestFormData.formName ||
      !requestFormData.description ||
      !requestFormData.name ||
      !requestFormData.surname ||
      !requestFormData.country ||
      !requestFormData.street ||
      !requestFormData.email ||
      !requestFormData.phone ||
      !requestFormData.gender ||
      requestFormData.favlang.length === 0
    ) {
      validationFailed = true;
      errorMessage = "Todos los campos son requeridos";
    } else if (!requestFormData.email.match(emailRegex)) {
      const emailInput = event.target.querySelector("#email");

      emailInput.classList.remove("ring-gray-300");
      emailInput.classList.add("ring-red-600");

      emailInput.addEventListener("input", () => {
        emailInput.classList.remove("ring-red-600");
        emailInput.classList.add("ring-gray-300");
      });

      validationFailed = true;
      errorMessage = "Por favor, introduce una dirección de correo válida.";
    } else if (!requestFormData.phone.match(phoneRegex)) {
      const phoneInput = event.target.querySelector("#phone");

      phoneInput.classList.remove("ring-gray-300");
      phoneInput.classList.add("ring-red-600");

      phoneInput.addEventListener("input", () => {
        phoneInput.classList.remove("ring-red-600");
        phoneInput.classList.add("ring-gray-300");
      });

      validationFailed = true;
      errorMessage =
        "Por favor, introduzca un número de teléfono válido (solo números).";
    }

    if (validationFailed) {
      toastr.error(errorMessage);

      return false;
    } else {
      return true;
    }
  }

  async handleSubmit(event) {
    event.preventDefault();
    toastr.options = toastrOptions;

    const formData = new FormData(event.target);

    const requestFormData = {
      formName: formData.get("formname"),
      description: formData.get("descriptionform"),
      name: formData.get("name"),
      surname: formData.get("surname"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      country: formData.get("country"),
      street: formData.get("street"),
      gender: formData.get("gender"),
      favlang: formData.getAll("favlang"),
    };

    const validateChecker = this.validateFormFields(requestFormData, event);

    if (validateChecker) {
      try {
        const response = await this.saveFormData(requestFormData);

        this.redirectToHomePage(response);
      } catch (e) {
        console.error("Error al enviar los datos:", e);
      }
    } else {
      event.preventDefault();
    }
  }
  // Code Review: Same here, API call should go outside.
  async deleteFormData() {
    const idStorage = localStorage.getItem("FormElementIdForDelete");

    const URL = `http://localhost:3000/api/v1/${idStorage}`;
    const response = await fetch(URL, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const responseJSON = await response.json();
    localStorage.removeItem("FormElementIdForDelete");
    this.redirectToHomePageAfterDelete(response);
    return responseJSON;
  }

  checkURLParams() {
    const URLParamsSearcher = new URLSearchParams(window.location.search);
    const mainBox = this.shadowRoot.getElementById("main-box");

    if (URLParamsSearcher.size <= 1) {
      mainBox.classList.add("hidden");
    } else {
      const paramsObject = {};

      for (const [key, value] of URLParamsSearcher.entries()) {
        paramsObject[key] = value;
      }
      const formnameInput = this.shadowRoot.getElementById("formname");
      const descriptionformInput =
        this.shadowRoot.getElementById("descriptionform");
      const nameInput = this.shadowRoot.getElementById("name");
      const surnameInput = this.shadowRoot.getElementById("surname");
      const emailInput = this.shadowRoot.getElementById("email");
      const phoneInput = this.shadowRoot.getElementById("phone");
      const countryInput = this.shadowRoot.getElementById("country");
      const streetInput = this.shadowRoot.getElementById("street");
      const genderInputs = this.shadowRoot.querySelectorAll(
        'input[name="gender"]'
      );
      const favlangInputs = this.shadowRoot.querySelectorAll(
        'input[name="favlang"]'
      );

      formnameInput.value = paramsObject["formName"];
      formnameInput.classList.add("cursor-not-allowed");
      descriptionformInput.value = paramsObject["description"];
      descriptionformInput.classList.add("cursor-not-allowed");
      nameInput.value = paramsObject["name"];
      nameInput.classList.add("cursor-not-allowed");
      surnameInput.value = paramsObject["surname"];
      surnameInput.classList.add("cursor-not-allowed");
      emailInput.value = paramsObject["email"];
      emailInput.classList.add("cursor-not-allowed");
      phoneInput.value = paramsObject["phone"];
      phoneInput.classList.add("cursor-not-allowed");
      countryInput.value = paramsObject["country"];
      countryInput.classList.add("cursor-not-allowed");
      streetInput.value = paramsObject["street"];
      streetInput.classList.add("cursor-not-allowed");

      genderInputs.forEach((input) => {
        if (input.value === paramsObject["gender"]) {
          input.checked = true;
        }
      });

      favlangInputs.forEach((input) => {
        if (
          paramsObject["favlang"] &&
          paramsObject["favlang"].includes(input.value)
        ) {
          input.checked = true;
        }
      });

      window.history.replaceState({}, document.title, window.location.pathname);
      mainBox.classList.remove("hidden");
      localStorage.setItem("FormElementId", paramsObject.id);
      localStorage.setItem("FormElementIdForDelete", paramsObject.id);
      localStorage.setItem("FormElementDate", paramsObject.createdAt);
      return paramsObject.id;
    }
  }

  returnMainpage() {
    window.location.replace("http://localhost:5173/");
  }
  hideShowCheckboxes() {
    const requiredCheckboxes = this.shadowRoot.querySelectorAll(
      'input[type="checkbox"][name="favlang"]:not([value="other"])'
    );
    const otherCheckbox = this.shadowRoot.querySelector(
      'input[type="checkbox"][value="other"]'
    );
    const associatedLabelOther =
      this.shadowRoot.querySelector(`label[for="other"]`);

    const anyCheckedExceptOther = Array.from(requiredCheckboxes).some(
      (cb) => cb.checked
    );
    const otherChecked = otherCheckbox.checked;

    if (otherChecked) {
      requiredCheckboxes.forEach((cb) => {
        cb.style.display = "none";
        cb.checked = false;
        const associatedLabel = this.shadowRoot.querySelector(
          `label[for="${cb.id}"]`
        );
        associatedLabel.style.display = "none";
      });
    } else if (anyCheckedExceptOther) {
      otherCheckbox.style.display = "none";
      otherCheckbox.checked = false;
      associatedLabelOther.style.display = "none";
    } else {
      requiredCheckboxes.forEach((cb) => {
        cb.style.display = "block";
        const associatedLabel = this.shadowRoot.querySelector(
          `label[for="${cb.id}"]`
        );
        associatedLabel.style.display = "block";
      });
      otherCheckbox.style.display = "block";
      associatedLabelOther.style.display = "block";
    }
  }

  redirectToHomePage(response) {
    // Code Review: Never use Absolute URLs, use relatives ones if you need to use it.
    const homePageOk = "http://localhost:5173/?update=true";
    const homePageError = "http://localhost:5173/?error=true";
    if (response) {
      window.location.replace(homePageOk);
    } else {
      window.location.replace(homePageError);
    }
  }

  redirectToHomePageAfterDelete(response) {
    const homePageOk = "http://localhost:5173/?removed=true";
    const homePageError = "http://localhost:5173/?error=true";
    if (response) {
      window.location.replace(homePageOk);
    } else {
      window.location.replace(homePageError);
    }
  }

  render() {
    return html`
      <div
        id="main-box"
        class="bg-custom-color-darkgray hidden lg:py-5 w-full min-h-fit"
      >
        <div
          class=" bg-custom-color-darkgray shadow-lg shadow-indigo-500/10 lg:bordered  max-w-screen-lg p-5 mx-auto"
        >
          <form name="mainForm" method="POST" @submit=${this.handleSubmit}>
            <div class="space-y-12">
              <div class="border-b border-gray-900/10 pb-12">
                <h1
                  id="h1-main"
                  class="font-semibold text-center text-3xl text-custom-color-lightgray"
                >
                  Form Render
                </h1>
                <p class="mt-1 text-sm leading-6 text-gray-600"></p>

                <div class="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 ">
                  <div>
                    <label
                      for="formname"
                      class="block font-semibold text-lg text-sm font-medium text-custom-color-lightgray"
                      >Nombre formulario</label
                    >
                    <div class="mt-2">
                      <div
                        class="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 "
                      >
                        <input
                          disabled
                          id="formname"
                          name="formname"
                          type="text"
                          class="disabledElement block bg-transparent outline-none w-full rounded-md border-0 py-1.5 text-custom-color-lightgray text-md font-semibold shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm p-2"
                          autocomplete="off"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label
                      for="descriptionform"
                      class="block font-semibold text-lg text-sm font-medium  text-custom-color-lightgray"
                      >Descripción</label
                    >
                    <div>
                      <div class="mt-2 space-y-6">
                        <textarea
                          disabled
                          maxlength="100"
                          placeholder="Breve descripción acerca del formulario."
                          id="descriptionform"
                          name="descriptionform"
                          rows="3"
                          class="disabledElement block w-full bg-transparent outline-none rounded-md border-0 py-1.5 text-custom-color-lightgray text-md font-semibold shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm p-2"
                        ></textarea>
                      </div>
                    </div>

                    <h2
                      class="mt-6 text-base font-semibold text-lg font-semibold text-custom-color-lightgray"
                    >
                      Personal Information
                    </h2>
                    <div class="grid mt-2 grid-cols-1 gap-y-8 gap-x-4 ">
                      <div class="sm:col-span-4">
                        <label
                          for="name"
                          class="block text-sm font-medium leading-6 text-custom-color-lightgray text-md font-semibold"
                          >Nombre</label
                        >
                        <div class="mt-2">
                          <input
                            disabled
                            id="name"
                            name="name"
                            type="text"
                            class="disabledElement block bg-transparent outline-none w-full rounded-md border-0 py-1.5 text-custom-color-lightgray text-md font-semibold shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm p-2"
                            autocomplete="off"
                          />
                        </div>
                      </div>

                      <div class="sm:col-span-4">
                        <label
                          for="surname"
                          class="block text-sm font-medium leading-6 text-custom-color-lightgray text-md font-semibold"
                          >Apellido</label
                        >
                        <div class="mt-2">
                          <input
                            disabled
                            id="surname"
                            name="surname"
                            type="text"
                            class="disabledElement block bg-transparent outline-none w-full rounded-md border-0 py-1.5 text-custom-color-lightgray text-md font-semibold shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm p-2"
                            autocomplete="off"
                          />
                        </div>
                      </div>

                      <div class="sm:col-span-4">
                        <label
                          for="email"
                          class="block text-sm font-medium leading-6 text-custom-color-lightgray text-md font-semibold"
                          >Email</label
                        >
                        <div class="mt-2">
                          <input
                            disabled
                            id="email"
                            name="email"
                            type="text"
                            class="disabledElement block bg-transparent outline-none w-full rounded-md border-0 py-1.5 text-custom-color-lightgray text-md font-semibold shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm p-2"
                            autocomplete="off"
                            placeholder="example@example.com"
                          />
                        </div>
                      </div>

                      <div class="sm:col-span-4">
                        <label
                          for="phone"
                          class="block text-sm font-medium leading-6 text-custom-color-lightgray text-md font-semibold"
                          >Teléfono/Móvil</label
                        >
                        <div class="mt-2">
                          <input
                            disabled
                            id="phone"
                            name="phone"
                            type="tel"
                            class="disabledElement block bg-transparent w-full outline-none rounded-md border-0 py-1.5 text-custom-color-lightgray text-md font-semibold shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm p-2"
                            autocomplete="off"
                          />
                        </div>
                      </div>

                      <div class="sm:col-span-4">
                        <label
                          for="country"
                          class="block text-sm font-medium leading-6 text-custom-color-lightgray text-md font-semibold"
                          >País</label
                        >
                        <div class="mt-2">
                          <select
                            disabled
                            id="country"
                            name="country"
                            class="disabledElement block focus:bg-custom-color-darkgray bg-transparent w-full outline-none rounded-md border-0 py-1.5 text-custom-color-lightgray text-md font-semibold shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm p-2"
                          >
                            <option value="España">España</option>
                            <option value="Canada">Canada</option>
                            <option value="Noruega">Noruega</option>
                          </select>
                        </div>
                      </div>

                      <div class="sm:col-span-4">
                        <label
                          for="street"
                          class="block text-sm font-medium leading-6 text-custom-color-lightgray text-md font-semibold"
                          >Domicilio</label
                        >
                        <div class="mt-2">
                          <input
                            disabled
                            id="street"
                            placeholder="Dirección completa"
                            name="street"
                            type="text"
                            class="disabledElement block placeholder:text-gray-400 outline-none bg-transparent w-full rounded-md border-0 py-1.5 text-custom-color-lightgray text-md font-semibold shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm p-2"
                            autocomplete="off"
                          />
                        </div>
                      </div>

                      <div class="sm:col-span-4">
                        <fieldset>
                          <label
                            class="block text-sm font-medium leading-6 text-custom-color-lightgray text-md font-semibold"
                            >Sexo</label
                          >
                          <div class="mt-2 flex justify-around">
                            <label
                              for="male"
                              class="text-custom-color-lightgray text-sm font-semibold"
                            >
                              <input
                                disabled
                                id="male"
                                name="gender"
                                type="radio"
                                value="male"
                                autocomplete="off"
                                class="disabledElement w-3 h-3 bg-gray-100 focus:ring-0 checked:bg-indigo-600 text-indigo-600 border-gray-300  dark:border-gray-600"
                              />
                              Masculino
                            </label>
                            <label
                              for="female"
                              class="text-custom-color-lightgray text-sm font-semibold"
                            >
                              <input
                                disabled
                                id="female"
                                name="gender"
                                type="radio"
                                value="female"
                                autocomplete="off"
                                class="disabledElement w-3 focus:ring-0 checked:bg-indigo-600 text-indigo-600  h-3 bg-gray-100 border-gray-300  dark:border-gray-600"
                              />
                              Femenino
                            </label>
                          </div>
                        </fieldset>
                      </div>

                      <div class="sm:col-span-4">
                        <label
                          for="favlang"
                          class="block text-sm font-medium leading-6 text-custom-color-lightgray text-md font-semibold"
                          >Lenguaje favorito</label
                        >
                        <div class="mt-2 flex justify-evenly">
                          <div class="flex space-x-2 items-center">
                            <label
                              class="text-custom-color-lightgray text-sm font-semibold"
                              for="js"
                              >JavaScript</label
                            >
                            <input
                              disabled
                              @click=${this.hideShowCheckboxes}
                              id="js"
                              value="JavaScript"
                              name="favlang"
                              type="checkbox"
                              class="disabledElement block placeholder:text-gray-400 outline-none   rounded-md border-0 py-1.5 text-indigo-600 text-md font-semibold shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm p-2"
                              autocomplete="off"
                            />
                          </div>
                          <div class="flex space-x-2 items-center">
                            <label
                              class="text-custom-color-lightgray text-sm font-semibold"
                              for="php"
                              >PHP</label
                            >
                            <input
                              disabled
                              @click=${this.hideShowCheckboxes}
                              id="php"
                              value="PHP"
                              name="favlang"
                              type="checkbox"
                              class="disabledElement block placeholder:text-gray-400 outline-none  rounded-md border-0 py-1.5 text-indigo-600 text-md font-semibold shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm p-2"
                              autocomplete="off"
                            />
                          </div>
                          <div class="flex space-x-2 items-center">
                            <label
                              class="text-custom-color-lightgray text-sm font-semibold"
                              for="python"
                              >Python</label
                            >
                            <input
                              disabled
                              @click=${this.hideShowCheckboxes}
                              id="python"
                              value="Python"
                              name="favlang"
                              type="checkbox"
                              class="disabledElement block placeholder:text-gray-400 outline-none   rounded-md border-0 py-1.5 text-indigo-600 text-md font-semibold shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm p-2"
                              autocomplete="off"
                            />
                          </div>

                          <div class="flex space-x-2 items-center">
                            <label
                              class="text-custom-color-lightgray text-sm font-semibold"
                              for="other"
                              >Otro</label
                            >
                            <input
                              disabled
                              @click=${this.hideShowCheckboxes}
                              id="other"
                              value="other"
                              name="favlang"
                              type="checkbox"
                              class="disabledElement block placeholder:text-gray-400 outline-none   rounded-md border-0 py-1.5 text-indigo-600 text-md font-semibold shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm p-2"
                              autocomplete="off"
                            />
                          </div>
                        </div>
                      </div>

                      <div
                        id="buttonContainer"
                        class="mt-6 flex w-full sm:col-span-4 items-center justify-center gap-x-6"
                      >
                        <button
                          @click=${this.returnMainpage}
                          type="button"
                          class="rounded-md bg-transparent px-3 py-2 text-sm font-semibold text-white shadow-sm ring-1 ring-gray-600 hover:ring-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-200"
                        >
                          Close
                        </button>
                        <button
                          id="modifybtn"
                          type="button"
                          @click=${this.enableFieldsAndCreateSaveButton}
                          class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        >
                          Modify
                        </button>
                        <button
                          @click=${this.deleteFormData}
                          type="button"
                          class="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    `;
  }
}

customElements.define("render-form", FormRender);
