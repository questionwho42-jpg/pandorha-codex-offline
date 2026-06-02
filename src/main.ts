import { mount } from "svelte";
import App from "./app/App.svelte";
import "./app/styles.css";

const target = document.getElementById("app");

if (target) {
	mount(App, { target });
} else {
	const fallback = document.createElement("p");
	fallback.textContent = "Nao foi possivel iniciar o Pandorha Engine.";
	document.body.append(fallback);
}
