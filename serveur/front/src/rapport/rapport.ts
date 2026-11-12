import '../marianne.css';
import '../app.css';
import { mount } from 'svelte';
import LectureRapport from './LectureRapport.svelte';

const cible = document.getElementById('app');
if (!cible) throw new Error('Élément #app introuvable dans index.html');

const app = mount(LectureRapport, { target: cible });

export default app;
