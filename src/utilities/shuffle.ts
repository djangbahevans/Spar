import { Card } from "../models/Card";

export default (arr: Card[]) => {
    if (arr.length > 1) {
        let i: number = arr.length -1;
        while (i > 0) {
            const s: number = Math.round(Math.random() * i+1);
            arr[i]  = [arr[s], arr[s] = arr[i]][0];  // Swap arr[i] with arr[s]
            i--; 
        }
    }
    return arr;
}