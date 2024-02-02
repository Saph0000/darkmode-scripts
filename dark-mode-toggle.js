/**
 * Dark Mode Toggle 1.0.2
 * Copyright 2023 Timothy Ricks
 * Released under the MIT License
 * Released on: November 28, 2023
 */

function colorModeToggle() {
  function attr(defaultVal, attrVal) {
    const defaultValType = typeof defaultVal;
    if (typeof attrVal !== "string" || attrVal.trim() === "") return defaultVal;
    if (attrVal === "true" && defaultValType === "boolean") return true;
    if (attrVal === "false" && defaultValType === "boolean") return false;
    if (!isNaN(attrVal) && defaultValType === "number") return +attrVal;
    if (isNaN(attrVal) && defaultValType === "string") return attrVal;
    return defaultVal;
  }

  function setImageForMode(isDark) {
    const logoImage = document.getElementById('Logo-nav');
    if (logoImage) {
      logoImage.src = isDark ? 'images/Logo_JBPF-dark.svg' : 'images/Logo_JBPF.svg';
    }
  }

  const htmlElement = document.documentElement;
  const computed = getComputedStyle(htmlElement);
  let toggleEl;
  let togglePressed = "false";

  const scriptTag = document.querySelector("[tr-color-vars]");
  if (!scriptTag) {
    console.warn("Script tag with tr-color-vars attribute not found");
    return;
  }

  let colorModeDuration = attr(0.5, scriptTag.getAttribute("duration"));
  let colorModeEase = attr("power1.out", scriptTag.getAttribute("ease"));
  const cssVariables = scriptTag.getAttribute("tr-color-vars");

  if (!cssVariables) {
    console.warn("Value of tr-color-vars attribute not found");
    return;
  }

  let lightColors = {};
  let darkColors = {};
  cssVariables.split(",").forEach(function (item) {
    let lightValue = computed.getPropertyValue(`--color--${item}`);
    let darkValue = computed.getPropertyValue(`--dark--${item}`);
    if (lightValue) {
      darkValue = darkValue || lightValue;
      lightColors[`--color--${item}`] = lightValue;
      darkColors[`--color--${item}`] = darkValue;
    }
  });

  if (!Object.keys(lightColors).length) {
    console.warn("No variables found matching tr-color-vars attribute value");
    return;
  }

  function setColors(colorObject, animate) {
    if (typeof gsap !== "undefined" && animate) {
      gsap.to(htmlElement, {
        ...colorObject,
        duration: colorModeDuration,
        ease: colorModeEase
      });
    } else {
      Object.keys(colorObject).forEach(function (key) {
        htmlElement.style.setProperty(key, colorObject[key]);
      });
    }
  }

  function goDark(dark, animate) {
    setImageForMode(dark); // Update logo image based on dark mode status
    if (dark) {
      localStorage.setItem("dark-mode", "true");
      htmlElement.classList.add("dark-mode");
      setColors(darkColors, animate);
      togglePressed = "true";
    } else {
      localStorage.setItem("dark-mode", "false");
      htmlElement.classList.remove("dark-mode");
      setColors(lightColors, animate);
      togglePressed = "false";
    }
    if (toggleEl) {
      toggleEl.forEach(function (element) {
        element.setAttribute("aria-pressed", togglePressed);
      });
    }
  }

  const colorPreference = window.matchMedia("(prefers-color-scheme: dark)");
  colorPreference.addEventListener("change", (e) => {
    goDark(e.matches, false);
  });

  let storagePreference = localStorage.getItem("dark-mode");
  if (storagePreference) {
    goDark(storagePreference === "true", false);
  } else {
    goDark(colorPreference.matches, false);
  }

  window.addEventListener("DOMContentLoaded", () => {
    toggleEl = document.querySelectorAll("[tr-color-toggle]");
    toggleEl.forEach(function (element) {
      element.setAttribute("aria-label", "View Dark Mode");
      element.setAttribute("role", "button");
      element.setAttribute("aria-pressed", togglePressed);
      element.addEventListener("click", function () {
        goDark(htmlElement.classList.contains("dark-mode") ? false : true, true);
      });
    });
  });
}

colorModeToggle();

