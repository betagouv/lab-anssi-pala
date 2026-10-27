import './marianne.css';
import './app.css';
import { mount } from 'svelte';
import App from './App.svelte';

const cible = document.getElementById('app');
if (!cible) throw new Error('Élément #app introuvable dans index.html');

const app = mount(App, { target: cible });

export default app;
