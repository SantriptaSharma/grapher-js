import { writable } from "svelte/store";

export const simulation_inputs = writable({density: 1, spring: 0.3, grav: 1, steps: 60});