import { writable } from "svelte/store";
import { GridView } from "../library/gridview";

export const viewport = writable(new GridView(1920, 1080));