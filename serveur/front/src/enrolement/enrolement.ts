import '../marianne.css';
import '../app.css';
import { mount } from 'svelte';
import EnrolementChiffrement from './EnrolementChiffrement.svelte';

const cible = document.getElementById('app');
if (!cible) throw new Error('Élément #app introuvable dans index.html');

const app = mount(EnrolementChiffrement, { target: cible });

export default app;
